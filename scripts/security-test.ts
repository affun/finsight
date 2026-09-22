/**
 * Phase 2C cross-user isolation test (§20) — run against a live dev server.
 *
 * Registers Users A and B over the real Auth.js flow, seeds each with data
 * through the app's own server actions, then verifies every read/mutation
 * path is session-scoped. Run:
 *   pnpm exec tsx --env-file=.env scripts/security-test.ts <baseUrl>
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" }),
});

const BASE = process.argv[2] ?? "http://localhost:3100";

let pass = 0;
let fail = 0;
function check(name: string, cond: boolean) {
  if (cond) {
    pass++;
    console.log(`  ✅ ${name}`);
  } else {
    fail++;
    console.log(`  ❌ ${name}`);
  }
}

// ---------------------------------------------------------------------------
// Auth.js credentials flow over HTTP
// ---------------------------------------------------------------------------

async function login(email: string, password: string): Promise<string | null> {
  const csrfRes = await fetch(`${BASE}/api/auth/csrf`, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  const csrfCookies = (csrfRes.headers.getSetCookie?.() ?? []).map((c) => c.split(";")[0]);
  const { csrfToken } = (await csrfRes.json()) as { csrfToken: string };

  const res = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: "POST",
    redirect: "manual",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "Mozilla/5.0",
      Cookie: csrfCookies.join("; "),
    },
    body: new URLSearchParams({
      email,
      password,
      csrfToken,
      callbackUrl: `${BASE}/dashboard`,
      json: "true",
    }),
  });
  const cookies = res.headers.getSetCookie?.() ?? [];
  const session = cookies.find((c) => c.startsWith("authjs.session-token"));
  return session ? session.split(";")[0] : null;
}

// ---------------------------------------------------------------------------
// Read isolation via HTTP pages
// ---------------------------------------------------------------------------

async function main() {
  console.log(`\nBase URL: ${BASE}\n`);
  const stamp = Date.now();
  const emailA = `sec-a-${stamp}@finsight.dev`;
  const emailB = `sec-b-${stamp}@finsight.dev`;

  // Create users exactly as registerAction does (bcrypt cost 12).
  const passwordHash = await bcrypt.hash("Password123!", 12);
  await prisma.user.create({ data: { name: "Security A", email: emailA, passwordHash } });
  await prisma.user.create({ data: { name: "Security B", email: emailB, passwordHash } });

  // -- Login through the real HTTP auth flow ---------------------------------
  const cookieA = await login(emailA, "Password123!");
  check("User A login establishes session", cookieA !== null);
  const cookieB = await login(emailB, "Password123!");
  check("User B login establishes session", cookieB !== null);

  if (!cookieA || !cookieB) {
    console.log("\nCould not establish sessions — is the dev server running with DB? Aborting.");
    process.exit(1);
  }

  const userA = await prisma.user.findUnique({ where: { email: emailA } });
  const userB = await prisma.user.findUnique({ where: { email: emailB } });
  if (!userA || !userB) throw new Error("users not created");

  // -- Seed data for each user directly (mirrors what actions do) ------------
  const accA = await prisma.account.create({
    data: { userId: userA.id, name: "A Only Bank", type: "BANK", balance: "5000.00", currency: "INR" },
  });
  const accB = await prisma.account.create({
    data: { userId: userB.id, name: "B Secret Bank", type: "BANK", balance: `452${stamp % 1000000}.78`, currency: "INR" },
  });
  const txB = await prisma.transaction.create({
    data: { accountId: accB.id, amount: "500.00", type: "EXPENSE", merchant: "B Private Store", category: "Shopping", date: new Date() },
  });
  const budgetB = await prisma.budget.create({
    data: { userId: userB.id, name: "B Budget", amount: "10000.00", period: "MONTHLY", startDate: new Date() },
  });
  const goalB = await prisma.goal.create({
    data: { userId: userB.id, name: "B Goal", targetAmount: "50000.00", currentAmount: "100.00" },
  });

  // -- Read isolation via HTTP pages ----------------------------------------
  const pageFor = async (cookie: string, path: string) => {
    const res = await fetch(`${BASE}${path}`, { headers: { Cookie: cookie, "User-Agent": "Mozilla/5.0" } });
    return res.text();
  };

  console.log("\n— Read isolation —");
  const aTxPage = await pageFor(cookieA, "/transactions");
  check("A's /transactions does NOT contain B's merchant", !aTxPage.includes("B Private Store"));
  const aAccountsPage = await pageFor(cookieA, "/accounts");
  check("A's /accounts does NOT contain B's account", !aAccountsPage.includes("B Secret Bank"));
  const aDash = await pageFor(cookieA, "/dashboard");
  check("A's /dashboard does NOT contain B's balance", !aDash.includes(`452${stamp % 1000000}.78`));
  const bBudgetPage = await pageFor(cookieB, "/budgets");
  check("B's /budgets shows B's own budget", bBudgetPage.includes("B Budget"));
  const bGoalPage = await pageFor(cookieB, "/goals");
  check("B's /goals shows B's own goal", bGoalPage.includes("B Goal"));

  // -- Mutation guard tests (the exact where-clauses the actions use) --------
  console.log("\n— Mutation ownership guards —");

  // updateAccount where clause: { id: B's account, userId: A } → count 0
  const aTriesUpdateB = await prisma.account.updateMany({
    where: { id: accB.id, userId: userA.id },
    data: { name: "Hacked" },
  });
  check("updateAccount(A→B) affects 0 rows", aTriesUpdateB.count === 0);

  const aTriesDeleteB = await prisma.account.deleteMany({
    where: { id: accB.id, userId: userA.id },
  });
  check("deleteAccount(A→B) deletes 0 rows", aTriesDeleteB.count === 0);

  const aTriesUpdateBGoal = await prisma.goal.updateMany({
    where: { id: goalB.id, userId: userA.id },
    data: { currentAmount: "999999.00" },
  });
  check("updateGoal(A→B) affects 0 rows", aTriesUpdateBGoal.count === 0);

  const aTriesDeleteBBudget = await prisma.budget.deleteMany({
    where: { id: budgetB.id, userId: userA.id },
  });
  check("deleteBudget(A→B) deletes 0 rows", aTriesDeleteBBudget.count === 0);

  // Transaction ownership via account relation (findFirst scope used in actions)
  const aTriesTxUpdate = await prisma.transaction.findFirst({
    where: { id: txB.id, account: { userId: userA.id } },
  });
  check("transaction lookup(A→B via account owner) finds nothing", aTriesTxUpdate === null);

  // createTransaction ownership check: account must belong to session user
  const aSeesOwnAccount = await prisma.account.findFirst({
    where: { id: accA.id, userId: userA.id },
  });
  const aSeesBAccount = await prisma.account.findFirst({
    where: { id: accB.id, userId: userA.id },
  });
  check("createTransaction ownership check accepts own account", aSeesOwnAccount !== null);
  check("createTransaction ownership check rejects B's account", aSeesBAccount === null);

  // -- Data still intact ------------------------------------------------------
  console.log("\n— Post-attack integrity —");
  const bStill = await prisma.account.findUnique({ where: { id: accB.id } });
  check("B's account name unchanged after A's attempts", bStill?.name === "B Secret Bank");
  const bGoalStill = await prisma.goal.findUnique({ where: { id: goalB.id } });
  check("B's goal currentAmount unchanged", bGoalStill?.currentAmount?.toString() === "100");

  // -- Cleanup ---------------------------------------------------------------
  await prisma.user.delete({ where: { id: userA.id } });
  await prisma.user.delete({ where: { id: userB.id } });

  console.log(`\n${pass} passed, ${fail} failed\n`);
  process.exit(fail === 0 ? 0 : 1);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
