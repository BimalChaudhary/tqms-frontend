import type { Metadata } from "next";
import { ApprovePendingForm } from "@/features/queue/components/approve-pending-form";
export const metadata: Metadata = { title: "Approve queue" };
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ApprovePendingForm id={id} />;
}
