import { z } from "zod";

/**
 * Shared, server-authoritative validation for authentication forms.
 * The client mirrors the same rules for instant feedback, but the server
 * always re-validates before touching the database.
 */
export const loginSchema = z.object({
  email: z.email("Enter a valid email").trim().toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Name is required")
      .max(80, "Name must be at most 80 characters"),
    email: z.email("Enter a valid email").trim().toLowerCase().max(254),
    // bcrypt operates on at most 72 bytes; enforce it explicitly so long
    // passwords fail loudly instead of being silently truncated.
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(72, "Password must be at most 72 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
