import type { Metadata } from "next";
import { OwnerList } from "@/features/vehicle-owners/components/owner-list";
import { PageHeader } from "@/shared/ui/page-header";
export const metadata: Metadata = { title: "Vehicle owners" };
export default function Page() {
  return (<><PageHeader title="Vehicle owners" crumbs={[{ label: "Vehicle" }, { label: "Vehicle owners" }]} /><OwnerList /></>);
}
