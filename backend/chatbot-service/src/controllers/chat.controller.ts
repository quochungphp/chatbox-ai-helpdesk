import type { Request, Response } from "express";
import { failure, success } from "@ai-service-desk/shared/utils";
import { ChatService } from "../services/chat.service.js";
import { chatMessageSchema } from "../validators/chat.validator.js";

/**
 * HTTP adapter for chat requests. Validation and response formatting live here;
 * conversation logic stays inside ChatService.
 */
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /**
   * Validates a chat message request and returns the chatbot response envelope.
   */
  async sendMessage(req: Request, res: Response): Promise<void> {
    const parsed = chatMessageSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json(failure("VALIDATION_ERROR", "Invalid chat message", parsed.error.flatten()));
      return;
    }

    const response = await this.chatService.handleMessage(parsed.data);
    res.json(success(response));
  }
}
