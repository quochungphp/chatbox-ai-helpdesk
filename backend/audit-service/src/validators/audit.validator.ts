import { z } from "zod";

export const createAuditLogSchema = z.object({
  eventType: z.string().trim().min(1).max(120),
  actorId: z.string().trim().max(120).optional(),
  conversationId: z.string().trim().max(120).optional(),
  ticketId: z.string().trim().max(120).optional(),
  correlationId: z.string().trim().max(120).optional(),
  metadata: z.record(z.unknown()).optional()
});

export type CreateAuditLogInput = z.infer<typeof createAuditLogSchema>;
