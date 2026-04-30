import cors from "cors";
import express from "express";
import type { Express } from "express";
import helmet from "helmet";
import { z } from "zod";
import type { ChatResponse, SupportIntent, Ticket } from "@ai-service-desk/shared/types";
import { createId, health, success } from "@ai-service-desk/shared/utils";

const serviceName = "chatbot-service";

const chatSchema = z.object({
  conversationId: z.string().optional(),
  userId: z.string().default("usr_001"),
  message: z.string().min(1)
});

export function createApp(): Express {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());

  app.get("/health", (_req, res) => res.json(health(serviceName)));
  app.get("/ready", (_req, res) => res.json(health(serviceName)));

  app.post("/api/chat/message", async (req, res) => {
    const input = chatSchema.parse(req.body);
    const conversationId = input.conversationId ?? createId("conv");
    const intent = classifyIntent(input.message);
    const ragResults = await searchKnowledge(input.message);
    const shouldCreateTicket = intent.intent === "unknown" || ragResults.length === 0 || /ticket|escalate|urgent/i.test(input.message);
    const ticket = shouldCreateTicket ? await createTicket(input, conversationId, intent.intent) : undefined;

    const response: ChatResponse = {
      conversationId,
      answer: buildAnswer(ragResults, ticket),
      intent: intent.intent,
      confidence: intent.confidence,
      suggestedActions: ticket ? ["Track ticket", "Add more details"] : ["Try suggested fix", "Create ticket"],
      ticket,
      sources: ragResults.map((result) => ({
        title: result.article.title,
        source: result.article.source
      }))
    };

    res.json(success(response));
  });

  return app;
}

function classifyIntent(message: string): { intent: SupportIntent; confidence: number } {
  const text = message.toLowerCase();
  if (text.includes("vpn")) return { intent: "vpn_issue", confidence: 0.9 };
  if (text.includes("email") || text.includes("outlook")) return { intent: "email_issue", confidence: 0.84 };
  if (text.includes("password")) return { intent: "password_reset", confidence: 0.9 };
  if (text.includes("mfa") || text.includes("authenticator")) return { intent: "mfa_issue", confidence: 0.86 };
  if (text.includes("access")) return { intent: "access_request", confidence: 0.8 };
  return { intent: "unknown", confidence: 0.4 };
}

async function searchKnowledge(query: string): Promise<Array<{ article: { title: string; content: string; source: string }; score: number }>> {
  const baseUrl = process.env.RAG_SERVICE_URL ?? "http://localhost:4005";
  try {
    const response = await fetch(`${baseUrl}/api/kb/search`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query, limit: 3 })
    });
    const payload = (await response.json()) as { success: boolean; data?: Array<{ article: { title: string; content: string; source: string }; score: number }> };
    return payload.success ? payload.data ?? [] : [];
  } catch {
    return [];
  }
}

async function createTicket(input: z.infer<typeof chatSchema>, conversationId: string, intent: SupportIntent): Promise<Ticket | undefined> {
  const baseUrl = process.env.TICKET_SERVICE_URL ?? "http://localhost:4006";
  try {
    const response = await fetch(`${baseUrl}/api/tickets`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: `Support request: ${intent}`,
        description: input.message,
        category: mapCategory(intent),
        priority: /urgent|critical|asap/i.test(input.message) ? "P2" : "P3",
        assignmentGroup: mapAssignmentGroup(intent),
        conversationId,
        createdBy: input.userId
      })
    });
    const payload = (await response.json()) as { success: boolean; data?: Ticket };
    return payload.success ? payload.data : undefined;
  } catch {
    return undefined;
  }
}

function buildAnswer(results: Array<{ article: { content: string } }>, ticket?: Ticket): string {
  if (ticket) {
    return `I created ticket ${ticket.ticketNumber} for the service desk team.`;
  }
  return results[0]?.article.content ?? "I do not have enough verified context to answer confidently.";
}

function mapCategory(intent: SupportIntent): string {
  const categories: Record<SupportIntent, string> = {
    vpn_issue: "Network",
    email_issue: "Email",
    password_reset: "Access Management",
    software_installation: "Software",
    access_request: "Access Management",
    laptop_performance: "Hardware",
    network_issue: "Network",
    mfa_issue: "Security",
    unknown: "General IT"
  };
  return categories[intent];
}

function mapAssignmentGroup(intent: SupportIntent): string {
  return intent === "access_request" || intent === "mfa_issue" ? "Identity and Access Management" : "Service Desk L1";
}
