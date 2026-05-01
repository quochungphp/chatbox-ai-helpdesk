import cors from "cors";
import express from "express";
import type { Express } from "express";
import helmet from "helmet";
import { health } from "@ai-service-desk/shared/utils";
import { AiController } from "./controllers/ai.controller.js";
import { AiService } from "./services/ai.service.js";

const serviceName = "ai-service";

/**
 * Creates the AI Service app with provider-backed GenAI endpoints.
 */
export function createApp(): Express {
  const app = express();
  const aiController = new AiController(new AiService());

  app.use(helmet());
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_req, res) => res.json(health(serviceName)));
  app.get("/ready", (_req, res) => res.json(health(serviceName)));

  app.post("/api/ai/classify-intent", (req, res) => aiController.classifyIntent(req, res));
  app.post("/api/ai/extract-entities", (req, res) => aiController.extractEntities(req, res));
  app.post("/api/ai/generate-answer", (req, res) => aiController.generateAnswer(req, res));

  return app;
}
