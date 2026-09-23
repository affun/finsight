"use server";

import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { signIn, signOut } from "@/lib/auth";
import { loginSchema, registerSchema } from "@/lib/validation/auth";
import { prisma } from "@/lib/prisma";

const BCRYPT_ROUNDS = 12;

/** State shape consumed by the auth forms via `useActionState`. */
export type AuthFormState = {
  /** Form-level error shown above the submit button. */
  error?: string;
  /** Per-field validation errors keyed by input id. */
  fieldErrors?: Partial<Record<"name" | "email" | "password" | "confirmPassword", string>>;
};

function fieldErrorsFrom(error: z.ZodError): AuthFormState["fieldErrors"] {
  const fieldErrors: AuthFormState["fieldErrors"] = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !(key in fieldErrors)) {
      fieldErrors[key as keyof NonNullable<AuthFormState["fieldErrors"]>] = issue.message;
    }
  }
  return fieldErrors;
}

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "Please fix the highlighted fields.", fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    // Invalid credentials (or any credentials-flow failure) get one generic
    // message — never reveal whether the account exists.
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    throw error; // re-throw redirects and unexpected errors
  }
  return {}; // unreachable — signIn redirects on success
}

export async function registerAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { error: "Please fix the highlighted fields.", fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    return {
      error: "An account with this email already exists.",
      fieldErrors: { email: "This email is already registered" },
    };
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  try {
    await prisma.user.create({ data: { name, email, passwordHash } });
  } catch (error) {
    // Unique-constraint race (two registrations at once) — same message as above.
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "P2002"
    ) {
      return {
        error: "An account with this email already exists.",
        fieldErrors: { email: "This email is already registered" },
      };
    }
    throw error;
  }

  // Sign the new user straight in.
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      // Account exists but auto-sign-in failed — send them to login.
      return { error: "Account created. Please sign in." };
    }
    throw error;
  }
  return {}; // unreachable — signIn redirects on success
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: "/login" });
}
