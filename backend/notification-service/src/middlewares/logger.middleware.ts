import type { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import { CORRELATION_ID_HEADER } from "@ai-service-desk/shared/utils";
import { TYPES } from "../bootstrap-type.js";
import { NotificationConfigService } from "../services/config.service.js";

@injectable()
export class LoggerMiddleware {
  constructor(@inject(TYPES.ConfigService) private readonly configService: NotificationConfigService) {}

  handler(req: Request, res: Response, next: NextFunction): void {
    const startedAt = Date.now();

    res.on("finish", () => {
      this.configService.logger.info("request_completed", {
        correlationId: req.header(CORRELATION_ID_HEADER),
        durationMs: Date.now() - startedAt,
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode
      });
    });

    next();
  }
}
