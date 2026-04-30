import type { ChatResponse } from "@ai-service-desk/shared/types";
import { apiRequest } from "./client";

export function sendChatMessage(input: { conversationId?: string; userId: string; message: string }) {
  return apiRequest<ChatResponse>("/api/chat/message", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

