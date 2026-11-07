import type { Metadata } from "next";
import { OwnerDetailView } from "@/features/vehicle-owners/components/owner-detail";
export const metadata: Metadata = { title: "Vehicle owner" };
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OwnerDetailView id={id} />;
}
