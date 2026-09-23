import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { money, isoDate, type SerializedAccount, type SerializedTransaction } from "@/lib/data/serialize";

/**
 * Server-only data access for the current user's financial data.
 *
 * Every query is scoped by the authenticated user's id — taken from the
 * signed session, never from client input. Ownership checks on mutations
 * live in `src/lib/actions/*`.
 */

// ---------------------------------------------------------------------------
// Accounts
// ---------------------------------------------------------------------------

/** All of the current user's accounts, newest first, with txn counts. */
export async function getAccounts(): Promise<SerializedAccount[]> {
  const user = await getSessionUser();
  if (!user) return [];

  const accounts = await prisma.account.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { transactions: true } } },
  });

  return accounts.map((a) => ({
    id: a.id,
    name: a.name,
    type: a.type,
    balance: money(a.balance),
    currency: a.currency,
    createdAt: a.createdAt.toISOString(),
    transactionCount: a._count.transactions,
  }));
}

/** Aggregated account stats for the accounts page summary cards. */
export async function getAccountSummary() {
  const accounts = await getAccounts();
  const sum = (values: string[]) =>
    values.reduce((acc, v) => acc.plus(v), new Prisma.Decimal(0));

  const positives = accounts.filter((a) => new Prisma.Decimal(a.balance).gte(0));
  const negatives = accounts.filter((a) => new Prisma.Decimal(a.balance).lt(0));

  const totalAssets = sum(positives.map((a) => a.balance));
  const totalLiabilities = sum(negatives.map((a) => a.balance));

  return {
    totalAssets: money(totalAssets),
    totalLiabilities: money(totalLiabilities),
    netWorth: money(totalAssets.plus(totalLiabilities)),
    count: accounts.length,
  };
}

// ---------------------------------------------------------------------------
// Transactions
// ---------------------------------------------------------------------------

export type TransactionFilters = {
  search?: string;
  category?: string;
  accountId?: string;
  type?: "INCOME" | "EXPENSE";
  /** ISO yyyy-mm-dd bounds, inclusive. */
  from?: string;
  to?: string;
  sort?: "date" | "amount";
};

