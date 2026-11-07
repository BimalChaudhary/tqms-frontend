import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Enter your username").email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
  remember: z.boolean(),
});

export const forgotSchema = z.object({ email: z.string().trim().min(1, "Enter your email").email("Enter a valid email address") });

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password"),
  newPassword: z.string().min(8, "Use at least 8 characters").regex(/[A-Za-z]/, "Include a letter").regex(/\d/, "Include a number"),
  confirmPassword: z.string().min(1, "Confirm your new password"),
}).refine((v) => v.newPassword === v.confirmPassword, { path: ["confirmPassword"], message: "Passwords don’t match" })
  .refine((v) => v.newPassword !== v.currentPassword, { path: ["newPassword"], message: "Choose a password different from the current one" });
