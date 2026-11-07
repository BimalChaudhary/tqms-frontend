import type { Metadata } from "next";
import { QrCard } from "@/features/qr/qr-card";
import { PageHeader } from "@/shared/ui/page-header";
export const metadata: Metadata = { title: "Generate QR" };
export default function Page() {
  return (<><PageHeader title="Checkpoint QR" crumbs={[{ label: "Checkpoint" }, { label: "QR" }]} /><QrCard /></>);
}
