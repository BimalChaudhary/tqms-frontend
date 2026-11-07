import type { Metadata } from "next";
import { UserForm } from "@/features/checkpoint-users/components/user-form";
import { PageHeader } from "@/shared/ui/page-header";
export const metadata: Metadata = { title: "Edit staff" };
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (<><PageHeader title="Edit checkpoint staff" crumbs={[{ label: "Checkpoint users", href: "/checkpoint-users" }, { label: "Edit" }]} /><UserForm id={id} /></>);
}
