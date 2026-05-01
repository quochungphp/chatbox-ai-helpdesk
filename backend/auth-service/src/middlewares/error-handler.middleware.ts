import type { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import { failure } from "@ai-service-desk/shared/utils";
import { TYPES } from "../bootstrap-type.js";
import { AuthConfigService } from "../services/config.service.js";
import { HttpError } from "../utils/exceptions/http-error.exception.js";

/**
 * Converts thrown domain/http errors into the shared API response contract.
 */
@injectable()
export class ErrorHandlerMiddleware {
  constructor(@inject(TYPES.ConfigService) private readonly configService: AuthConfigService) {}

  /**
   * Handles known HttpError instances and masks unexpected errors as 500s.
   */
  handle(error: Error, req: Request, res: Response, _next: NextFunction): Response {
    if (error instanceof HttpError) {
      return res.status(error.statusCode).json(failure(error.code, error.message, error.details));
    }

    this.configService.logger.error("unhandled_error", {
      path: req.path,
      message: error.message
    });

    return res.status(500).json(failure("INTERNAL_SERVER_ERROR", "Internal Server Error"));
  }
}
