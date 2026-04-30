import { Router } from "express";
import type { ITicketProvider } from "../models/ticket-provider.js";
import { createTicketSchema, updateTicketSchema } from "../validators/ticket.validator.js";
import { success } from "@ai-service-desk/shared/utils";

export function createTicketRouter(ticketProvider: ITicketProvider): Router {
  const router = Router();

  router.get("/", async (_req, res) => {
    res.json(success(await ticketProvider.listTickets()));
  });

  router.post("/", async (req, res) => {
    const input = createTicketSchema.parse(req.body);
    const ticket = await ticketProvider.createTicket(input);
    res.status(201).json(success(ticket));
  });

  router.get("/:id", async (req, res) => {
    const ticket = await ticketProvider.getTicket(req.params.id);

    if (!ticket) {
      res.status(404).json({ success: false, data: null, error: { code: "TICKET_NOT_FOUND", message: "Ticket not found" } });
      return;
    }

    res.json(success(ticket));
  });

  router.patch("/:id", async (req, res) => {
    const input = updateTicketSchema.parse(req.body);
    const ticket = await ticketProvider.updateTicket(req.params.id, input);
    res.json(success(ticket));
  });

  return router;
}

