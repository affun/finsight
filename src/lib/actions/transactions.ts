"use server";

import { revalidatePath } from "next/cache";
import { Prisma, TransactionType } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { applyBalanceDelta, revertBalanceDelta } from "@/lib/data/balances";

export type ActionState =
  | { ok: true }
  | { ok: false; error: string };

const CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Entertainment",
  "Bills",
  "Education",
  "Subscriptions",
  "Salary",
  "Other",
] as const;

/**
 * Transaction mutations.
 *
 * Balance model: `Account.balance` is the source of truth, maintained
 * transactionally alongside every create/update/delete (see `balances.ts`):
 *   EXPENSE  → balance -= amount
 *   INCOME   → balance += amount
 * All money math uses Prisma Decimal, never JS floats.
 */
export async function createTransaction(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const accountId = String(formData.get("accountId") ?? "");
  const amountRaw = String(formData.get("amount") ?? "").trim();
  const type = String(formData.get("type") ?? "");
  const merchant = String(formData.get("merchant") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const dateRaw = String(formData.get("date") ?? "").trim();

  // --- Validation -----------------------------------------------------------
  if (!accountId) return { ok: false, error: "Select an account." };

  const amount = parseAmount(amountRaw);
  if (amount === null) return { ok: false, error: "Amount must be a positive number." };
  if (amount.lte(0)) return { ok: false, error: "Amount must be greater than zero." };

  if (type !== "INCOME" && type !== "EXPENSE") {
    return { ok: false, error: "Invalid transaction type." };
  }
  if (!merchant) return { ok: false, error: "Merchant is required." };
  if (merchant.length > 120) return { ok: false, error: "Merchant is too long." };
  if (!CATEGORIES.includes(category as (typeof CATEGORIES)[number])) {
    return { ok: false, error: "Choose a valid category." };
  }
  const date = parseDate(dateRaw);
  if (!date) return { ok: false, error: "Enter a valid date." };

  // --- Ownership check: account must belong to the session user -------------
  const owned = await prisma.account.findFirst({
    where: { id: accountId, userId: user.id },
    select: { id: true, currency: true },
  });
  if (!owned) return { ok: false, error: "Account not found." };

  try {
    await prisma.$transaction(async (tx) => {
      await tx.transaction.create({
        data: {
          accountId,
          amount,
          type: type as TransactionType,
          merchant,
          category,
          description: description || null,
          date,
        },
      });
      await applyBalanceDelta(tx, accountId, type as TransactionType, amount);
    });
  } catch (e) {
    console.error("createTransaction failed:", e);
    return { ok: false, error: "Could not save the transaction. Please try again." };
  }

  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  revalidatePath("/accounts");
  revalidatePath("/analytics");
  return { ok: true };
}

export async function updateTransaction(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const id = String(formData.get("id") ?? "");
  const accountId = String(formData.get("accountId") ?? "");
  const amountRaw = String(formData.get("amount") ?? "").trim();
  const type = String(formData.get("type") ?? "");
  const merchant = String(formData.get("merchant") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const dateRaw = String(formData.get("date") ?? "").trim();

  if (!id) return { ok: false, error: "Missing transaction." };
  if (!accountId) return { ok: false, error: "Select an account." };

  const amount = parseAmount(amountRaw);
  if (amount === null) return { ok: false, error: "Amount must be a positive number." };
  if (amount.lte(0)) return { ok: false, error: "Amount must be greater than zero." };

  if (type !== "INCOME" && type !== "EXPENSE") {
    return { ok: false, error: "Invalid transaction type." };
  }
  if (!merchant) return { ok: false, error: "Merchant is required." };
  if (!CATEGORIES.includes(category as (typeof CATEGORIES)[number])) {
    return { ok: false, error: "Choose a valid category." };
  }
  const date = parseDate(dateRaw);
  if (!date) return { ok: false, error: "Enter a valid date." };

  try {
    await prisma.$transaction(async (tx) => {
      // Load the existing txn through the user's accounts (ownership check).
      const existing = await tx.transaction.findFirst({
        where: { id, account: { userId: user.id } },
        select: {
          id: true,
          accountId: true,
          amount: true,
          type: true,
          account: { select: { currency: true } },
        },
      });
      if (!existing) throw new UnauthorizedError();

      // New account must also belong to the user.
      const next = await tx.account.findFirst({
        where: { id: accountId, userId: user.id },
        select: { id: true },
      });
      if (!next) throw new UnauthorizedError();

      // Revert the old effect on the old account, apply the new effect.
      await revertBalanceDelta(tx, existing.accountId, existing.type, existing.amount);
      await tx.transaction.update({
        where: { id },
        data: {
          accountId,
          amount,
          type: type as TransactionType,
          merchant,
          category,
          description: description || null,
          date,
        },
      });
      await applyBalanceDelta(tx, accountId, type as TransactionType, amount);
    });
  } catch (e) {
    if (e instanceof UnauthorizedError) return { ok: false, error: "Transaction not found." };
    console.error("updateTransaction failed:", e);
    return { ok: false, error: "Could not update the transaction. Please try again." };
  }

  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  revalidatePath("/accounts");
  revalidatePath("/analytics");
  return { ok: true };
}

export async function deleteTransaction(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, error: "Missing transaction." };

  try {
    await prisma.$transaction(async (tx) => {
      const existing = await tx.transaction.findFirst({
        where: { id, account: { userId: user.id } },
        select: { id: true, accountId: true, amount: true, type: true },
      });
      if (!existing) throw new UnauthorizedError();

      await revertBalanceDelta(tx, existing.accountId, existing.type, existing.amount);
      await tx.transaction.delete({ where: { id } });
    });
  } catch (e) {
    if (e instanceof UnauthorizedError) return { ok: false, error: "Transaction not found." };
    console.error("deleteTransaction failed:", e);
    return { ok: false, error: "Could not delete the transaction. Please try again." };
  }

  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  revalidatePath("/accounts");
  revalidatePath("/analytics");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

class UnauthorizedError extends Error {}

function parseAmount(input: string): Prisma.Decimal | null {
  const cleaned = input.replace(/[,\s₹]/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  try {
    return new Prisma.Decimal(cleaned);
  } catch {
    return null;
  }
}

function parseDate(input: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input)) return null;
  const d = new Date(`${input}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}
