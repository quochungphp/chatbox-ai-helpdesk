import { apiRequest } from "./client";

export type AdminMetrics = {
  totalConversations: number;
  totalTickets: number;
  averageResolutionConfidence: number;
  escalatedIssues: number;
  topIntents: Array<{ intent: string; count: number }>;
  ticketStatusDistribution: Array<{ status: string; count: number }>;
};

export function getAdminMetrics() {
  return apiRequest<AdminMetrics>("/api/admin/metrics");
}

