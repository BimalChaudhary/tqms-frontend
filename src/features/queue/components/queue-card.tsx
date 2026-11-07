import { Eye, LogIn, Flag, Receipt as ReceiptIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/shared/ui/button";
import { StatusBadge } from "@/shared/ui/badge";
import { orDash } from "@/shared/lib/format";
import type { QueueSummary } from "../types";

export function QueueCard({ q, onEnd, onReceipt }: { q: QueueSummary; onEnd: (q: QueueSummary) => void; onReceipt: (q: QueueSummary) => void }) {
  const canCheckIn = q.status === "in_job" || q.status === "in_queue";
  return (
    <li className="card flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs text-muted">Queue {q.queueNumber}</p>
          <h3 className="truncate text-base font-semibold tracking-tight" title={q.vehicleNumber}>{q.vehicleNumber}</h3>
        </div>
        <StatusBadge status={q.status} />
      </div>
      <dl className="space-y-1 text-xs">
        <div className="flex justify-between gap-2"><dt className="text-muted">Vehicle type</dt><dd className="truncate text-right">{orDash(q.vehicleType)}</dd></div>
        <div className="flex justify-between gap-2"><dt className="text-muted">Last checkpoint</dt><dd className="truncate text-right">{orDash(q.lastCheckpoint)}</dd></div>
      </dl>
      <div className="mt-auto flex flex-wrap gap-2 border-t border-line pt-3">
        {canCheckIn && <Link href={`/queue/${q.id}/check-in`}><Button size="sm"><LogIn className="size-3.5" /> Check in</Button></Link>}
        {q.status === "payment_pending" && <Button size="sm" onClick={() => onReceipt(q)}><ReceiptIcon className="size-3.5" /> Receipt</Button>}
        <Link href={`/queue/${q.id}`}><Button size="sm" variant="secondary"><Eye className="size-3.5" /> View</Button></Link>
        <Button size="sm" variant="ghost" onClick={() => onEnd(q)}><Flag className="size-3.5" /> End journey</Button>
      </div>
    </li>
  );
}
