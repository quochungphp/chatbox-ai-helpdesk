import cors from "cors";
import express from "express";
import type { Express } from "express";
import helmet from "helmet";
import { createId, health, success } from "@ai-service-desk/shared/utils";

const serviceName = "audit-service";
const auditLogs: Array<Record<string, unknown>> = [
  {
    id: "aud_001",
    eventType: "system.started",
    actorId: "system",
    createdAt: new Date().toISOString(),
    metadata: { source: serviceName }
  }
];

export function createApp(): Express {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());

  app.get("/health", (_req, res) => res.json(health(serviceName)));
  app.get("/ready", (_req, res) => res.json(health(serviceName)));

  app.get("/api/admin/metrics", (_req, res) => {
    res.json(
      success({
        totalConversations: 24,
        totalTickets: 9,
        averageResolutionConfidence: 0.78,
        escalatedIssues: 3,
        topIntents: [
          { intent: "vpn_issue", count: 8 },
          { intent: "mfa_issue", count: 5 },
          { intent: "access_request", count: 4 }
        ],
        ticketStatusDistribution: [
          { status: "open", count: 4 },
          { status: "in_progress", count: 3 },
          { status: "resolved", count: 2 }
        ]
      })
    );
  });

  app.get("/api/admin/audit-logs", (_req, res) => res.json(success(auditLogs)));

  app.post("/api/admin/audit-logs", (req, res) => {
    const log = {
      id: createId("aud"),
      createdAt: new Date().toISOString(),
      ...req.body
    };
    auditLogs.unshift(log);
    res.status(201).json(success(log));
  });

  return app;
}
