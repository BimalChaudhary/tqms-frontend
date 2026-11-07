import type { Metadata } from "next";
import { OtherVehicleList } from "@/features/other-vehicles/other-vehicles";
import { PageHeader } from "@/shared/ui/page-header";
export const metadata: Metadata = { title: "Other vehicles" };
export default function Page() {
  return (<><PageHeader title="Other vehicles" crumbs={[{ label: "Vehicle" }, { label: "Other vehicles" }]} /><OtherVehicleList /></>);
}
