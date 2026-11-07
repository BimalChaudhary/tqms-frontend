import type { Metadata } from "next";
import { OtherVehicleForm } from "@/features/other-vehicles/other-vehicles";
import { PageHeader } from "@/shared/ui/page-header";
export const metadata: Metadata = { title: "Add other vehicle" };
export default function Page() {
  return (<><PageHeader title="Add other vehicle" crumbs={[{ label: "Other vehicles", href: "/other-vehicles" }, { label: "New" }]} /><OtherVehicleForm /></>);
}
