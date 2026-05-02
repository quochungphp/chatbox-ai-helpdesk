import { inject, injectable } from "inversify";
import type { Prisma } from "../../generated/prisma-client/index.js";
import { TYPES } from "../bootstrap-type.js";
import { PrismaService } from "../services/prisma.service.js";
import type { CreateAuditLogInput } from "../validators/audit.validator.js";

@injectable()
export class AuditRepository {
  constructor(@inject(TYPES.PrismaService) private readonly prisma: PrismaService) {}

  listLogs(limit = 50) {
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: limit
    });
  }

  createLog(input: CreateAuditLogInput) {
    return this.prisma.auditLog.create({
      data: {
        eventType: input.eventType,
        actorId: input.actorId,
        conversationId: input.conversationId,
        ticketId: input.ticketId,
        correlationId: input.correlationId,
        metadata: input.metadata as Prisma.InputJsonValue | undefined
      }
    });
  }

  async metrics() {
    const [totalEvents, ticketEvents, topEvents] = await Promise.all([
      this.prisma.auditLog.count(),
      this.prisma.auditLog.count({ where: { eventType: "ticket.created" } }),
      this.prisma.auditLog.groupBy({
        by: ["eventType"],
        _count: { eventType: true },
        orderBy: { _count: { eventType: "desc" } },
        take: 5
      })
    ]);

    return {
      totalEvents,
      ticketEvents,
      topEvents: topEvents.map((event) => ({
        eventType: event.eventType,
        count: event._count.eventType
      }))
    };
  }
}
