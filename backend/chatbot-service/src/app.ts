import cors from "cors";
import express from "express";
import helmet from "helmet";
import type { Express } from "express";
import { health } from "@ai-service-desk/shared/utils";
import { ChatController } from "./controllers/chat.controller.js";
import { ChatService } from "./services/chat.service.js";

const serviceName = "chatbot-service";

export function createApp(): Express {
  const app = express();
  const chatController = new ChatController(new ChatService());

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());

  app.get("/health", (_req, res) => res.json(health(serviceName)));
  app.get("/ready", (_req, res) => res.json(health(serviceName)));
  app.post("/api/chat/message", (req, res) => chatController.sendMessage(req, res));

  return app;
}
