"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export type ActionState =
  | { ok: true }
  | { ok: false; error: string };

const PERIODS = ["WEEKLY", "MONTHLY", "YEARLY", "CUSTOM"] as const;
type Period = (typeof PERIODS)[number];

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

/** Budget mutations — all scoped by the session user id. */
export async function createBudget(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const name = String(formData.get("name") ?? "").trim();
  const amountRaw = String(formData.get("amount") ?? "").trim();
  const period = String(formData.get("period") ?? "") as Period;
  const startDateRaw = String(formData.get("startDate") ?? "").trim();
  const endDateRaw = String(formData.get("endDate") ?? "").trim();
  const categoryNames = formData.getAll("categories").map(String);
  const allocationsRaw = formData.getAll("allocations").map(String);

  if (!name) return { ok: false, error: "Budget name is required." };
  const amount = parseAmount(amountRaw);
  if (amount === null || amount.lte(0)) {
    return { ok: false, error: "Budget amount must be a positive number." };
  }
  if (!PERIODS.includes(period)) return { ok: false, error: "Invalid budget period." };

  const startDate = parseDate(startDateRaw);
  if (!startDate) return { ok: false, error: "Enter a valid start date." };
  let endDate: Date | null = null;
  if (endDateRaw) {
    endDate = parseDate(endDateRaw);
    if (!endDate) return { ok: false, error: "Enter a valid end date." };
    if (endDate <= startDate) {
      return { ok: false, error: "End date must be after the start date." };
    }
  }

  // Parse category allocations (paired inputs: categories[i] / allocations[i]).
  const categoryData: { category: string; allocatedAmount: Prisma.Decimal }[] = [];
  for (let i = 0; i < categoryNames.length; i++) {
    const cat = categoryNames[i].trim();
    const alloc = parseAmount(allocationsRaw[i] ?? "");
    if (!cat || alloc === null || alloc.lte(0)) continue;
    if (!CATEGORIES.includes(cat as (typeof CATEGORIES)[number])) continue;
    categoryData.push({ category: cat, allocatedAmount: alloc });
  }
  const deduped = new Map(categoryData.map((c) => [c.category, c.allocatedAmount]));

  try {
    await prisma.budget.create({
      data: {
        userId: user.id,
        name,
        amount,
        period,
        startDate,
        endDate,
        categories: {
          create: [...deduped.entries()].map(([category, allocatedAmount]) => ({
            category,
            allocatedAmount,
          })),
        },
      },
    });
  } catch (e) {
    console.error("createBudget failed:", e);
    return { ok: false, error: "Could not create the budget. Please try again." };
  }

  revalidatePath("/budgets");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function updateBudget(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, error: "Missing budget." };

  const existing = await prisma.budget.findFirst({
    where: { id, userId: user.id },
    select: { id: true },
  });
  if (!existing) return { ok: false, error: "Budget not found." };

  const name = String(formData.get("name") ?? "").trim();
  const amountRaw = String(formData.get("amount") ?? "").trim();
  const period = String(formData.get("period") ?? "") as Period;
  const startDateRaw = String(formData.get("startDate") ?? "").trim();
  const endDateRaw = String(formData.get("endDate") ?? "").trim();
  const categoryNames = formData.getAll("categories").map(String);
  const allocationsRaw = formData.getAll("allocations").map(String);

  if (!name) return { ok: false, error: "Budget name is required." };
  const amount = parseAmount(amountRaw);
  if (amount === null || amount.lte(0)) {
    return { ok: false, error: "Budget amount must be a positive number." };
  }
  if (!PERIODS.includes(period)) return { ok: false, error: "Invalid budget period." };

  const startDate = parseDate(startDateRaw);
  if (!startDate) return { ok: false, error: "Enter a valid start date." };
  let endDate: Date | null = null;
  if (endDateRaw) {
    endDate = parseDate(endDateRaw);
    if (!endDate) return { ok: false, error: "Enter a valid end date." };
    if (endDate <= startDate) {
      return { ok: false, error: "End date must be after the start date." };
    }
  }

  const categoryData: { category: string; allocatedAmount: Prisma.Decimal }[] = [];
  for (let i = 0; i < categoryNames.length; i++) {
    const cat = categoryNames[i].trim();
    const alloc = parseAmount(allocationsRaw[i] ?? "");
    if (!cat || alloc === null || alloc.lte(0)) continue;
    if (!CATEGORIES.includes(cat as (typeof CATEGORIES)[number])) continue;
    categoryData.push({ category: cat, allocatedAmount: alloc });
  }
  const deduped = new Map(categoryData.map((c) => [c.category, c.allocatedAmount]));

  try {
    await prisma.$transaction(async (tx) => {
      await tx.budget.update({
        where: { id },
        data: { name, amount, period, startDate, endDate },
      });
      // Replace allocations wholesale — simplest consistent approach.
      await tx.budgetCategory.deleteMany({ where: { budgetId: id } });
      if (deduped.size > 0) {
        await tx.budgetCategory.createMany({
          data: [...deduped.entries()].map(([category, allocatedAmount]) => ({
            budgetId: id,
            category,
            allocatedAmount,
          })),
        });
      }
    });
  } catch (e) {
    console.error("updateBudget failed:", e);
    return { ok: false, error: "Could not update the budget. Please try again." };
  }

  revalidatePath("/budgets");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteBudget(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, error: "Missing budget." };

  try {
    const result = await prisma.budget.deleteMany({
      where: { id, userId: user.id },
    });
    if (result.count === 0) return { ok: false, error: "Budget not found." };
  } catch (e) {
    console.error("deleteBudget failed:", e);
    return { ok: false, error: "Could not delete the budget. Please try again." };
  }

  revalidatePath("/budgets");
  revalidatePath("/dashboard");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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
