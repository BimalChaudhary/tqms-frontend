"use client";
import { ChevronUp } from "lucide-react";
import { useState } from "react";
import { cn } from "@/shared/lib/cn";
import { Skeleton } from "@/shared/ui/skeleton";
import { EmptyState, ErrorState } from "@/shared/ui/states";
import { formatDate } from "@/shared/lib/format";
import { useAuditLogs } from "../hooks";

/** Collapsed by default; the log is only fetched the first time it is opened. */
export function AuditLog({ vehicleId }: { vehicleId: string }) {
  const [open, setOpen] = useState(false);
  const { data, isLoading, error, refetch } = useAuditLogs(vehicleId, open);
  return (
    <section className="card mt-5">
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="audit-panel" className="flex w-full items-center justify-between px-5 py-3 text-sm font-semibold">
        Audit logs <ChevronUp className={cn("size-4 transition-transform", !open && "rotate-180")} aria-hidden />
      </button>
      {open && (
        <div id="audit-panel" className="border-t border-line">
          {error ? <ErrorState error={error} onRetry={() => refetch()} />
            : isLoading ? <div className="space-y-2 p-5">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-5" />)}</div>
            : !data?.length ? <EmptyState title="No changes recorded" />
            : <ul className="divide-y divide-line">{data.map((l) => (
                <li key={l.id} className="flex flex-wrap items-baseline justify-between gap-2 px-5 py-3 text-sm">
                  <span><strong className="font-medium">{l.action}</strong> <span className="text-muted">· {l.detail}</span></span>
                  <span className="text-xs text-muted">{l.user} · {formatDate(l.at)}</span>
                </li>))}</ul>}
        </div>
      )}
    </section>
  );
}
