"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import type { AccountType } from "@/generated/prisma/enums";

export type ActionState =
  | { ok: true }
  | { ok: false; error: string };

const ACCOUNT_TYPES = ["BANK", "CASH", "CREDIT_CARD", "INVESTMENT", "OTHER"] as const;

/**
 * Account mutations. Every operation:
 *  1. Resolves the user id from the signed session (never client input).
 *  2. Re-checks row ownership by including `userId` in the where clause.
 *  3. Maintains the stored balance invariant (see balances.ts).
 */

export async function createAccount(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "");
  const balance = String(formData.get("balance") ?? "").trim();
  const currency = String(formData.get("currency") ?? "INR").trim().toUpperCase() || "INR";

  if (!name) return { ok: false, error: "Account name is required." };
  if (name.length > 80) return { ok: false, error: "Account name is too long." };
  if (!ACCOUNT_TYPES.includes(type as (typeof ACCOUNT_TYPES)[number])) {
    return { ok: false, error: "Invalid account type." };
  }

  let opening: Prisma.Decimal;
  try {
    opening = parseAmount(balance);
  } catch {
    return { ok: false, error: "Opening balance must be a valid amount." };
  }

  try {
    await prisma.account.create({
      data: {
        userId: user.id,
        name,
        type: type as (typeof ACCOUNT_TYPES)[number],
        balance: opening,
        currency,
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { ok: false, error: "You already have an account with this name." };
    }
    console.error("createAccount failed:", e);
    return { ok: false, error: "Could not create the account. Please try again." };
  }

  revalidatePath("/accounts");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function updateAccount(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "");
  const currency = String(formData.get("currency") ?? "INR").trim().toUpperCase() || "INR";

  if (!id) return { ok: false, error: "Missing account." };
  if (!name) return { ok: false, error: "Account name is required." };
  if (!ACCOUNT_TYPES.includes(type as (typeof ACCOUNT_TYPES)[number])) {
    return { ok: false, error: "Invalid account type." };
  }

  try {
    // Ownership enforced by including userId in the where clause.
    const result = await prisma.account.updateMany({
      where: { id, userId: user.id },
      data: { name, type: type as (typeof ACCOUNT_TYPES)[number], currency },
    });
    if (result.count === 0) {
      return { ok: false, error: "Account not found." };
    }
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { ok: false, error: "You already have an account with this name." };
    }
    console.error("updateAccount failed:", e);
    return { ok: false, error: "Could not update the account. Please try again." }
  }

  revalidatePath("/accounts");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteAccount(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, error: "Missing account." };

  try {
    // Ownership enforced by including userId; transactions cascade-delete.
    const result = await prisma.account.deleteMany({
      where: { id, userId: user.id },
    });
    if (result.count === 0) {
      return { ok: false, error: "Account not found." };
    }
  } catch (e) {
    console.error("deleteAccount failed:", e);
    return { ok: false, error: "Could not delete the account. Please try again." };
  }

  revalidatePath("/accounts");
  revalidatePath("/dashboard");
  return { ok: true };
}

function parseAmount(input: string): Prisma.Decimal {
  const cleaned = input.replace(/[,\s₹]/g, "");
  if (!/^-?\d+(\.\d{1,2})?$/.test(cleaned)) {
    throw new Error("Invalid amount");
  }
  return new Prisma.Decimal(cleaned);
}
