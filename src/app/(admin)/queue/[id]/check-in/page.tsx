import type { Metadata } from "next";
import { CheckInForm } from "@/features/queue/components/check-in-form";
export const metadata: Metadata = { title: "Check in" };
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CheckInForm id={id} />;
}
