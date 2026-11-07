import type { Metadata } from "next";
import { VehicleDetailView } from "@/features/vehicles/components/vehicle-detail";
export const metadata: Metadata = { title: "Vehicle detail" };
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <VehicleDetailView id={id} />;
}
