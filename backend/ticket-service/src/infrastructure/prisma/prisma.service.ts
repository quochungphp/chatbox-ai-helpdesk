import { PrismaClient } from "../../../generated/prisma-client/index.js";
import { injectable } from "inversify";

/**
 * Prisma client wrapper for ticket-service persistence.
 */
@injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@127.0.0.1:15432/ticket_db"
        }
      }
    });
  }
}
