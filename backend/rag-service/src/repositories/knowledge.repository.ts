import type { KnowledgeDocument, KnowledgeDocumentStatus } from "@prisma/client";
import { PrismaService } from "../infrastructure/prisma/prisma.service.js";
import type { ChunkInput, KnowledgeSearchCandidate } from "../types/knowledge.type.js";

/**
 * Persistence layer for knowledge documents and chunks. Keeping Prisma here
 * makes it easier to swap lexical search for pgvector later.
 */
export class KnowledgeRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lists knowledge documents newest-first for admin and demo screens.
   */
  async listDocuments(): Promise<KnowledgeDocument[]> {
    return this.prisma.knowledgeDocument.findMany({
      orderBy: {
        updatedAt: "desc"
      }
    });
  }

  /**
   * Creates one document and all its chunks in a nested Prisma write.
   */
  async createDocument(input: {
    chunks: ChunkInput[];
    content: string;
    source: string;
    status: KnowledgeDocumentStatus;
    title: string;
  }): Promise<KnowledgeDocument> {
    return this.prisma.knowledgeDocument.create({
      data: {
        title: input.title,
        content: input.content,
        source: input.source,
        status: input.status,
        chunks: {
          create: input.chunks.map((chunk) => ({
            chunkIndex: chunk.chunkIndex,
            content: chunk.content,
            tokenCount: chunk.tokenCount,
            metadata: chunk.metadata
          }))
        }
      }
    });
  }

  /**
   * Loads only published chunks because drafts/archived docs should not ground AI answers.
   */
  async findSearchCandidates(): Promise<KnowledgeSearchCandidate[]> {
    return this.prisma.knowledgeChunk.findMany({
      where: {
        document: {
          status: "PUBLISHED"
        }
      },
      include: {
        document: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });
  }
}
