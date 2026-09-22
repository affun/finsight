import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { faker } from "@faker-js/faker";
import { PrismaClient } from "../src/generated/prisma/client";
import type { Prisma, TransactionType } from "../src/generated/prisma/client";

// Deterministic seed data — same output on every run.
faker.seed(20260923);

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" }),
});

const CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Entertainment",
  "Bills",
  "Education",
  "Subscriptions",
  "Health",
] as const;

type Category = (typeof CATEGORIES)[number];

// Realistic Indian merchants per category.
const MERCHANTS: Record<Category, string[]> = {
  Food: ["Swiggy", "Zomato", "BigBasket", "DMart", "Local Kirana", "Cafe Coffee Day"],
  Transport: ["Uber", "Ola Cabs", "Indian Oil", "Bharat Petroleum", "Metro Card", "Rapido"],
  Shopping: ["Amazon India", "Flipkart", "Myntra", "Croma", "Decathlon"],
  Entertainment: ["PVR Cinemas", "BookMyShow", "Steam", "PlayStation Store"],
  Bills: ["MSEB Electricity", "Airtel Broadband", "Jio Postpaid", "Gas Agency", "Society Maintenance"],
  Education: ["Udemy", "Coursera", "O'Reilly", "Kindle Books", "Unacademy"],
  Subscriptions: ["Netflix", "Spotify", "YouTube Premium", "iCloud", "Notion", "GitHub"],
  Health: ["Apollo Pharmacy", "Cult.fit", "Practo", "Decathlon Sports"],
};

const INCOME_MERCHANTS = ["TechCorp Solutions", "Freelance Client", "HDFC Bank — Interest"] as const;
const INCOME_DESCRIPTIONS = ["Monthly salary", "Project milestone payment", "Savings account interest"] as const;

const DESCRIPTIONS: Record<Category, string[]> = {
  Food: ["Lunch order", "Dinner delivery", "Weekly groceries", "Monthly ration", "Coffee break"],
  Transport: ["Airport ride", "Fuel refill", "Metro recharge", "Office commute", "Cab to client site"],
  Shopping: ["Home supplies", "Electronics accessory", "Clothing order", "Gadget purchase", "Sports gear"],
  Entertainment: ["Movie tickets", "Game purchase", "Concert booking", "Weekend outing"],
  Bills: ["Monthly electricity bill", "Internet bill", "Mobile postpaid bill", "LPG cylinder", "Housing society dues"],
  Education: ["Online course", "Certification fee", "Tech ebook", "Exam fee", "Learning subscription"],
  Subscriptions: ["Monthly streaming plan", "Music plan", "Cloud storage", "Productivity app", "Developer tools"],
  Health: ["Pharmacy purchase", "Gym membership", "Doctor consultation", "Fitness gear", "Lab test"],
};

// Typical per-category expense ranges (INR).
const CATEGORY_AMOUNT_RANGE: Record<Category, [number, number]> = {
  Food: [120, 1800],
  Transport: [40, 900],
  Shopping: [300, 6500],
  Entertainment: [150, 1500],
  Bills: [300, 4500],
  Education: [200, 3200],
  Subscriptions: [99, 799],
  Health: [150, 2500],
};

/** Money helper: keeps values as strings so they stay Decimal-safe. */
function money(value: number): string {
  return value.toFixed(2);
}

/** Random date within the last N months (inclusive of today). */
function dateWithinMonths(months: number): Date {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - months, 1);
  return faker.date.between({ from: start, to: now });
}

/** A date exactly N months from now. */
function monthsFromNow(months: number): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + months, now.getDate());
}

/** Build one expense transaction payload. */
function buildExpense(accountId: string, date: Date): Prisma.TransactionUncheckedCreateInput {
  const category = faker.helpers.arrayElement<Category>(CATEGORIES);
  const [min, max] = CATEGORY_AMOUNT_RANGE[category];
  const type: TransactionType = "EXPENSE";

  return {
    accountId,
    amount: money(faker.number.float({ min, max, fractionDigits: 2 })),
    type,
    merchant: faker.helpers.arrayElement(MERCHANTS[category]),
    category,
    description: faker.helpers.arrayElement(DESCRIPTIONS[category]),
    date,
  };
}

/** Build one income transaction payload. */
function buildIncome(
  accountId: string,
  date: Date,
  kind: "salary" | "freelance" | "interest",
): Prisma.TransactionUncheckedCreateInput {
  const ranges: Record<typeof kind, [number, number]> = {
    salary: [92000, 98000],
    freelance: [12000, 45000],
    interest: [400, 1200],
  };
  const [min, max] = ranges[kind];
  const index: Record<typeof kind, 0 | 1 | 2> = { salary: 0, freelance: 1, interest: 2 };

  return {
    accountId,
    amount: money(faker.number.float({ min, max, fractionDigits: 2 })),
    type: "INCOME",
    merchant: INCOME_MERCHANTS[index[kind]],
    category: "Income",
    description: INCOME_DESCRIPTIONS[index[kind]],
    date,
  };
}

