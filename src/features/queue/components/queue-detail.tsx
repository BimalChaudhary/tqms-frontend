"use client";
import { Flag, ListChecks, LogIn, Receipt as ReceiptIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { StatusBadge } from "@/shared/ui/badge";
import { Section } from "@/shared/ui/card-section";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { DataTable, type Column } from "@/shared/ui/data-table";
import { DetailList } from "@/shared/ui/detail-list";
import { Skeleton } from "@/shared/ui/skeleton";
import { ErrorState } from "@/shared/ui/states";
import { PageHeader } from "@/shared/ui/page-header";
import { formatDate } from "@/shared/lib/format";
import { useEndJourney, useQueue } from "../hooks";
import type { QueueEntry } from "../types";
import { ReceiptDialog } from "./receipt-dialog";

const kg = (n: number | null) => (n == null ? "—" : n.toLocaleString("en-IN"));

export function QueueDetailView({ id }: { id: string }) {
  const { data, isLoading, error, refetch } = useQueue(id);
  const end = useEndJourney();
  const [confirm, setConfirm] = useState(false);
  const [receipt, setReceipt] = useState(false);

  if (error) return <div className="card"><ErrorState error={error} onRetry={() => refetch()} /></div>;
  if (isLoading || !data) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-40 w-full" /><Skeleton className="h-48 w-full" /></div>;

  const columns: Column<QueueEntry>[] = [
    { key: "sn", header: "S.N", cell: (_, n) => n, className: "w-14 text-muted" },
    { key: "date", header: "Entry date", cell: (e) => formatDate(e.entryDate) },
    { key: "from", header: "From", cell: (e) => e.from }, { key: "to", header: "To", cell: (e) => e.to },
    { key: "cp1", header: "CP1 wt (kg)", cell: (e) => kg(e.weights.cp1), className: "tabular-nums" },
    { key: "cp2", header: "CP2 wt (kg)", cell: (e) => kg(e.weights.cp2), className: "tabular-nums" },
    { key: "cp3", header: "CP3 wt (kg)", cell: (e) => kg(e.weights.cp3), className: "tabular-nums" },
    { key: "bill", header: "Bill no.", cell: (e) => e.billNo ?? "—" },
  ];

  return (
    <>
      <PageHeader title={`Queue ${data.queueNumber}`} crumbs={[{ label: "Queue", href: "/queue" }, { label: data.vehicleNumber }]}
        actions={<>
          <Link href="/queue"><Button variant="secondary"><ListChecks className="size-4" /> Queue list</Button></Link>
          {data.status === "payment_pending" && <Button variant="secondary" onClick={() => setReceipt(true)}><ReceiptIcon className="size-4" /> Receipt</Button>}
          <Button variant="secondary" onClick={() => setConfirm(true)}><Flag className="size-4" /> End journey</Button>
          {(data.status === "in_job" || data.status === "in_queue") && <Link href={`/queue/${id}/check-in`}><Button><LogIn className="size-4" /> Check in</Button></Link>}
        </>} />
      <div className="space-y-5">
        <Section title="Vehicle" actions={<StatusBadge status={data.status} />}>
          <h2 className="mb-2 text-lg font-semibold">{data.vehicleNumber}</h2>
          <DetailList items={[
            { label: "Card number", value: data.cardNumber }, { label: "Card type", value: data.cardType },
            { label: "Vehicle type", value: data.vehicleType }, { label: "Owner", value: data.owner },
            { label: "Sthaniya sangh", value: data.sangh }, { label: "Registered", value: data.isRegistered ? "Yes" : "No" },
          ]} />
        </Section>
        <Section title="Journey entries">
          <DataTable caption="Journey entries" columns={columns} rows={data.entries} rowKey={(e) => e.id}
            empty={{ title: "No entries yet", hint: "Entries appear after the first check-in." }} />
        </Section>
      </div>
      <ConfirmDialog open={confirm} title="End this journey?" confirmLabel="End journey" loading={end.isPending}
        description={`${data.vehicleNumber} will be marked as completed and removed from the active queue.`}
        onCancel={() => setConfirm(false)} onConfirm={() => end.mutate(id, { onSettled: () => setConfirm(false) })} />
      <ReceiptDialog queueId={receipt ? id : null} onClose={() => setReceipt(false)} />
    </>
  );
}
