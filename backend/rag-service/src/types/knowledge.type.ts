import type { KnowledgeChunk, KnowledgeDocument } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import type { KnowledgeArticle } from "@ai-service-desk/shared/types";

export type CreateKnowledgeDocumentInput = {
  title: string;
  content: string;
  source: string;
  status?: "draft" | "published" | "archived";
};

export type KnowledgeSearchInput = {
  query: string;
  limit: number;
};

export type ChunkInput = {
  chunkIndex: number;
  content: string;
  tokenCount: number;
  metadata?: Prisma.InputJsonValue;
};

export type KnowledgeSearchCandidate = KnowledgeChunk & {
  document: KnowledgeDocument;
};

export type KnowledgeSearchResult = {
  article: KnowledgeArticle;
  chunk: {
    id: string;
    chunkIndex: number;
    content: string;
  };
  score: number;
};
