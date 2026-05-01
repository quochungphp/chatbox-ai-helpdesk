import type { ChatResponse, SupportIntent, Ticket } from "@ai-service-desk/shared/types";
import { createId } from "@ai-service-desk/shared/utils";
import { RagClient, type RagSearchResult } from "../clients/rag.client.js";
import { TicketClient } from "../clients/ticket.client.js";
import type { ChatMessageInput, ExtractedEntities } from "../types/chat.type.js";
import { EntityExtractionService } from "./entity-extraction.service.js";
import { IntentClassifierService } from "./intent-classifier.service.js";
import { TicketDecisionService } from "./ticket-decision.service.js";

/**
 * Coordinates the current chatbot MVP flow: classify intent, extract entities,
 * decide whether escalation is needed, and build the response.
 */
export class ChatService {
  private readonly entityExtractionService = new EntityExtractionService();
  private readonly intentClassifierService = new IntentClassifierService();
  private readonly ragClient = new RagClient();
  private readonly ticketClient = new TicketClient();
  private readonly ticketDecisionService = new TicketDecisionService();

  /**
   * Handles one user message and keeps the response contract stable for the UI.
   */
  async handleMessage(input: ChatMessageInput): Promise<ChatResponse> {
    const conversationId = input.conversationId ?? createId("conv");
    const intentResult = this.intentClassifierService.classify(input.message);
    const entities = this.entityExtractionService.extract(input.message);
    const ragResults = await this.ragClient.search(input.message);
    const ticketDecision = this.ticketDecisionService.decide({
      entities,
      intent: intentResult.intent,
      message: input.message
    });
    const primaryRagResult = selectPrimaryRagResult(intentResult.intent, ragResults);
    const answer = primaryRagResult ? this.buildGroundedAnswer(primaryRagResult) : this.buildAnswer(intentResult.intent, ticketDecision.shouldCreateTicket);
    const ticket = ticketDecision.shouldCreateTicket
      ? await this.createEscalationTicket({
          conversationId,
          entities,
          intent: intentResult.intent,
          message: input.message,
          userId: input.userId
        })
      : undefined;

    return {
      conversationId,
      answer,
      intent: intentResult.intent,
      confidence: intentResult.confidence,
      suggestedActions: ticketDecision.suggestedActions,
      ticket,
      sources: ragResults.map((result) => ({
        title: result.article.title,
        source: result.article.source
      }))
    };
  }

  /**
   * Builds a deterministic grounded answer from the highest-scoring RAG chunk.
   */
  private buildGroundedAnswer(result: RagSearchResult): string {
    return `Based on ${result.article.title}: ${result.chunk?.content ?? result.article.content}`;
  }

  /**
   * Creates a ServiceNow-style ticket when the chatbot cannot safely resolve the request.
   */
  private async createEscalationTicket(input: {
    conversationId: string;
    entities: ExtractedEntities;
    intent: SupportIntent;
    message: string;
    userId: string;
  }): Promise<Ticket> {
    const routing = ticketRouting(input.intent, input.entities);

    return this.ticketClient.createTicket({
      title: ticketTitle(input.intent, input.entities),
      description: input.message,
      category: routing.category,
      priority: routing.priority,
      assignmentGroup: routing.assignmentGroup,
      conversationId: input.conversationId,
      createdBy: input.userId
    });
  }

  /**
   * Temporary deterministic answer builder until AI Service and RAG are wired in.
   */
  private buildAnswer(intent: ChatResponse["intent"], shouldCreateTicket: boolean): string {
    if (shouldCreateTicket) {
      return "I do not have enough verified context to resolve this automatically. I recommend creating a service desk ticket.";
    }

    const answers: Record<ChatResponse["intent"], string> = {
      access_request: "I can help with an access request. Please confirm the application name and business reason.",
      email_issue: "Please check Outlook web access first, then confirm whether the issue affects desktop Outlook, mobile email, or both.",
      laptop_performance: "Please restart the laptop, close unused startup apps, and confirm whether disk or CPU usage is constantly high.",
      mfa_issue: "Please confirm whether you changed device recently or lost access to your authenticator app.",
      network_issue: "Please confirm whether the issue happens on office network, home Wi-Fi, or VPN only.",
      password_reset: "Please use the enterprise password reset portal. If reset fails, I can help escalate to Identity Support.",
      software_installation: "Please provide the software name, version, device asset ID, and business justification.",
      unknown: "I need a bit more detail before I can classify this support request.",
      vpn_issue: "Please confirm your internet connection, restart the VPN client, and share the exact VPN error message if it still fails."
    };

    return answers[intent];
  }
}

function ticketRouting(intent: SupportIntent, entities: ExtractedEntities) {
  const priority: Ticket["priority"] = entities.urgency === "high" ? "P2" : intent === "unknown" ? "P3" : "P3";

  const routes: Record<SupportIntent, { assignmentGroup: string; category: string }> = {
    access_request: { assignmentGroup: "Identity Access Management", category: "Access Management" },
    email_issue: { assignmentGroup: "Workplace Service Desk", category: "Email" },
    laptop_performance: { assignmentGroup: "Endpoint Support", category: "Hardware" },
    mfa_issue: { assignmentGroup: "Identity Access Management", category: "Security" },
    network_issue: { assignmentGroup: "Network Access Support", category: "Network" },
    password_reset: { assignmentGroup: "Identity Access Management", category: "Security" },
    software_installation: { assignmentGroup: "Endpoint Support", category: "Software" },
    unknown: { assignmentGroup: "Service Desk L1", category: "General IT" },
    vpn_issue: { assignmentGroup: "Network Access Support", category: "Network" }
  };

  return {
    ...routes[intent],
    priority
  };
}

function ticketTitle(intent: SupportIntent, entities: ExtractedEntities): string {
  const application = entities.applicationName ? ` - ${entities.applicationName}` : "";
  return `${intent.replaceAll("_", " ")}${application}`;
}

function selectPrimaryRagResult(intent: SupportIntent, results: RagSearchResult[]): RagSearchResult | undefined {
  const keywords: Partial<Record<SupportIntent, string[]>> = {
    access_request: ["access", "devops", "payments"],
    mfa_issue: ["mfa", "authenticator"],
    password_reset: ["password"],
    vpn_issue: ["vpn", "secure access"]
  };
  const intentKeywords = keywords[intent] ?? [];

  return (
    results.find((result) => {
      const text = `${result.article.title} ${result.article.source}`.toLowerCase();
      return intentKeywords.some((keyword) => text.includes(keyword));
    }) ?? results[0]
  );
}
