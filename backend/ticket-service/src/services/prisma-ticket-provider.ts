import { inject, injectable } from "inversify";
import type { Ticket } from "@ai-service-desk/shared/types";
import { createId } from "@ai-service-desk/shared/utils";
import { Prisma, type Ticket as PrismaTicket } from "../../generated/prisma-client/index.js";
import type { CreateTicketInput, ITicketProvider, UpdateTicketInput } from "../models/ticket-provider.js";
import { PrismaService } from "../infrastructure/prisma/prisma.service.js";
import { TYPES } from "../config/types.js";

/**
 * Prisma-backed ServiceNow-style ticket provider.
 */
@injectable()
export class PrismaTicketProvider implements ITicketProvider {
  constructor(@inject(TYPES.PrismaService) private readonly prisma: PrismaService) {}

  async createTicket(input: CreateTicketInput): Promise<Ticket> {
    const ticket = await this.prisma.ticket.create({
      data: {
        id: createId("tkt"),
        ticketNumber: await this.nextTicketNumber(),
        title: input.title,
        description: input.description,
        category: input.category,
        priority: input.priority,
        status: "open",
        assignmentGroup: input.assignmentGroup,
        conversationId: input.conversationId,
        createdBy: input.createdBy
      }
    });

    await this.writeHistory(ticket.id, "ticket.created", {
      priority: ticket.priority,
      assignmentGroup: ticket.assignmentGroup
    });

    return toTicket(ticket);
  }

  async getTicket(ticketId: string): Promise<Ticket | null> {
    const ticket = await this.prisma.ticket.findFirst({
      where: {
        OR: [{ id: ticketId }, { ticketNumber: ticketId }]
      }
    });

    return ticket ? toTicket(ticket) : null;
  }

  async updateTicket(ticketId: string, input: UpdateTicketInput): Promise<Ticket> {
    const existing = await this.prisma.ticket.findFirst({
      where: {
        OR: [{ id: ticketId }, { ticketNumber: ticketId }]
      }
    });

    if (!existing) {
      throw new Error("Ticket not found");
    }

    const ticket = await this.prisma.ticket.update({
      where: { id: existing.id },
      data: input
    });

    await this.writeHistory(ticket.id, "ticket.updated", input);
    return toTicket(ticket);
  }

  async listTickets(): Promise<Ticket[]> {
    const tickets = await this.prisma.ticket.findMany({
      orderBy: { createdAt: "desc" }
    });

    return tickets.map(toTicket);
  }

  private async nextTicketNumber(): Promise<string> {
    const count = await this.prisma.ticket.count();
    return `SNOW${String(count + 1).padStart(6, "0")}`;
  }

  private async writeHistory(ticketId: string, eventType: string, metadata: Record<string, unknown>): Promise<void> {
    await this.prisma.ticketHistory.create({
      data: {
        id: createId("th"),
        ticketId,
        eventType,
        metadata: metadata as Prisma.InputJsonObject
      }
    });
  }
}

function toTicket(ticket: PrismaTicket): Ticket {
  return {
    id: ticket.id,
    ticketNumber: ticket.ticketNumber,
    title: ticket.title,
    description: ticket.description,
    category: ticket.category,
    priority: ticket.priority as Ticket["priority"],
    status: ticket.status as Ticket["status"],
    assignmentGroup: ticket.assignmentGroup,
    conversationId: ticket.conversationId ?? undefined,
    createdBy: ticket.createdBy ?? undefined,
    createdAt: ticket.createdAt.toISOString()
  };
}
