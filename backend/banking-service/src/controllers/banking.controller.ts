import type { Request, Response } from "express";
import { inject } from "inversify";
import { BaseHttpController, controller, httpGet, httpPost, request, requestParam, response } from "inversify-express-utils";
import { failure, success } from "@ai-service-desk/shared/utils";
import { TYPES } from "../bootstrap-type.js";
import { BankingService } from "../services/banking.service.js";
import { accessCheckSchema, upsertBankingApplicationSchema, upsertBankingEmployeeSchema } from "../validators/banking.validator.js";

/**
 * HTTP adapter for mock banking employee/application context.
 */
@controller("/api/banking")
export class BankingController extends BaseHttpController {
  constructor(@inject(TYPES.BankingService) private readonly bankingService: BankingService) {
    super();
  }

  @httpGet("/applications")
  async listApplications(_req: Request, res: Response): Promise<Response> {
    return res.json(success(await this.bankingService.listApplications()));
  }

  @httpGet("/employees/:userId")
  async getEmployee(@requestParam("userId") userId: string, @response() res: Response): Promise<Response> {
    const employee = await this.bankingService.getEmployee(userId);

    if (!employee) {
      return res.status(404).json(failure("EMPLOYEE_NOT_FOUND", "Employee profile was not found"));
    }

    return res.json(success(employee));
  }

  @httpPost("/access/check")
  async checkAccess(@request() req: Request, @response() res: Response): Promise<Response> {
    const parsed = accessCheckSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json(failure("VALIDATION_ERROR", "Invalid access check request", parsed.error.flatten()));
    }

    return res.json(success(await this.bankingService.checkAccess(parsed.data)));
  }

  @httpPost("/employees")
  async upsertEmployee(@request() req: Request, @response() res: Response): Promise<Response> {
    const parsed = upsertBankingEmployeeSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json(failure("VALIDATION_ERROR", "Invalid employee input", parsed.error.flatten()));
    }

    return res.status(201).json(success(await this.bankingService.upsertEmployee(parsed.data)));
  }

  @httpPost("/applications")
  async upsertApplication(@request() req: Request, @response() res: Response): Promise<Response> {
    const parsed = upsertBankingApplicationSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json(failure("VALIDATION_ERROR", "Invalid application input", parsed.error.flatten()));
    }

    return res.status(201).json(success(await this.bankingService.upsertApplication(parsed.data)));
  }
}
