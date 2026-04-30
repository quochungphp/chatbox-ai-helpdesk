import cors from "cors";
import express from "express";
import type { Express } from "express";
import helmet from "helmet";
import { z } from "zod";
import type { KnowledgeArticle } from "@ai-service-desk/shared/types";
import { createId, health, success } from "@ai-service-desk/shared/utils";

const serviceName = "rag-service";

const articles: KnowledgeArticle[] = [
  {
    id: "kb_vpn_001",
    title: "VPN troubleshooting guide",
    content: "Confirm internet connectivity, restart the VPN client, verify MFA, then retry with the enterprise profile.",
    source: "internal-it/vpn",
    status: "published",
    updatedAt: new Date().toISOString()
  },
  {
    id: "kb_mfa_001",
    title: "MFA setup guide",
    content: "Open the authenticator app, approve the sign-in prompt, or re-register the device through the identity portal.",
    source: "internal-it/mfa",
    status: "published",
    updatedAt: new Date().toISOString()
  }
];

const searchSchema = z.object({
  query: z.string().min(1),
  limit: z.number().int().positive().max(10).default(3)
});

const articleSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  source: z.string().min(1)
});

export function createApp(): Express {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());

  app.get("/health", (_req, res) => res.json(health(serviceName)));
  app.get("/ready", (_req, res) => res.json(health(serviceName)));

  app.get("/api/kb/articles", (_req, res) => res.json(success(articles)));

  app.post("/api/kb/articles", (req, res) => {
    const input = articleSchema.parse(req.body);
    const article: KnowledgeArticle = {
      id: createId("kb"),
      ...input,
      status: "draft",
      updatedAt: new Date().toISOString()
    };
    articles.push(article);
    res.status(201).json(success(article));
  });

  app.post("/api/kb/search", (req, res) => {
    const input = searchSchema.parse(req.body);
    const terms = input.query.toLowerCase().split(/\s+/);
    const results = articles
      .map((article) => ({
        article,
        score: terms.filter((term) => `${article.title} ${article.content}`.toLowerCase().includes(term)).length / terms.length
      }))
      .filter((result) => result.score > 0)
      .sort((left, right) => right.score - left.score)
      .slice(0, input.limit);

    res.json(success(results));
  });

  return app;
}
