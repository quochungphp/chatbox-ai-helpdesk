import { z } from "zod";

export const chatMessageSchema = z.object({
  conversationId: z.string().min(1).optional(),
  userId: z.string().min(1).default("usr_demo"),
  message: z.string().trim().min(1).max(2000)
});
