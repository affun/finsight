import { getAnalyticsData } from "@/lib/data/queries";
import { AnalyticsView } from "./AnalyticsView";

export default async function AnalyticsPage() {
  const data = await getAnalyticsData();
  return <AnalyticsView data={data} />;
}