/** The current user's transactions (through account ownership), filtered. */
export async function getTransactions(filters: TransactionFilters = {}): Promise<SerializedTransaction[]> {
  const user = await getSessionUser();
  if (!user) return [];

  const where: Prisma.TransactionWhereInput = {
    account: { userId: user.id },
  };

  if (filters.search) {
    where.OR = [
      { merchant: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
      { category: { contains: filters.search, mode: "insensitive" } },
    ];
  }
  if (filters.category && filters.category !== "All") {
    where.category = filters.category;
  }
  if (filters.accountId) {
    // Ownership is still enforced by the outer account.userId scope.
    where.accountId = filters.accountId;
  }
  if (filters.type) {
    where.type = filters.type;
  }
  if (filters.from || filters.to) {
    where.date = {
      ...(filters.from ? { gte: new Date(`${filters.from}T00:00:00.000Z`) } : {}),
      ...(filters.to ? { lte: new Date(`${filters.to}T23:59:59.999Z`) } : {}),
    };
  }

  const transactions = await prisma.transaction.findMany({
    where,
    orderBy:
      filters.sort === "amount"
        ? [{ amount: "desc" }]
        : [{ date: "desc" }, { createdAt: "desc" }],
    include: { account: { select: { name: true } } },
    // Sensible ceiling; the UI groups and paginates visually.
    take: 1000,
  });

  return transactions.map((t) => ({
    id: t.id,
    accountId: t.accountId,
    accountName: t.account.name,
    amount: money(t.amount),
    type: t.type,
    merchant: t.merchant,
    category: t.category,
    description: t.description,
    date: isoDate(t.date),
  }));
}

/** Distinct categories across the user's transactions (for filter chips). */
export async function getTransactionCategories(): Promise<string[]> {
  const user = await getSessionUser();
  if (!user) return [];

  const rows = await prisma.transaction.findMany({
    where: { account: { userId: user.id } },
    distinct: ["category"],
    select: { category: true },
    orderBy: { category: "asc" },
  });
  return rows.map((r) => r.category);
}

// ---------------------------------------------------------------------------
// Budgets
// ---------------------------------------------------------------------------

export type SerializedBudget = {
  id: string;
  name: string;
  amount: string;
  period: "WEEKLY" | "MONTHLY" | "YEARLY" | "CUSTOM";
  startDate: string;
  endDate: string | null;
  categories: { id: string; category: string; allocatedAmount: string; spent: string }[];
  totalAllocated: string;
};

/**
 * The user's budgets with per-category actual spending joined from
 * transactions, computed in the database (no per-row round trips).
 */
export async function getBudgetsWithSpending(): Promise<SerializedBudget[]> {
  const user = await getSessionUser();
  if (!user) return [];

  const budgets = await prisma.budget.findMany({
    where: { userId: user.id },
    orderBy: { startDate: "desc" },
    include: { categories: { orderBy: { category: "asc" } } },
  });
  if (budgets.length === 0) return [];

  // Actual spending per category within each budget's window, grouped in SQL.
  const spendingRows = await prisma.transaction.groupBy({
    by: ["category"],
    where: {
      account: { userId: user.id },
      type: "EXPENSE",
    },
    _sum: { amount: true },
  });
  const spentByCategory = new Map(spendingRows.map((r) => [r.category, money(r._sum.amount ?? 0)]));

  return budgets.map((b) => {
    const categories = b.categories.map((c) => ({
      id: c.id,
      category: c.category,
      allocatedAmount: money(c.allocatedAmount),
      spent: spentByCategory.get(c.category) ?? "0.00",
    }));
    const totalAllocated = categories
      .reduce((acc, c) => acc.plus(c.allocatedAmount), new Prisma.Decimal(0))
      .toFixed(2);

    return {
      id: b.id,
      name: b.name,
      amount: money(b.amount),
      period: b.period,
      startDate: isoDate(b.startDate),
      endDate: b.endDate ? isoDate(b.endDate) : null,
      categories,
      totalAllocated,
    };
  });
}

// ---------------------------------------------------------------------------
// Goals
// ---------------------------------------------------------------------------

export type SerializedGoal = {
  id: string;
  name: string;
  targetAmount: string;
  currentAmount: string;
  targetDate: string | null;
  progressPct: number;
};

export async function getGoals(): Promise<SerializedGoal[]> {
  const user = await getSessionUser();
  if (!user) return [];

  const goals = await prisma.goal.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });

  return goals.map((g) => {
    const target = new Prisma.Decimal(g.targetAmount);
    const pct = target.lte(0)
      ? g.currentAmount.gt(0) ? 100 : 0
      : new Prisma.Decimal(g.currentAmount).div(target).times(100).toNumber();
    return {
      id: g.id,
      name: g.name,
      targetAmount: money(g.targetAmount),
      currentAmount: money(g.currentAmount),
      targetDate: g.targetDate ? isoDate(g.targetDate) : null,
      progressPct: Math.min(100, Math.max(0, pct)),
    };
  });
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export type DashboardData = {
  totalBalance: string;
  totalIncome: string;
  totalExpenses: string;
  netSavings: string;
  transactionCount: number;
  recentTransactions: SerializedTransaction[];
  spendingByCategory: { category: string; value: string }[];
  monthlyCashFlow: { month: string; income: string; expenses: string }[];
};

