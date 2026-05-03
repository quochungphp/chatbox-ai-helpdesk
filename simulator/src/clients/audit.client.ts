import { ApiClient } from "../runtime/api-client.js";

export type AuditLog = {
  id: string;
  eventType: string;
  actorId?: string;
  conversationId?: string;
  ticketId?: string;
};

export class AuditClient {
  constructor(private readonly apiClient: ApiClient) {}

  listLogs(limit = 100) {
    return this.apiClient.request<AuditLog[]>(`/api/admin/audit-logs?limit=${limit}`);
  }
}
