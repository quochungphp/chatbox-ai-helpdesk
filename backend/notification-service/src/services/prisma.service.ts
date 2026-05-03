import { inject, injectable } from "inversify";
import { PrismaClient } from "../../generated/prisma-client/index.js";
import { TYPES } from "../bootstrap-type.js";
import { NotificationConfigService } from "./config.service.js";

@injectable()
export class PrismaService extends PrismaClient {
  constructor(@inject(TYPES.ConfigService) configService: NotificationConfigService) {
    super({
      datasources: {
        db: {
          url: configService.databaseUrl
        }
      }
    });
  }
}