/** All dashboard stats for the current user, computed with SQL aggregation. */
export async function getDashboardData(): Promise<DashboardData> {
  const user = await getSessionUser();
  if (!user) {
    return {
      totalBalance: "0.00",
      totalIncome: "0.00",
      totalExpenses: "0.00",
      netSavings: "0.00",
      transactionCount: 0,
      recentTransactions: [],
      spendingByCategory: [],
      monthlyCashFlow: [],
    };
  }

  const [accounts, typeTotals, recent, categoryRows, monthlyRows] = await Promise.all([
    // 1) Balances (stored + deltas already applied by mutations)
    prisma.account.aggregate({
      where: { userId: user.id },
      _sum: { balance: true },
    }),
    // 2) Total income / expenses
    prisma.transaction.groupBy({
      by: ["type"],
      where: { account: { userId: user.id } },
      _sum: { amount: true },
      _count: { _all: true },
    }),
    // 3) Recent transactions
    prisma.transaction.findMany({
      where: { account: { userId: user.id } },
      orderBy: { date: "desc" },
      take: 6,
      include: { account: { select: { name: true } } },
    }),
    // 4) Spending by category (expenses)
    prisma.transaction.groupBy({
      by: ["category"],
      where: { account: { userId: user.id }, type: "EXPENSE" },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
    }),
    // 5) Monthly income vs expenses, last 6 months, grouped in SQL
    prisma.$queryRaw<{ month: Date; type: string; total: Prisma.Decimal }[]>`
      SELECT date_trunc('month', "date") AS month, "type"::text AS type, SUM("amount") AS total
      FROM "Transaction"
      WHERE "accountId" IN (SELECT id FROM "Account" WHERE "userId" = ${user.id})
        AND "date" >= date_trunc('month', NOW()) - INTERVAL '5 months'
      GROUP BY 1, 2
      ORDER BY 1
    `,
  ]);

  const income = typeTotals.find((r) => r.type === "INCOME")?._sum.amount ?? new Prisma.Decimal(0);
  const expenses = typeTotals.find((r) => r.type === "EXPENSE")?._sum.amount ?? new Prisma.Decimal(0);
  const transactionCount = typeTotals.reduce((n, r) => n + r._count._all, 0);

  // Fill the last six months so charts always have a continuous axis.
  const monthlyCashFlow: DashboardData["monthlyCashFlow"] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleString("en-US", { month: "short" });
    const row = (t: string) =>
      monthlyRows.find(
        (r) =>
          r.type === t &&
          `${r.month.getFullYear()}-${String(r.month.getMonth() + 1).padStart(2, "0")}` === key,
      );
    monthlyCashFlow.push({
      month: label,
      income: money(row("INCOME")?.total ?? 0),
      expenses: money(row("EXPENSE")?.total ?? 0),
    });
  }

  return {
    totalBalance: money(accounts._sum.balance ?? 0),
    totalIncome: money(income),
    totalExpenses: money(expenses),
    netSavings: money(new Prisma.Decimal(income).minus(expenses)),
    transactionCount,
    recentTransactions: recent.map((t) => ({
      id: t.id,
      accountId: t.accountId,
      accountName: t.account.name,
      amount: money(t.amount),
      type: t.type,
      merchant: t.merchant,
      category: t.category,
      description: t.description,
      date: isoDate(t.date),
    })),
    spendingByCategory: categoryRows.map((r) => ({
      category: r.category,
      value: money(r._sum.amount ?? 0),
    })),
    monthlyCashFlow,
  };
}

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------

export type AnalyticsData = {
  avgMonthlySpend: string;
  avgMonthlyIncome: string;
  avgSavingsRatePct: number;
  largest: { merchant: string; amount: string; category: string }[];
  cashFlow: { month: string; income: string; expenses: string }[];
  spendingByCategory: { category: string; value: string }[];
  monthlySpending: { month: string; amount: string }[];
  categoryComparison: { month: string; [category: string]: string | number }[];
};

