import type { Request, Response } from "express";
import { failure, success } from "@ai-service-desk/shared/utils";
import { KnowledgeService } from "../services/knowledge.service.js";
import { createKnowledgeDocumentSchema, searchKnowledgeSchema } from "../validators/knowledge.validator.js";

export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  async listDocuments(_req: Request, res: Response): Promise<void> {
    const documents = await this.knowledgeService.listDocuments();
    res.json(success(documents));
  }

  async createDocument(req: Request, res: Response): Promise<void> {
    const parsed = createKnowledgeDocumentSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json(failure("VALIDATION_ERROR", "Invalid knowledge document", parsed.error.flatten()));
      return;
    }

    const document = await this.knowledgeService.createDocument(parsed.data);
    res.status(201).json(success(document));
  }

  async search(req: Request, res: Response): Promise<void> {
    const parsed = searchKnowledgeSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json(failure("VALIDATION_ERROR", "Invalid knowledge search request", parsed.error.flatten()));
      return;
    }

    const results = await this.knowledgeService.search(parsed.data);
    res.json(success(results));
  }
}
