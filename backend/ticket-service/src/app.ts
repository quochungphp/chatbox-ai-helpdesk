import cors from "cors";
import express from "express";
import type { Express } from "express";
import helmet from "helmet";
import type { ITicketProvider } from "./models/ticket-provider.js";
import { container } from "./config/container.js";
import { TYPES } from "./config/types.js";
import { createTicketRouter } from "./routes/ticket.routes.js";
import { health } from "@ai-service-desk/shared/utils";

const serviceName = "ticket-service";

export function createApp(): Express {
  const app = express();
  const ticketProvider = container.get<ITicketProvider>(TYPES.TicketProvider);

  app.use(helmet());
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());

  app.get("/health", (_req, res) => res.json(health(serviceName)));
  app.get("/ready", (_req, res) => res.json(health(serviceName)));
  app.use("/api/tickets", createTicketRouter(ticketProvider));

  return app;
}
