import type { Metadata } from "next";
import { QueueList } from "@/features/queue/components/queue-list";
import { PageHeader } from "@/shared/ui/page-header";
export const metadata: Metadata = { title: "Queue" };
export default function Page() {
  return (<><PageHeader title="Queue" crumbs={[{ label: "Queue" }]} /><QueueList /></>);
}
