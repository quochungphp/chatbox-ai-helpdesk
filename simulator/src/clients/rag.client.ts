import { ApiClient } from "../runtime/api-client.js";

export type KnowledgeDocumentInput = {
  content: string;
  source: string;
  status: "draft" | "published" | "archived";
  title: string;
};

export type KnowledgeSearchResult = {
  article: {
    title: string;
    source: string;
  };
  chunk: {
    content: string;
  };
  score: number;
};

/**
 * Simulator client for RAG ingestion and search through API Gateway.
 */
export class RagClient {
  constructor(private readonly apiClient: ApiClient) {}

  async listDocuments(): Promise<Array<{ title: string }>> {
    return this.apiClient.request<Array<{ title: string }>>("/api/kb/articles");
  }

  async createDocument(input: KnowledgeDocumentInput): Promise<unknown> {
    return this.apiClient.request("/api/kb/articles", {
      method: "POST",
      body: input
    });
  }

  async search(query: string, limit = 3): Promise<KnowledgeSearchResult[]> {
    return this.apiClient.request<KnowledgeSearchResult[]>("/api/kb/search", {
      method: "POST",
      body: { query, limit }
    });
  }
}
