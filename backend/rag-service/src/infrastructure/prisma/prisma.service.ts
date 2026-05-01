import { PrismaClient } from "@prisma/client";

/**
 * Prisma client wrapper for the RAG database. The default URL matches local
 * Docker Compose while production should provide DATABASE_URL explicitly.
 */
export class PrismaService extends PrismaClient {
  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@127.0.0.1:15432/rag_db"
        }
      }
    });
  }
}
