import type { KnowledgeDocumentStatus } from "@prisma/client";
import { KnowledgeRepository } from "../repositories/knowledge.repository.js";
import { ChunkingService } from "./chunking.service.js";
import { LexicalSearchService } from "./lexical-search.service.js";
import type { CreateKnowledgeDocumentInput, KnowledgeSearchInput, KnowledgeSearchResult } from "../types/knowledge.type.js";

/**
 * Application service for the RAG workflow: list documents, ingest content into
 * chunks, and retrieve relevant published chunks for chatbot context.
 */
export class KnowledgeService {
  constructor(
    private readonly repository: KnowledgeRepository,
    private readonly chunkingService: ChunkingService,
    private readonly searchService: LexicalSearchService
  ) {}

  /**
   * Lists all documents regardless of status for management screens.
   */
  async listDocuments() {
    return this.repository.listDocuments();
  }

  /**
   * Converts raw article content into overlapping chunks and persists them.
   */
  async createDocument(input: CreateKnowledgeDocumentInput) {
    const chunks = this.chunkingService.chunk(input.content);

    return this.repository.createDocument({
      ...input,
      chunks,
      status: toDocumentStatus(input.status)
    });
  }

  /**
   * Retrieves search candidates and ranks them with the current lexical scorer.
   */
  async search(input: KnowledgeSearchInput): Promise<KnowledgeSearchResult[]> {
    const candidates = await this.repository.findSearchCandidates();
    return this.searchService.rank(input.query, candidates, input.limit);
  }
}

/**
 * Maps public API status values to Prisma enum values.
 */
function toDocumentStatus(status: CreateKnowledgeDocumentInput["status"]): KnowledgeDocumentStatus {
  if (status === "draft") return "DRAFT";
  if (status === "archived") return "ARCHIVED";
  return "PUBLISHED";
}
