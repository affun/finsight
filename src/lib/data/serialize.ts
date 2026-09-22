import { Prisma } from "@/generated/prisma/client";

/**
 * Serialization boundary between server queries and client components.
 *
 * Prisma `Decimal` and `Date` objects cannot cross the server→client
 * component boundary. Everything financial is stringified at full Decimal
 * precision and formatted only at the render edge, so no arithmetic ever
 * happens in JavaScript floats.
 */

export type MoneyString = string;

export function money(value: Prisma.Decimal | string | number): MoneyString {
  return new Prisma.Decimal(value).toFixed(2);
}

/** Serializes a Date to an ISO string in a compact, sortable form. */
export function isoDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

export type SerializedAccount = {
  id: string;
  name: string;
  type: "BANK" | "CASH" | "CREDIT_CARD" | "INVESTMENT" | "OTHER";
  balance: MoneyString;
  currency: string;
  createdAt: string;
  transactionCount: number;
};

export type SerializedTransaction = {
  id: string;
  accountId: string;
  accountName: string;
  amount: MoneyString;
  type: "INCOME" | "EXPENSE";
  merchant: string;
  category: string;
  description: string | null;
  date: string; // yyyy-mm-dd
};
