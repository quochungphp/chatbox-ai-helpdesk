import type { ApiResponse, Ticket } from "@ai-service-desk/shared/types";

export type CreateTicketRequest = {
  assignmentGroup: string;
  category: string;
  conversationId?: string;
  createdBy?: string;
  description: string;
  priority: Ticket["priority"];
  title: string;
};

/**
 * HTTP client for Ticket Service. Chatbot uses it to escalate unresolved or
 * urgent conversations without crossing service boundaries.
 */
export class TicketClient {
  constructor(private readonly baseUrl = process.env.TICKET_SERVICE_URL ?? "http://localhost:4006") {}

  async createTicket(input: CreateTicketRequest): Promise<Ticket> {
    const response = await fetch(`${this.baseUrl}/api/tickets`, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(input)
    });

    const payload = (await response.json()) as ApiResponse<Ticket>;

    if (!response.ok || !payload.success) {
      throw new Error(payload.success ? "Ticket service failed" : payload.error.message);
    }

    return payload.data;
  }
}
