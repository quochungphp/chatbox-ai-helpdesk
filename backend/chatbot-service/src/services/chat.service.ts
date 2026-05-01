import type { ChatResponse } from "@ai-service-desk/shared/types";
import { createId } from "@ai-service-desk/shared/utils";
import type { ChatMessageInput } from "../types/chat.type.js";
import { EntityExtractionService } from "./entity-extraction.service.js";
import { IntentClassifierService } from "./intent-classifier.service.js";
import { TicketDecisionService } from "./ticket-decision.service.js";

export class ChatService {
  private readonly entityExtractionService = new EntityExtractionService();
  private readonly intentClassifierService = new IntentClassifierService();
  private readonly ticketDecisionService = new TicketDecisionService();

  async handleMessage(input: ChatMessageInput): Promise<ChatResponse> {
    const conversationId = input.conversationId ?? createId("conv");
    const intentResult = this.intentClassifierService.classify(input.message);
    const entities = this.entityExtractionService.extract(input.message);
    const ticketDecision = this.ticketDecisionService.decide({
      entities,
      intent: intentResult.intent,
      message: input.message
    });

    return {
      conversationId,
      answer: this.buildAnswer(intentResult.intent, ticketDecision.shouldCreateTicket),
      intent: intentResult.intent,
      confidence: intentResult.confidence,
      suggestedActions: ticketDecision.suggestedActions,
      sources: []
    };
  }

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
