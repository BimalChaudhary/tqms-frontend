import type { Metadata } from "next";
import { UserForm } from "@/features/checkpoint-users/components/user-form";
import { PageHeader } from "@/shared/ui/page-header";
export const metadata: Metadata = { title: "Add staff" };
export default function Page() {
  return (<><PageHeader title="Add checkpoint staff" crumbs={[{ label: "Checkpoint users", href: "/checkpoint-users" }, { label: "New" }]} /><UserForm /></>);
}
