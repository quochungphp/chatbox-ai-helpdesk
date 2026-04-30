import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export type LoginInput = z.infer<typeof loginSchema>;

export const userSignupSchema = z.object({
  email: z.string().email().max(100).transform((value) => value.toLowerCase()),
  username: z.string().min(3).max(50),
  password: z.string().min(6),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  phone: z.union([z.string(), z.number()]).transform((value) => String(value)),
  roleName: z.enum(["employee", "service_desk_agent", "admin", "platform_engineer"]).optional()
});

export const userChangePasswordSchema = z
  .object({
    password: z.string().min(6),
    passwordConfirm: z.string().min(6)
  })
  .refine((value) => value.password === value.passwordConfirm, {
    message: "Password is not match",
    path: ["passwordConfirm"]
  });

export const userChangeProfileSchema = z.object({
  firstName: z.string().min(3).max(20),
  lastName: z.string().min(3).max(20),
  email: z.string().email().max(100).transform((value) => value.toLowerCase()),
  phone: z.union([z.string(), z.number()]).transform((value) => String(value))
});

export type UserSignupInput = z.infer<typeof userSignupSchema>;
export type UserChangePasswordInput = z.infer<typeof userChangePasswordSchema>;
export type UserChangeProfileInput = z.infer<typeof userChangeProfileSchema>;

