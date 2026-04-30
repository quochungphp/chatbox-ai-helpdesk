import { z } from "zod";

export const createTicketSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.string().default("General IT"),
  priority: z.enum(["P1", "P2", "P3", "P4"]).default("P3"),
  assignmentGroup: z.string().default("Service Desk L1"),
  conversationId: z.string().optional(),
  createdBy: z.string().optional()
});

export const updateTicketSchema = z.object({
  status: z.enum(["open", "in_progress", "resolved", "closed", "cancelled"]).optional(),
  priority: z.enum(["P1", "P2", "P3", "P4"]).optional(),
  assignmentGroup: z.string().min(1).optional()
});

