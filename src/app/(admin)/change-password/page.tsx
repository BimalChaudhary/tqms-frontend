import type { Metadata } from "next";
import { ChangePasswordForm } from "@/features/auth/components/change-password-form";
import { PageHeader } from "@/shared/ui/page-header";
export const metadata: Metadata = { title: "Change password" };
export default function Page() {
  return (<><PageHeader title="Change password" crumbs={[{ label: "Change password" }]} /><ChangePasswordForm /></>);
}
