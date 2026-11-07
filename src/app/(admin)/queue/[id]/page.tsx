import type { Metadata } from "next";
import { QueueDetailView } from "@/features/queue/components/queue-detail";
export const metadata: Metadata = { title: "Queue detail" };
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <QueueDetailView id={id} />;
}
