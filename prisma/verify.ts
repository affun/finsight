/**
 * FinSight — Phase 2A database verification (development only).
 *
 * Verifies, in order:
 *  1. Prisma can connect to PostgreSQL
 *  2. Migrations have been applied
 *  3. Prisma Client loads successfully (implicit: this script imports it)
 *  4. Seed data is present
 *  5. Data can be queried (relations, enums, aggregates)
 *
 * Usage: pnpm db:verify   (requires DATABASE_URL in .env)
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" }),
});

async function main(): Promise<void> {
  let failures = 0;

  const check = (name: string, ok: boolean, detail: string) => {
    console.log(`${ok ? "✅" : "❌"} ${name}${detail ? ` — ${detail}` : ""}`);
    if (!ok) failures += 1;
  };

  // 1) Connection ------------------------------------------------------------
  const dbVersion = await prisma.$queryRaw<{ version: string }[]>`
    SELECT version() AS version
  `;
  const pgVersion = dbVersion[0]?.version.split(",")[0] ?? "unknown";
  check("PostgreSQL connection", dbVersion.length > 0, pgVersion);

  // 2) Migrations ------------------------------------------------------------
  const migrations = await prisma.$queryRaw<{ migration_name: string }[]>`
    SELECT migration_name FROM "_prisma_migrations" ORDER BY finished_at
  `;
  check("Migrations applied", migrations.length > 0, `${migrations.length} migration(s)`);

  // 3) Seed data present -----------------------------------------------------
  const [users, accounts, transactions, budgets, budgetCategories, goals, layouts, widgets] =
    await Promise.all([
      prisma.user.count(),
      prisma.account.count(),
      prisma.transaction.count(),
      prisma.budget.count(),
      prisma.budgetCategory.count(),
      prisma.goal.count(),
      prisma.dashboardLayout.count(),
      prisma.dashboardWidget.count(),
    ]);

  check("User seeded", users >= 1, `${users} user(s)`);
  check("Accounts seeded", accounts >= 4, `${accounts} account(s)`);
  check(
    "Transactions seeded",
    transactions >= 50 && transactions <= 150,
    `${transactions} transaction(s)`,
  );
  check("Budgets seeded", budgets >= 1, `${budgets} budget(s), ${budgetCategories} categories`);
  check("Goals seeded", goals >= 2, `${goals} goal(s)`);
  check("Dashboard layout seeded", layouts >= 1, `${layouts} layout(s), ${widgets} widget(s)`);

  // 4) Queries ---------------------------------------------------------------
  const incomeExpense = await prisma.transaction.groupBy({
    by: ["type"],
    _count: { _all: true },
    _sum: { amount: true },
  });

  const income = incomeExpense.find((row) => row.type === "INCOME");
  const expense = incomeExpense.find((row) => row.type === "EXPENSE");
  check(
    "Income/expense aggregation",
    Boolean(income) && Boolean(expense),
    `income ₹${income?._sum.amount ?? 0} · expenses ₹${expense?._sum.amount ?? 0}`,
  );

  const spendingByCategory = await prisma.transaction.groupBy({
    by: ["category"],
    where: { type: "EXPENSE" },
    _sum: { amount: true },
    orderBy: { _sum: { amount: "desc" } },
    take: 3,
  });
  check(
    "Top spending categories query",
    spendingByCategory.length > 0,
    spendingByCategory
      .map((row) => `${row.category} ₹${row._sum.amount}`)
      .join(", "),
  );

  const userWithAccounts = await prisma.user.findFirst({
    include: {
      accounts: { include: { _count: { select: { transactions: true } } } },
      budgets: { include: { categories: true } },
      goals: true,
      dashboardLayouts: { include: { widgets: true } },
    },
  });
  check(
    "User relation graph",
    Boolean(userWithAccounts && userWithAccounts.accounts.length > 0),
    userWithAccounts
      ? `${userWithAccounts.accounts.length} accounts, ${userWithAccounts.budgets.length} budgets, ${userWithAccounts.goals.length} goals, ${userWithAccounts.dashboardLayouts.length} layout(s)`
      : "no user found",
  );

  console.log(
    failures === 0
      ? "\n🎉 All database verification checks passed."
      : `\n💥 ${failures} verification check(s) failed.`,
  );
  if (failures > 0) process.exit(1);
}

main()
  .catch((e) => {
    console.error("❌ Verification failed:", e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
