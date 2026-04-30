import "reflect-metadata";
import { Container } from "inversify";
import type { ITicketProvider } from "../models/ticket-provider.js";
import { MockServiceNowTicketProvider } from "../services/mock-servicenow-ticket-provider.js";
import { TYPES } from "./types.js";

export const container = new Container({ defaultScope: "Singleton" });

container.bind<ITicketProvider>(TYPES.TicketProvider).to(MockServiceNowTicketProvider);

