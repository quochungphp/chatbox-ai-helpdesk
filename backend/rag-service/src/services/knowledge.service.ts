import type { KnowledgeDocumentStatus } from "@prisma/client";
import { KnowledgeRepository } from "../repositories/knowledge.repository.js";
import { ChunkingService } from "./chunking.service.js";
import { LexicalSearchService } from "./lexical-search.service.js";
import type { CreateKnowledgeDocumentInput, KnowledgeSearchInput, KnowledgeSearchResult } from "../types/knowledge.type.js";

export class KnowledgeService {
  constructor(
    private readonly repository: KnowledgeRepository,
    private readonly chunkingService: ChunkingService,
    private readonly searchService: LexicalSearchService
  ) {}

  async listDocuments() {
    return this.repository.listDocuments();
  }

  async createDocument(input: CreateKnowledgeDocumentInput) {
    const chunks = this.chunkingService.chunk(input.content);

    return this.repository.createDocument({
      ...input,
      chunks,
      status: toDocumentStatus(input.status)
    });
  }

  async search(input: KnowledgeSearchInput): Promise<KnowledgeSearchResult[]> {
    const candidates = await this.repository.findSearchCandidates();
    return this.searchService.rank(input.query, candidates, input.limit);
  }
}

function toDocumentStatus(status: CreateKnowledgeDocumentInput["status"]): KnowledgeDocumentStatus {
  if (status === "draft") return "DRAFT";
  if (status === "archived") return "ARCHIVED";
  return "PUBLISHED";
}
