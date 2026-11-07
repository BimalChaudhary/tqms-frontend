import type { Metadata } from "next";
import { VehicleList } from "@/features/vehicles/components/vehicle-list";
import { PageHeader } from "@/shared/ui/page-header";
export const metadata: Metadata = { title: "Vehicles" };
export default function Page() {
  return (<><PageHeader title="Vehicles" crumbs={[{ label: "Vehicle" }, { label: "Vehicles" }]} /><VehicleList /></>);
}
