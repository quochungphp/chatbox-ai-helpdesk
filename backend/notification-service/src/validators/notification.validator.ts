import { z } from "zod";

export const createNotificationSchema = z.object({
  channel: z.enum(["email", "teams", "slack"]),
  recipient: z.string().trim().min(1).max(200),
  subject: z.string().trim().min(1).max(200),
  message: z.string().trim().min(1).max(4000),
  metadata: z.record(z.unknown()).optional()
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
