import type { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../bootstrap-type.js";
import { AuthConfigService } from "../services/config.service.js";

@injectable()
export class LoggerMiddleware {
  constructor(@inject(TYPES.ConfigService) private readonly configService: AuthConfigService) {}

  handler(req: Request, res: Response, next: NextFunction): void {
    this.configService.logger.info("request_received", {
      method: req.method,
      path: req.path,
      correlationId: req.header("x-correlation-id")
    });
    next();
  }
}

