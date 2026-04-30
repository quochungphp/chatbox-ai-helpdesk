import { injectable } from "inversify";
import type { Ticket } from "@ai-service-desk/shared/types";
import { createId } from "@ai-service-desk/shared/utils";
import type { CreateTicketInput, ITicketProvider, UpdateTicketInput } from "../models/ticket-provider.js";

@injectable()
export class MockServiceNowTicketProvider implements ITicketProvider {
  private readonly tickets: Ticket[] = [];

  async createTicket(input: CreateTicketInput): Promise<Ticket> {
    const ticket: Ticket = {
      id: createId("tkt"),
      ticketNumber: `SNOW${String(this.tickets.length + 1).padStart(6, "0")}`,
      status: "open",
      createdAt: new Date().toISOString(),
      ...input
    };

    this.tickets.unshift(ticket);
    return ticket;
  }

  async getTicket(ticketId: string): Promise<Ticket | null> {
    return this.tickets.find((item) => item.id === ticketId || item.ticketNumber === ticketId) ?? null;
  }

  async updateTicket(ticketId: string, input: UpdateTicketInput): Promise<Ticket> {
    const ticket = await this.getTicket(ticketId);

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    Object.assign(ticket, input);
    return ticket;
  }

  async listTickets(): Promise<Ticket[]> {
    return this.tickets;
  }
}