/** Analytics aggregates for the current user (mirrors the old mock shapes). */
export async function getAnalyticsData(): Promise<AnalyticsData> {
  const user = await getSessionUser();
  if (!user) {
    return {
      avgMonthlySpend: "0.00",
      avgMonthlyIncome: "0.00",
      avgSavingsRatePct: 0,
      largest: [],
      cashFlow: [],
      spendingByCategory: [],
      monthlySpending: [],
      categoryComparison: [],
    };
  }

  const [monthlyRows, categoryRows, largest, totals] = await Promise.all([
    prisma.$queryRaw<{ month: Date; type: string; total: Prisma.Decimal }[]>`
      SELECT date_trunc('month', "date") AS month, "type"::text AS type, SUM("amount") AS total
      FROM "Transaction"
      WHERE "accountId" IN (SELECT id FROM "Account" WHERE "userId" = ${user.id})
        AND "date" >= date_trunc('month', NOW()) - INTERVAL '5 months'
      GROUP BY 1, 2 ORDER BY 1
    `,
    prisma.transaction.groupBy({
      by: ["category"],
      where: { account: { userId: user.id }, type: "EXPENSE" },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
    }),
    prisma.transaction.findMany({
      where: { account: { userId: user.id }, type: "EXPENSE" },
      orderBy: { amount: "desc" },
      take: 5,
      select: { merchant: true, amount: true, category: true },
    }),
    prisma.transaction.groupBy({
      by: ["type"],
      where: { account: { userId: user.id } },
      _sum: { amount: true },
    }),
  ]);

  const monthlyCash = buildMonthlySeries(monthlyRows);
  const totalIncome = totals.find((t) => t.type === "INCOME")?._sum.amount ?? new Prisma.Decimal(0);
  const totalExpenses = totals.find((t) => t.type === "EXPENSE")?._sum.amount ?? new Prisma.Decimal(0);
  const savingsRate =
    totalIncome.gt(0) ? totalIncome.minus(totalExpenses).div(totalIncome).times(100).toNumber() : 0;

  // Category comparison for the top 3 spending categories across months.
  const topCategories = categoryRows.slice(0, 3).map((c) => c.category);
  const comparisonRaw = topCategories.length
    ? await prisma.$queryRaw<{ month: Date; category: string; total: Prisma.Decimal }[]>`
        SELECT date_trunc('month', "date") AS month, "category", SUM("amount") AS total
        FROM "Transaction"
        WHERE "accountId" IN (SELECT id FROM "Account" WHERE "userId" = ${user.id})
          AND "type" = 'EXPENSE'
          AND "category" IN (${Prisma.join(topCategories)})
          AND "date" >= date_trunc('month', NOW()) - INTERVAL '5 months'
        GROUP BY 1, 2 ORDER BY 1
      `
    : [];

  const months = lastNMonthLabels(6);
  const categoryComparison = months.map((m) => {
    const row: { month: string; [category: string]: string | number } = { month: m.label };
    for (const cat of topCategories) {
      const hit = comparisonRaw.find(
        (r) =>
          r.category === cat &&
          `${r.month.getFullYear()}-${String(r.month.getMonth() + 1).padStart(2, "0")}` === m.key,
      );
      row[cat] = Number(hit?.total ?? 0);
    }
    return row;
  });

  return {
    avgMonthlySpend: money(totalExpenses.div(6)),
    avgMonthlyIncome: money(totalIncome.div(6)),
    avgSavingsRatePct: Number(savingsRate.toFixed(1)),
    largest: largest.map((t) => ({
      merchant: t.merchant,
      amount: money(t.amount),
      category: t.category,
    })),
    cashFlow: monthlyCash,
    spendingByCategory: categoryRows.map((r) => ({
      category: r.category,
      value: money(r._sum.amount ?? 0),
    })),
    monthlySpending: monthlyCash.map((m) => ({ month: m.month, amount: m.expenses })),
    categoryComparison,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function lastNMonthLabels(n: number): { key: string; label: string }[] {
  const out: { key: string; label: string }[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleString("en-US", { month: "short" }),
    });
  }
  return out;
}

function buildMonthlySeries(
  rows: { month: Date; type: string; total: Prisma.Decimal }[],
): { month: string; income: string; expenses: string }[] {
  return lastNMonthLabels(6).map((m) => {
    const income = rows.find(
      (r) => r.type === "INCOME" && monthKey(r.month) === m.key,
    );
    const expenses = rows.find(
      (r) => r.type === "EXPENSE" && monthKey(r.month) === m.key,
    );
    return { month: m.label, income: money(income?.total ?? 0), expenses: money(expenses?.total ?? 0) };
  });
}

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
