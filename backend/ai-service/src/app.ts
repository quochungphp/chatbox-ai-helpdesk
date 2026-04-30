import cors from "cors";
import express from "express";
import type { Express } from "express";
import helmet from "helmet";
import { z } from "zod";
import type { SupportIntent } from "@ai-service-desk/shared/types";
import { health, success } from "@ai-service-desk/shared/utils";

const serviceName = "ai-service";

const messageSchema = z.object({
  message: z.string().min(1)
});

const answerSchema = z.object({
  message: z.string().min(1),
  context: z.array(z.string()).default([])
});

export function createApp(): Express {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());

  app.get("/health", (_req, res) => res.json(health(serviceName)));
  app.get("/ready", (_req, res) => res.json(health(serviceName)));

  app.post("/api/ai/classify-intent", (req, res) => {
    const input = messageSchema.parse(req.body);
    res.json(success(classifyIntent(input.message)));
  });

  app.post("/api/ai/extract-entities", (req, res) => {
    const input = messageSchema.parse(req.body);
    res.json(success(extractEntities(input.message)));
  });

  app.post("/api/ai/generate-answer", (req, res) => {
    const input = answerSchema.parse(req.body);
    const grounded = input.context.length > 0;
    res.json(
      success({
        answer: grounded
          ? `Based on the knowledge base, try these steps: ${input.context[0]}`
          : "I do not have enough verified knowledge base context to answer confidently. I recommend creating a service desk ticket.",
        confidence: grounded ? 0.82 : 0.35
      })
    );
  });

  return app;
}

function classifyIntent(message: string): { intent: SupportIntent; confidence: number } {
  const text = message.toLowerCase();
  if (text.includes("vpn")) return { intent: "vpn_issue", confidence: 0.9 };
  if (text.includes("email") || text.includes("outlook")) return { intent: "email_issue", confidence: 0.86 };
  if (text.includes("password")) return { intent: "password_reset", confidence: 0.9 };
  if (text.includes("mfa") || text.includes("authenticator")) return { intent: "mfa_issue", confidence: 0.86 };
  if (text.includes("install") || text.includes("software")) return { intent: "software_installation", confidence: 0.78 };
  if (text.includes("access")) return { intent: "access_request", confidence: 0.8 };
  if (text.includes("slow") || text.includes("laptop")) return { intent: "laptop_performance", confidence: 0.76 };
  if (text.includes("network") || text.includes("wifi")) return { intent: "network_issue", confidence: 0.8 };
  return { intent: "unknown", confidence: 0.4 };
}

function extractEntities(message: string) {
  return {
    urgency: /urgent|asap|critical/i.test(message) ? "high" : "normal",
    affectedSystem: /payment|core banking|internet banking/i.exec(message)?.[0] ?? null,
    errorMessage: /error[:\s]+(.+)/i.exec(message)?.[1] ?? null
  };
}
