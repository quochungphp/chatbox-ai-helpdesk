import type { Ticket } from "@ai-service-desk/shared/types";
import { ApiClient } from "../runtime/api-client.js";

export type TicketInput = {
  assignmentGroup: string;
  category: string;
  conversationId?: string;
  createdBy?: string;
  description: string;
  priority: Ticket["priority"];
  title: string;
};

/**
 * Simulator client for mock ServiceNow-style ticket endpoints.
 */
export class TicketClient {
  constructor(private readonly apiClient: ApiClient) {}

  async createTicket(input: TicketInput): Promise<Ticket> {
    return this.apiClient.request<Ticket>("/api/tickets", {
      method: "POST",
      body: input
    });
  }

  async listTickets(): Promise<Ticket[]> {
    return this.apiClient.request<Ticket[]>("/api/tickets");
  }
}
