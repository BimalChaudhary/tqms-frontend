"use client";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Combobox } from "@/shared/forms/combobox";
import { FieldShell } from "@/shared/forms/field-shell";
import { useLookup } from "@/shared/api/lookup";
import { useListState } from "@/shared/hooks/use-list-state";
import { Button } from "@/shared/ui/button";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { Pagination } from "@/shared/ui/pagination";
import { Skeleton } from "@/shared/ui/skeleton";
import { EmptyState, ErrorState } from "@/shared/ui/states";
import { Tabs, TabPanel } from "@/shared/ui/tabs";
import { useEndJourney, useQueues } from "../hooks";
import type { QueueStatus, QueueSummary } from "../types";
import { PendingQueues } from "./pending-queues";
import { QueueCard } from "./queue-card";
import { ReceiptDialog } from "./receipt-dialog";

const TABS = [
  { id: "all", label: "All" }, { id: "in_job", label: "In job" }, { id: "in_queue", label: "In queue" },
  { id: "unregistered", label: "Unregistered" }, { id: "payment_pending", label: "Payment pending" },
];
const INIT = { vehicleId: "", cardType: "", vehicleType: "" };

export function QueueList() {
  const router = useRouter(); const path = usePathname(); const sp = useSearchParams();
  const status = (TABS.some((t) => t.id === sp.get("status")) ? sp.get("status") : "all") as "all" | QueueStatus;
  const list = useListState(INIT, 12);
  // Filters are edited in a draft and applied on "Search", like the existing system.
  const [draft, setDraft] = useState(INIT);
  const params = useMemo(() => ({ ...list.params, status: status === "all" ? undefined : status }), [list.params, status]);
  const { data, isLoading, isFetching, error, refetch } = useQueues(params);
  const end = useEndJourney();
  const [ending, setEnding] = useState<QueueSummary | null>(null);
  const [receiptId, setReceiptId] = useState<string | null>(null);
  const cardTypes = useLookup("card-types"); const vehicleTypes = useLookup("vehicle-types");
  const filtersActive = Object.values(list.state.filters).some(Boolean);

  const setStatus = (id: string) => { list.setPage(1); router.replace(id === "all" ? path : `${path}?status=${id}`, { scroll: false }); };
  const apply = () => { Object.entries(draft).forEach(([k, v]) => list.setFilter(k as keyof typeof INIT, v)); };
  const clear = () => { setDraft(INIT); list.reset(); };
  const sel = (key: "cardType" | "vehicleType", opts?: { value: string; label: string }[]) => (
    <select className="control" value={draft[key]} onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))} id={`f-${key}`}>
      <option value="">All</option>{opts?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );

  return (
    <>
      {status === "all" && !filtersActive && <PendingQueues />}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Tabs label="Queue status" variant="pill" tabs={TABS} value={status} onChange={setStatus} />
        <Link href="/queue/new"><Button><Plus className="size-4" /> Add new queue</Button></Link>
      </div>

      <form className="card mb-5 grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto]" onSubmit={(e) => { e.preventDefault(); apply(); }}>
        <FieldShell label="Vehicle">{(p) => <Combobox id={p.id} lookup="vehicles" value={draft.vehicleId} onChange={(v) => setDraft((d) => ({ ...d, vehicleId: v }))} placeholder="Search plate number" />}</FieldShell>
        <FieldShell label="Card type">{() => sel("cardType", cardTypes.data)}</FieldShell>
        <FieldShell label="Vehicle type">{() => sel("vehicleType", vehicleTypes.data)}</FieldShell>
        <div className="flex items-end gap-2">
          <Button type="submit"><Search className="size-4" /> Search</Button>
          <Button variant="secondary" onClick={clear} disabled={!filtersActive && !Object.values(draft).some(Boolean)}>Clear</Button>
        </div>
      </form>

      <TabPanel id="results">
        {error ? <div className="card"><ErrorState error={error} onRetry={() => refetch()} /></div>
          : isLoading ? <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <li key={i} className="card space-y-3 p-4"><Skeleton className="h-3 w-20" /><Skeleton className="h-5 w-32" /><Skeleton className="h-3 w-full" /><Skeleton className="h-8 w-full" /></li>)}</ul>
          : data && data.data.length === 0 ? <div className="card"><EmptyState title={filtersActive ? "No queues match these filters" : "No vehicles here right now"}
              hint={filtersActive ? "Clear the filters to see every queue." : "New vehicles appear here as soon as a queue is created."}
              action={filtersActive ? <Button variant="secondary" size="sm" onClick={clear}>Clear filters</Button> : <Link href="/queue/new"><Button size="sm">Add new queue</Button></Link>} /></div>
          : <>
              <ul className={`grid gap-4 transition-opacity sm:grid-cols-2 xl:grid-cols-4 ${isFetching ? "opacity-60" : ""}`}>
                {data?.data.map((q) => <QueueCard key={q.id} q={q} onEnd={setEnding} onReceipt={(x) => setReceiptId(x.id)} />)}
              </ul>
              {data && <div className="card mt-4"><Pagination meta={data.meta} onPage={list.setPage} /></div>}
            </>}
      </TabPanel>

      <ConfirmDialog open={!!ending} title="End this journey?" confirmLabel="End journey" loading={end.isPending}
        description={`${ending?.vehicleNumber} (queue ${ending?.queueNumber}) will be marked as completed and removed from the active queue.`}
        onCancel={() => setEnding(null)} onConfirm={() => ending && end.mutate(ending.id, { onSettled: () => setEnding(null) })} />
      <ReceiptDialog queueId={receiptId} onClose={() => setReceiptId(null)} />
    </>
  );
}
