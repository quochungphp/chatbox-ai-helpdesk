import { inject, injectable } from "inversify";
import { PrismaClient } from "../../generated/prisma-client/index.js";
import { TYPES } from "../bootstrap-type.js";
import { BankingConfigService } from "./config.service.js";

@injectable()
export class PrismaService extends PrismaClient {
  constructor(@inject(TYPES.ConfigService) configService: BankingConfigService) {
    super({
      datasources: {
        db: {
          url: configService.databaseUrl
        }
      }
    });
  }
}
