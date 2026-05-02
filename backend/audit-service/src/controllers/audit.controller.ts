import { inject } from "inversify";
import { BaseHttpController, controller, httpGet, httpPost, queryParam, request, response } from "inversify-express-utils";
import type { Request, Response } from "express";
import { failure, success } from "@ai-service-desk/shared/utils";
import { TYPES } from "../bootstrap-type.js";
import { AuditService } from "../services/audit.service.js";
import { createAuditLogSchema } from "../validators/audit.validator.js";

@controller("/api/admin")
export class AuditController extends BaseHttpController {
  constructor(@inject(TYPES.AuditService) private readonly auditService: AuditService) {
    super();
  }

  @httpGet("/metrics")
  async metrics(@response() res: Response): Promise<Response> {
    return res.json(success(await this.auditService.getMetrics()));
  }

  @httpGet("/audit-logs")
  async listLogs(@queryParam("limit") limit: string | undefined, @response() res: Response): Promise<Response> {
    const parsedLimit = limit ? Number.parseInt(limit, 10) : undefined;
    return res.json(success(await this.auditService.listLogs(Number.isNaN(parsedLimit) ? undefined : parsedLimit)));
  }

  @httpPost("/audit-logs")
  async createLog(@request() req: Request, @response() res: Response): Promise<Response> {
    const input = createAuditLogSchema.safeParse(req.body);

    if (!input.success) {
      return res.status(400).json(failure("VALIDATION_ERROR", "Invalid audit log input", input.error.flatten()));
    }

    return res.status(201).json(success(await this.auditService.createLog(input.data)));
  }
}
