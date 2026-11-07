import type { Metadata } from "next";
import { ProfileCard } from "@/features/auth/components/profile-card";
import { PageHeader } from "@/shared/ui/page-header";
export const metadata: Metadata = { title: "My profile" };
export default function Page() {
  return (<><PageHeader title="Profile" crumbs={[{ label: "Profile" }]} /><ProfileCard /></>);
}
