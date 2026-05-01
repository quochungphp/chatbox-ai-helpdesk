import type { Request, Response } from "express";
import { inject } from "inversify";
import { BaseHttpController, controller, httpGet, httpPost, request, requestParam, response } from "inversify-express-utils";
import { failure, success } from "@ai-service-desk/shared/utils";
import { TYPES } from "../bootstrap-type.js";
import { BankingService } from "../services/banking.service.js";
import { accessCheckSchema } from "../validators/banking.validator.js";

/**
 * HTTP adapter for mock banking employee/application context.
 */
@controller("/api/banking")
export class BankingController extends BaseHttpController {
  constructor(@inject(TYPES.BankingService) private readonly bankingService: BankingService) {
    super();
  }

  @httpGet("/applications")
  listApplications(_req: Request, res: Response): void {
    res.json(success(this.bankingService.listApplications()));
  }

  @httpGet("/employees/:userId")
  getEmployee(@requestParam("userId") userId: string, @response() res: Response): void {
    const employee = this.bankingService.getEmployee(userId);

    if (!employee) {
      res.status(404).json(failure("EMPLOYEE_NOT_FOUND", "Employee profile was not found"));
      return;
    }

    res.json(success(employee));
  }

  @httpPost("/access/check")
  checkAccess(@request() req: Request, @response() res: Response): void {
    const parsed = accessCheckSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json(failure("VALIDATION_ERROR", "Invalid access check request", parsed.error.flatten()));
      return;
    }

    res.json(success(this.bankingService.checkAccess(parsed.data)));
  }
}
