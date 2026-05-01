import { z } from "zod";

export const accessCheckSchema = z.object({
  userId: z.string().trim().min(1),
  applicationName: z.string().trim().min(1).max(100)
});
