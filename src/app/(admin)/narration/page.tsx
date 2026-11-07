import type { Metadata } from "next";
import { NarrationForm } from "@/features/narration/narration-form";
import { PageHeader } from "@/shared/ui/page-header";
export const metadata: Metadata = { title: "Narration" };
export default function Page() {
  return (<><PageHeader title="Narration" crumbs={[{ label: "Checkpoints" }, { label: "Narration" }]} /><NarrationForm /></>);
}
