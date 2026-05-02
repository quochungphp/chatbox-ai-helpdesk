export type AuditLogInput = {
  eventType: string;
  actorId?: string;
  conversationId?: string;
  ticketId?: string;
  metadata?: Record<string, unknown>;
};

export class AuditClient {
  constructor(private readonly baseUrl = process.env.AUDIT_SERVICE_URL ?? "http://localhost:4008") {}

  async createLog(input: AuditLogInput): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/api/admin/audit-logs`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input)
      });
    } catch {
      // Audit must never block the chatbot response path.
    }
  }
}
