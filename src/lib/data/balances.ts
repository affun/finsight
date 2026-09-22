/**
 * Account balance architecture — single source of truth.
 *
 * `Account.balance` stores the account's current balance. Transaction
 * operations adjust it atomically inside the same database transaction:
 *
 *   EXPENSE  → balance -= amount
 *   INCOME   → balance += amount
 *
 * Editing or deleting a transaction reverses the old delta and applies the
 * new one, so the stored balance always equals
 *
 *   openingBalance + Σ(transaction deltas)
 *
 * There is deliberately no second, competing "computed balance".
 */
import { Prisma, TransactionType } from "@/generated/prisma/client";

/** Signed contribution of one transaction to its account balance. */
export function signedDelta(
  type: TransactionType,
  amount: Prisma.Decimal | string,
): Prisma.Decimal {
  const value = new Prisma.Decimal(amount);
  return type === "INCOME" ? value : value.neg();
}

/** Applies a transaction's effect to the account balance. */
export async function applyBalanceDelta(
  tx: Prisma.TransactionClient,
  accountId: string,
  type: TransactionType,
  amount: Prisma.Decimal | string,
): Promise<void> {
  const delta = signedDelta(type, amount);
  await tx.account.updateMany({
    where: { id: accountId },
    data: { balance: { increment: delta } },
  });
}

/** Reverses a transaction's effect on the account balance. */
export async function revertBalanceDelta(
  tx: Prisma.TransactionClient,
  accountId: string,
  type: TransactionType,
  amount: Prisma.Decimal | string,
): Promise<void> {
  const delta = signedDelta(type, amount).neg();
  await tx.account.updateMany({
    where: { id: accountId },
    data: { balance: { increment: delta } },
  });
}
