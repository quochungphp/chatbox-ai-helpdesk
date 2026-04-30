import { inject, injectable } from "inversify";
import { PrismaClient } from "@prisma/client";
import { TYPES } from "../bootstrap-type.js";
import { AuthConfigService } from "./config.service.js";

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
