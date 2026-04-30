import cors from "cors";
import express from "express";
import type { Express } from "express";
import helmet from "helmet";
import { createId, health, success } from "@ai-service-desk/shared/utils";

const serviceName = "notification-service";
const notifications: Array<Record<string, unknown>> = [];

export function createApp(): Express {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());

  app.get("/health", (_req, res) => res.json(health(serviceName)));
  app.get("/ready", (_req, res) => res.json(health(serviceName)));

  app.get("/api/notifications", (_req, res) => res.json(success(notifications)));

  app.post("/api/notifications/send", (req, res) => {
    const notification = {
      id: createId("ntf"),
      status: "queued",
      createdAt: new Date().toISOString(),
      ...req.body
    };
    notifications.unshift(notification);
    res.status(202).json(success(notification));
  });

  return app;
}
