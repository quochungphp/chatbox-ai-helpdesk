import type { KnowledgeArticle } from "@ai-service-desk/shared/types";
import { apiRequest } from "./client";

export function listKnowledgeArticles() {
  return apiRequest<KnowledgeArticle[]>("/api/kb/articles");
}

