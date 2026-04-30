import type { Ticket } from "@ai-service-desk/shared/types";

export type CreateTicketInput = {
  title: string;
  description: string;
  category: string;
  priority: Ticket["priority"];
  assignmentGroup: string;
  conversationId?: string;
  createdBy?: string;
};

export type UpdateTicketInput = Partial<Pick<Ticket, "status" | "assignmentGroup" | "priority">>;

export interface ITicketProvider {
  createTicket(input: CreateTicketInput): Promise<Ticket>;
  getTicket(ticketId: string): Promise<Ticket | null>;
  updateTicket(ticketId: string, input: UpdateTicketInput): Promise<Ticket>;
  listTickets(): Promise<Ticket[]>;
}

