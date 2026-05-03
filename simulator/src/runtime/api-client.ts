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
    const url = `${this.baseUrl}${path}`;
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: options.method ?? "GET",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
        ...(options.headers ?? {})
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body)
    });

    const contentType = response.headers.get("content-type") ?? "";
    const responseText = await response.text();

    if (!contentType.includes("application/json")) {
      throw new Error(
        `${options.method ?? "GET"} ${url} expected JSON but received ${contentType || "unknown content type"} ` +
          `with status ${response.status}. Body preview: ${preview(responseText)}`
      );
    }

    const payload = JSON.parse(responseText) as ApiResponse<T>;

    if (!response.ok || !payload.success) {
      const message = payload.success ? response.statusText : payload.error.message;
      throw new Error(`${options.method ?? "GET"} ${url} failed: ${message}`);
    }

    return payload.data;
  }
}

function preview(value: string): string {
  return value.replace(/\s+/g, " ").trim().slice(0, 160);
}
