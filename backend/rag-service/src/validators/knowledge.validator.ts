import { z } from "zod";

export const createKnowledgeDocumentSchema = z.object({
  title: z.string().trim().min(1).max(200),
  content: z.string().trim().min(20).max(100_000),
  source: z.string().trim().min(1).max(200),
  status: z.enum(["draft", "published", "archived"]).default("published")
});

export const searchKnowledgeSchema = z.object({
  query: z.string().trim().min(1).max(1000),
  limit: z.number().int().positive().max(10).default(3)
});
