import type { Metadata } from "next";
import { CheckpointEntryReport } from "@/features/reports/reports";
import { PageHeader } from "@/shared/ui/page-header";
export const metadata: Metadata = { title: "Checkpoint entry report" };
export default function Page() {
  return (<><PageHeader title="Checkpoint entry report" crumbs={[{ label: "Report" }, { label: "Checkpoint entry" }]} /><CheckpointEntryReport /></>);
}
