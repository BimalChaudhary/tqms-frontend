"use client";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { Skeleton } from "@/shared/ui/skeleton";
import { ErrorState } from "@/shared/ui/states";
import { formatDate } from "@/shared/lib/format";
import { usePendingQueues, useRemovePending } from "../hooks";
import type { PendingQueue } from "../types";

/** Unregistered vehicles that arrived via QR and need staff approval before they join the queue. */
export function PendingQueues() {
  const { data, isLoading, error, refetch } = usePendingQueues();
  const del = useRemovePending();
  const [target, setTarget] = useState<PendingQueue | null>(null);
  const [all, setAll] = useState(false);
  if (!isLoading && !error && data?.length === 0) return null;
  const items = all ? data : data?.slice(0, 8);

  return (
    <section aria-labelledby="pending-h" className="mb-8">
      <div className="mb-3 flex items-center justify-between">
        <h2 id="pending-h" className="text-sm font-semibold">Awaiting approval {data && <span className="ml-1 text-muted">({data.length})</span>}</h2>
        {data && data.length > 8 && <Button variant="ghost" size="sm" onClick={() => setAll((a) => !a)}>{all ? "Show fewer" : `Show all ${data.length}`}</Button>}
      </div>
      {error ? <div className="card"><ErrorState error={error} onRetry={() => refetch()} /></div> : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {isLoading && Array.from({ length: 4 }).map((_, i) => <li key={i} className="card p-4"><Skeleton className="mb-2 h-4 w-24" /><Skeleton className="h-3 w-full" /></li>)}
          {items?.map((p) => (
            <li key={p.id} className="card flex flex-col gap-2 border-l-4 border-l-warn p-4">
              <p className="font-semibold">{p.vehicleNumber}</p>
              <p className="text-xs text-muted">{p.route}</p>
              <p className="text-xs text-muted">Entered {formatDate(p.entryDate)}</p>
              <div className="mt-1 flex gap-2">
                <Link href={`/queue/pending/${p.id}`}><Button size="sm">Review</Button></Link>
                <Button size="sm" variant="ghost" className="hover:text-bad" onClick={() => setTarget(p)}>Delete</Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <ConfirmDialog open={!!target} title="Delete this pending entry?" confirmLabel="Delete" loading={del.isPending}
        description={`${target?.vehicleNumber} will be removed from the approval list. The driver will need to submit again.`}
        onCancel={() => setTarget(null)} onConfirm={() => target && del.mutate(target.id, { onSettled: () => setTarget(null) })} />
    </section>
  );
}
