import { getAccounts, getTransactions } from "@/lib/data/queries";
import { TransactionsView } from "./TransactionsView";

export default async function TransactionsPage() {
  // Session-scoped queries; see src/lib/data/queries.ts
  const [transactions, accounts] = await Promise.all([getTransactions(), getAccounts()]);

  return <TransactionsView transactions={transactions} accounts={accounts} />;
}
