import type { ApiResponse } from "@ai-service-desk/shared/types";

type ApiRequestOptions = {
  body?: unknown;
  headers?: Record<string, string>;
  method?: "GET" | "POST" | "PATCH" | "DELETE";
};

/**
 * Minimal fetch wrapper used by simulator clients. It keeps e2e calls
 * black-box and validates the shared API response envelope.
 */
export class ApiClient {
  constructor(private readonly baseUrl: string) {}

  async request<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: options.method ?? "GET",
      headers: {
        "content-type": "application/json",
        ...(options.headers ?? {})
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body)
    });

    const payload = (await response.json()) as ApiResponse<T>;

    if (!response.ok || !payload.success) {
      const message = payload.success ? response.statusText : payload.error.message;
      throw new Error(`${options.method ?? "GET"} ${path} failed: ${message}`);
    }

    return payload.data;
  }
}
