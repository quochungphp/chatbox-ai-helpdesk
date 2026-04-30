import type { Ticket } from "@ai-service-desk/shared/types";
import { apiRequest } from "./client";

export function listTickets() {
  return apiRequest<Ticket[]>("/api/tickets");
}

