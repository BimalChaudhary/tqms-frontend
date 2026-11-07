import type { Metadata } from "next";
import { DetailEntryReport } from "@/features/reports/reports";
import { PageHeader } from "@/shared/ui/page-header";
export const metadata: Metadata = { title: "Detail entry report" };
export default function Page() {
  return (<><PageHeader title="Detail entry report" crumbs={[{ label: "Report" }, { label: "Detail entry report" }]} /><DetailEntryReport /></>);
}
