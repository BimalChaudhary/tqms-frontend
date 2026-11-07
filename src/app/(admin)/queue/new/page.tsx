import type { Metadata } from "next";
import { NewQueueFlow } from "@/features/queue/components/new-queue-flow";
import { PageHeader } from "@/shared/ui/page-header";
export const metadata: Metadata = { title: "Add new queue" };
export default function Page() {
  return (<><PageHeader title="Create new queue" crumbs={[{ label: "Queue", href: "/queue" }, { label: "New" }]} /><NewQueueFlow /></>);
}
