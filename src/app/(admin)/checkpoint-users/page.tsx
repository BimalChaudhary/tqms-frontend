import type { Metadata } from "next";
import { UserList } from "@/features/checkpoint-users/components/user-list";
import { PageHeader } from "@/shared/ui/page-header";
export const metadata: Metadata = { title: "Checkpoint users" };
export default function Page() {
  return (<><PageHeader title="Checkpoint users" crumbs={[{ label: "Checkpoints" }, { label: "Checkpoint users" }]} /><UserList /></>);
}
