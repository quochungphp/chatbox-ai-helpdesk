import type { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import { failure } from "@ai-service-desk/shared/utils";
import { TYPES } from "../bootstrap-type.js";
import { BankingConfigService } from "../services/config.service.js";

/**
 * Converts unexpected banking-service errors to the shared API response shape.
 */
@injectable()
export class ErrorHandlerMiddleware {
  constructor(@inject(TYPES.ConfigService) private readonly configService: BankingConfigService) {}

  handle(error: Error, req: Request, res: Response, _next: NextFunction): Response {
    this.configService.logger.error("unhandled_error", {
      path: req.path,
      message: error.message
    });

    return res.status(500).json(failure("INTERNAL_SERVER_ERROR", "Internal Server Error"));
  }
}
