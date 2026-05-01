import cors from "cors";
import express from "express";
import helmet from "helmet";
import type { Express } from "express";
import { health } from "@ai-service-desk/shared/utils";
import { KnowledgeController } from "./controllers/knowledge.controller.js";
import { PrismaService } from "./infrastructure/prisma/prisma.service.js";
import { KnowledgeRepository } from "./repositories/knowledge.repository.js";
import { ChunkingService } from "./services/chunking.service.js";
import { KnowledgeService } from "./services/knowledge.service.js";
import { LexicalSearchService } from "./services/lexical-search.service.js";

const serviceName = "rag-service";

export function createApp(): Express {
  const app = express();
  const prisma = new PrismaService();
  const repository = new KnowledgeRepository(prisma);
  const knowledgeService = new KnowledgeService(repository, new ChunkingService(), new LexicalSearchService());
  const knowledgeController = new KnowledgeController(knowledgeService);

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_req, res) => res.json(health(serviceName)));
  app.get("/ready", (_req, res) => res.json(health(serviceName)));
  app.get("/api/kb/articles", (req, res) => knowledgeController.listDocuments(req, res));
  app.post("/api/kb/articles", (req, res) => knowledgeController.createDocument(req, res));
  app.post("/api/kb/search", (req, res) => knowledgeController.search(req, res));

  return app;
}
