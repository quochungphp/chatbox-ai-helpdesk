import { inject, injectable } from "inversify";
import { PrismaClient } from "@prisma/client";
import { TYPES } from "../bootstrap-type.js";
import { AuthConfigService } from "./config.service.js";

/**
 * Prisma client wrapper that injects the auth database URL from ConfigService.
 */
@injectable()
export class PrismaService extends PrismaClient {
  constructor(@inject(TYPES.ConfigService) configService: AuthConfigService) {
    super({
      datasources: {
        db: {
          url: configService.databaseUrl
        }
      }
    });
  }
}
