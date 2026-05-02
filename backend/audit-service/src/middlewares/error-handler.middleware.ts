import type { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import { failure } from "@ai-service-desk/shared/utils";
import { TYPES } from "../bootstrap-type.js";
import { AuditConfigService } from "../services/config.service.js";

@injectable()
export class ErrorHandlerMiddleware {
  constructor(@inject(TYPES.ConfigService) private readonly configService: AuditConfigService) {}

  handle(error: Error, req: Request, res: Response, _next: NextFunction): Response {
    this.configService.logger.error("unhandled_error", {
      path: req.path,
      message: error.message
    });

    return res.status(500).json(failure("INTERNAL_SERVER_ERROR", "Internal Server Error"));
  }
}
