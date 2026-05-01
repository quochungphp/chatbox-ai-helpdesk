import type { Request, Response } from "express";
import { failure, success } from "@ai-service-desk/shared/utils";
import { AiService } from "../services/ai.service.js";
import { generateAnswerSchema, messageSchema } from "../validators/ai.validator.js";

/**
 * HTTP controller for AI capabilities used by chatbot-service.
 */
export class AiController {
  constructor(private readonly aiService: AiService) {}

  async classifyIntent(req: Request, res: Response): Promise<void> {
    const parsed = messageSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json(failure("VALIDATION_ERROR", "Invalid AI intent request", parsed.error.flatten()));
      return;
    }

    res.json(success(await this.aiService.classifyIntent(parsed.data.message)));
  }

  async extractEntities(req: Request, res: Response): Promise<void> {
    const parsed = messageSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json(failure("VALIDATION_ERROR", "Invalid AI entity request", parsed.error.flatten()));
      return;
    }

    res.json(success(await this.aiService.extractEntities(parsed.data.message)));
  }

  async generateAnswer(req: Request, res: Response): Promise<void> {
    const parsed = generateAnswerSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json(failure("VALIDATION_ERROR", "Invalid AI answer request", parsed.error.flatten()));
      return;
    }

    res.json(success(await this.aiService.generateAnswer(parsed.data)));
  }
}
