import { z } from "zod";

export const messageSchema = z.object({
  message: z.string().trim().min(1).max(2000)
});

export const generateAnswerSchema = z.object({
  message: z.string().trim().min(1).max(2000),
  intent: z.enum([
    "vpn_issue",
    "email_issue",
    "password_reset",
    "software_installation",
    "access_request",
    "laptop_performance",
    "network_issue",
    "mfa_issue",
    "unknown"
  ]),
  context: z.array(z.string().trim().min(1)).max(5).default([])
});
