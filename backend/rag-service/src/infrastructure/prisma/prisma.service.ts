import { PrismaClient } from "@prisma/client";

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
