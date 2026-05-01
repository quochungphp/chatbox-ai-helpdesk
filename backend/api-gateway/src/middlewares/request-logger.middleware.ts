import type { NextFunction, Request, Response } from "express";
import type { Logger } from "@ai-service-desk/shared/logger";
import { CORRELATION_ID_HEADER } from "@ai-service-desk/shared/utils";

export function requestLoggerMiddleware(logger: Logger) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const startedAt = Date.now();

    res.on("finish", () => {
      logger.info("request_completed", {
        correlationId: req.header(CORRELATION_ID_HEADER),
        durationMs: Date.now() - startedAt,
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode
      });
    });

    next();
  };
}
