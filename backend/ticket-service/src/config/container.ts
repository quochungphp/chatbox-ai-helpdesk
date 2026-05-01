import "reflect-metadata";
import { Container } from "inversify";
import type { ITicketProvider } from "../models/ticket-provider.js";
import { PrismaService } from "../infrastructure/prisma/prisma.service.js";
import { PrismaTicketProvider } from "../services/prisma-ticket-provider.js";
import { TYPES } from "./types.js";

export const container = new Container({ defaultScope: "Singleton" });

container.bind<PrismaService>(TYPES.PrismaService).to(PrismaService);
container.bind<ITicketProvider>(TYPES.TicketProvider).to(PrismaTicketProvider);
