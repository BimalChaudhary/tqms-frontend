import type { Metadata } from "next";
import { OwnerForm } from "@/features/vehicle-owners/components/owner-form";
export const metadata: Metadata = { title: "Edit vehicle owner" };
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OwnerForm id={id} />;
}
