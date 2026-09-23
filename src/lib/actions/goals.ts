"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export type ActionState =
  | { ok: true }
  | { ok: false; error: string };

/** Goal mutations — all scoped by the session user id. */
export async function createGoal(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const name = String(formData.get("name") ?? "").trim();
  const targetRaw = String(formData.get("targetAmount") ?? "").trim();
  const currentRaw = String(formData.get("currentAmount") ?? "0").trim();
  const targetDateRaw = String(formData.get("targetDate") ?? "").trim();

  if (!name) return { ok: false, error: "Goal name is required." };
  if (name.length > 120) return { ok: false, error: "Goal name is too long." };

  const target = parseAmount(targetRaw);
  if (target === null || target.lte(0)) {
    return { ok: false, error: "Target amount must be a positive number." };
  }
  const current = parseAmount(currentRaw === "" ? "0" : currentRaw);
  if (current === null || current.lt(0)) {
    return { ok: false, error: "Current amount must be zero or more." };
  }
  if (current.gt(target)) {
    return { ok: false, error: "Current amount can't exceed the target." };
  }

  let targetDate: Date | null = null;
  if (targetDateRaw) {
    targetDate = parseDate(targetDateRaw);
    if (!targetDate) return { ok: false, error: "Enter a valid target date." };
  }

  try {
    await prisma.goal.create({
      data: {
        userId: user.id,
        name,
        targetAmount: target,
        currentAmount: current,
        targetDate,
      },
    });
  } catch (e) {
    console.error("createGoal failed:", e);
    return { ok: false, error: "Could not create the goal. Please try again." };
  }

  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function updateGoal(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, error: "Missing goal." };

  const name = String(formData.get("name") ?? "").trim();
  const targetRaw = String(formData.get("targetAmount") ?? "").trim();
  const currentRaw = String(formData.get("currentAmount") ?? "0").trim();
  const targetDateRaw = String(formData.get("targetDate") ?? "").trim();

  if (!name) return { ok: false, error: "Goal name is required." };
  const target = parseAmount(targetRaw);
  if (target === null || target.lte(0)) {
    return { ok: false, error: "Target amount must be a positive number." };
  }
  const current = parseAmount(currentRaw === "" ? "0" : currentRaw);
  if (current === null || current.lt(0)) {
    return { ok: false, error: "Current amount must be zero or more." };
  }
  if (current.gt(target)) {
    return { ok: false, error: "Current amount can't exceed the target." };
  }

  let targetDate: Date | null = null;
  if (targetDateRaw) {
    targetDate = parseDate(targetDateRaw);
    if (!targetDate) return { ok: false, error: "Enter a valid target date." };
  }

  try {
    // updateMany with userId in the where clause = ownership enforcement.
    const result = await prisma.goal.updateMany({
      where: { id, userId: user.id },
      data: { name, targetAmount: target, currentAmount: current, targetDate },
    });
    if (result.count === 0) return { ok: false, error: "Goal not found." };
  } catch (e) {
    console.error("updateGoal failed:", e);
    return { ok: false, error: "Could not update the goal. Please try again." };
  }

  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteGoal(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, error: "Missing goal." };

  try {
    const result = await prisma.goal.deleteMany({
      where: { id, userId: user.id },
    });
    if (result.count === 0) return { ok: false, error: "Goal not found." };
  } catch (e) {
    console.error("deleteGoal failed:", e);
    return { ok: false, error: "Could not delete the goal. Please try again." };
  }

  revalidatePath("/goals");
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
