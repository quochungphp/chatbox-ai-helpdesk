import type { KnowledgeDocument, KnowledgeDocumentStatus } from "@prisma/client";
import { PrismaService } from "../infrastructure/prisma/prisma.service.js";
import type { ChunkInput, KnowledgeSearchCandidate } from "../types/knowledge.type.js";

export class KnowledgeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listDocuments(): Promise<KnowledgeDocument[]> {
    return this.prisma.knowledgeDocument.findMany({
      orderBy: {
        updatedAt: "desc"
      }
    });
  }

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
