import { getBudgetsWithSpending, getDashboardData, getGoals } from "@/lib/data/queries";
import { DashboardView } from "./DashboardView";

export default async function DashboardPage() {
  const [data, budgets, goals] = await Promise.all([
    getDashboardData(),
    getBudgetsWithSpending(),
    getGoals(),
  ]);

  return <DashboardView data={data} budgets={budgets} goals={goals} />;
}
