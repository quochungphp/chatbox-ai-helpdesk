import type { ChatResponse } from "@ai-service-desk/shared/types";
import { ApiClient } from "../runtime/api-client.js";

/**
 * Simulator client for Chatbot Service through API Gateway.
 */
export class ChatbotClient {
  constructor(private readonly apiClient: ApiClient) {}

  async sendMessage(input: { conversationId?: string; message: string; userId: string }): Promise<ChatResponse> {
    return this.apiClient.request<ChatResponse>("/api/chat/message", {
      method: "POST",
      body: input
    });
  }
}
