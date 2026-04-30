import type { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import { failure } from "@ai-service-desk/shared/utils";
import { TYPES } from "../bootstrap-type.js";
import { AuthConfigService } from "../services/config.service.js";
import { HttpError } from "../utils/exceptions/http-error.exception.js";

@injectable()
export class ErrorHandlerMiddleware {
  constructor(@inject(TYPES.ConfigService) private readonly configService: AuthConfigService) {}

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

