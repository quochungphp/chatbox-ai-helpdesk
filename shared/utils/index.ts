import type { ApiResponse } from "../types/index.js";

export const CORRELATION_ID_HEADER = "x-correlation-id";

export function createId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
}

export function success<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
    error: null
  };
}

export function failure(code: string, message: string, details?: unknown): ApiResponse<never> {
  return {
    success: false,
    data: null,
    error: {
      code,
      message,
      details
    }
  };
}

export function health(service: string) {
  return {
    service,
    status: "ok",
    timestamp: new Date().toISOString()
  };
}

export function getCorrelationId(headers: Record<string, string | string[] | undefined>): string {
  const value = headers[CORRELATION_ID_HEADER];
  return Array.isArray(value) ? value[0] : value ?? createId("corr");
}
