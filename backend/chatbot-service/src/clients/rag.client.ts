import type { ApiResponse } from "@ai-service-desk/shared/types";

export type RagSearchResult = {
  article: {
    id: string;
    title: string;
    content: string;
    source: string;
    status: "draft" | "published" | "archived";
    updatedAt: string;
  };
  chunk?: {
    id: string;
    chunkIndex: number;
    content: string;
  };
  score: number;
};

/**
 * HTTP client for RAG Service. Chatbot Service depends on this abstraction
 * instead of importing RAG internals, preserving microservice boundaries.
 */
export class RagClient {
  constructor(private readonly baseUrl = process.env.RAG_SERVICE_URL ?? "http://localhost:4005") {}

  /**
   * Searches the knowledge base for context that can ground a chatbot answer.
   */
  async search(query: string, limit = 3): Promise<RagSearchResult[]> {
    const response = await fetch(`${this.baseUrl}/api/kb/search`, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({ query, limit })
    });

    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as ApiResponse<RagSearchResult[]>;
    return payload.success ? payload.data : [];
  }
}
