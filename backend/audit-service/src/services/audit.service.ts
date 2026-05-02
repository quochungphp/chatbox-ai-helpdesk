import { inject, injectable } from "inversify";
import { TYPES } from "../bootstrap-type.js";
import { AuditRepository } from "../repositories/audit.repository.js";
import type { CreateAuditLogInput } from "../validators/audit.validator.js";

@injectable()
export class AuditService {
  constructor(@inject(TYPES.AuditRepository) private readonly repository: AuditRepository) {}

  listLogs(limit?: number) {
    return this.repository.listLogs(limit);
  }

  createLog(input: CreateAuditLogInput) {
    return this.repository.createLog(input);
  }

  async getMetrics() {
    const metrics = await this.repository.metrics();

    return {
      ...metrics,
      averageResolutionConfidence: 0,
      escalatedIssues: metrics.ticketEvents
    };
  }
}
