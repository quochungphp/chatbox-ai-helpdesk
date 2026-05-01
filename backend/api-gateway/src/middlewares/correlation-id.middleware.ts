import type { NextFunction, Request, Response } from "express";
import { CORRELATION_ID_HEADER, createId } from "@ai-service-desk/shared/utils";

/**
 * Ensures every request has a correlation ID and returns the same ID to clients.
 */
export function correlationIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const correlationId = req.header(CORRELATION_ID_HEADER) ?? createId("corr");

  req.headers[CORRELATION_ID_HEADER] = correlationId;
  res.setHeader(CORRELATION_ID_HEADER, correlationId);
  next();
}
