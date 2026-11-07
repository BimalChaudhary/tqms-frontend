import type { Metadata } from "next";
import { StatsGrid } from "@/features/dashboard/stats-grid";
import { PageHeader } from "@/shared/ui/page-header";
export const metadata: Metadata = { title: "Dashboard" };
export default function Page() {
  return (<><PageHeader title="Dashboard" crumbs={[{ label: "Dashboard" }]} /><StatsGrid /></>);
}