async function main() {
  console.log("🌱 Seeding FinSight database...");

  // Idempotent: wipe existing demo data, respecting FK order.
  await prisma.dashboardWidget.deleteMany();
  await prisma.dashboardLayout.deleteMany();
  await prisma.budgetCategory.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.account.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.user.deleteMany();

  // ---------------------------------------------------------------- User
  const user = await prisma.user.create({
    data: { name: "Alex Sharma", email: "alex@finsight.dev" },
  });

  // ------------------------------------------------------------- Accounts
  const hdfcSavings = await prisma.account.create({
    data: {
      userId: user.id,
      name: "HDFC Savings",
      type: "BANK",
      balance: "186420.50",
      currency: "INR",
    },
  });
  const sbiSavings = await prisma.account.create({
    data: {
      userId: user.id,
      name: "SBI Savings",
      type: "BANK",
      balance: "92350.00",
      currency: "INR",
    },
  });
  const cash = await prisma.account.create({
    data: {
      userId: user.id,
      name: "Cash",
      type: "CASH",
      balance: "5420.00",
      currency: "INR",
    },
  });
  const hdfcCredit = await prisma.account.create({
    data: {
      userId: user.id,
      name: "HDFC Credit Card",
      type: "CREDIT_CARD",
      balance: "-31240.75",
      currency: "INR",
    },
  });

  // --------------------------------------------------------- Transactions
  const transactions: Prisma.TransactionUncheckedCreateInput[] = [];

  // ~90 expenses spread across the last 6 months, distributed across accounts.
  for (let i = 0; i < 90; i++) {
    const pool =
      i % 5 === 0 ? cash.id : i % 5 === 1 ? hdfcCredit.id : [hdfcSavings.id, sbiSavings.id][i % 2];
    transactions.push(buildExpense(pool, dateWithinMonths(6)));
  }

  // 6 months of salary + freelance income into the savings accounts.
  for (let m = 0; m < 6; m++) {
    transactions.push(
      buildIncome(hdfcSavings.id, dateWithinMonths(6), "salary"),
      buildIncome(sbiSavings.id, dateWithinMonths(6), "freelance"),
    );
  }

  await prisma.transaction.createMany({ data: transactions });

  // ------------------------------------------------------------- Budgets
  await prisma.budget.create({
    data: {
      userId: user.id,
      name: "Monthly Budget",
      amount: "42000.00",
      period: "MONTHLY",
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      categories: {
        create: [
          { category: "Food", allocatedAmount: "8000.00" },
          { category: "Transport", allocatedAmount: "3500.00" },
          { category: "Shopping", allocatedAmount: "6500.00" },
          { category: "Entertainment", allocatedAmount: "3000.00" },
          { category: "Bills", allocatedAmount: "9000.00" },
          { category: "Subscriptions", allocatedAmount: "2000.00" },
          { category: "Health", allocatedAmount: "2500.00" },
          { category: "Education", allocatedAmount: "2500.00" },
        ],
      },
    },
  });

  // --------------------------------------------------------------- Goals
  await prisma.goal.createMany({
    data: [
      {
        userId: user.id,
        name: "Emergency Fund",
        targetAmount: "600000.00",
        currentAmount: "410000.00",
        targetDate: monthsFromNow(8),
      },
      {
        userId: user.id,
        name: "Japan Trip",
        targetAmount: "350000.00",
        currentAmount: "127500.00",
        targetDate: monthsFromNow(14),
      },
      {
        userId: user.id,
        name: "Car Down Payment",
        targetAmount: "800000.00",
        currentAmount: "285000.00",
        targetDate: monthsFromNow(20),
      },
    ],
  });

  // ----------------------------------------------------- Dashboard layout
  await prisma.dashboardLayout.create({
    data: {
      userId: user.id,
      name: "Default",
      isDefault: true,
      widgets: {
        create: [
          { widgetId: "net-worth", x: 0, y: 0, width: 4, height: 2, sortOrder: 0 },
          { widgetId: "cash-flow", x: 4, y: 0, width: 4, height: 2, sortOrder: 1 },
          { widgetId: "spending-by-category", x: 8, y: 0, width: 4, height: 2, sortOrder: 2 },
          { widgetId: "recent-transactions", x: 0, y: 2, width: 6, height: 2, sortOrder: 3 },
          { widgetId: "budgets", x: 6, y: 2, width: 3, height: 2, sortOrder: 4 },
          { widgetId: "goals", x: 9, y: 2, width: 3, height: 2, sortOrder: 5 },
        ],
      },
    },
  });

  // ------------------------------------------------------------ Summary
  const counts = {
    users: await prisma.user.count(),
    accounts: await prisma.account.count(),
    transactions: await prisma.transaction.count(),
    budgets: await prisma.budget.count(),
    budgetCategories: await prisma.budgetCategory.count(),
    goals: await prisma.goal.count(),
    dashboardLayouts: await prisma.dashboardLayout.count(),
    dashboardWidgets: await prisma.dashboardWidget.count(),
  };

  console.log("✅ Seed complete:", counts);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
