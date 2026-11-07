"use client";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Download, Printer, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { apiFetch, errorMessage } from "@/shared/api/client";
import { useLookup } from "@/shared/api/lookup";
import type { ListParams, Paginated } from "@/shared/api/types";
import { FieldShell } from "@/shared/forms/field-shell";
import { useListState } from "@/shared/hooks/use-list-state";
import { downloadBlob, formatDate, formatMoney, toCsv, today } from "@/shared/lib/format";
import { Button } from "@/shared/ui/button";
import { DataTable, type Column } from "@/shared/ui/data-table";
import { useToast } from "@/shared/ui/toast";

export interface CheckpointEntryRow { id: string; sangh: string; checkpoint: string; user: string; entryDate: string; totalVehicles: number; totalAmount: number }
export interface DetailEntryRow {
  id: string; dateTime: string; receiptNo: string; vehicleNo: string; vehicleType: string; checkpoint: string; route: string;
  grossWeight: number; material: string; remarks: string | null;
}

const monthStart = () => `${today().slice(0, 8)}01`;
const dateError = (s: string, e: string) => (!s || !e ? "Choose both dates" : e < s ? "End date must be on or after the start date" : undefined);

/** Draft dates are applied on Search so a half-edited range never triggers a request. */
function useDateRange(list: ReturnType<typeof useListState<Record<string, string>>>) {
  const [draft, setDraft] = useState({ start: list.state.filters.start, end: list.state.filters.end });
  const [touched, setTouched] = useState(false);
  const error = touched ? dateError(draft.start, draft.end) : undefined;
  const apply = () => { setTouched(true); if (!dateError(draft.start, draft.end)) { list.setFilter("start", draft.start); list.setFilter("end", draft.end); } };
  return { draft, setDraft, error, apply, reset: () => { setTouched(false); setDraft({ start: monthStart(), end: today() }); } };
}

function DateFields({ r }: { r: ReturnType<typeof useDateRange> }) {
  return (
    <>
      <FieldShell label="Start date" error={r.error}>{(p) => <input {...p} type="date" className="control" value={r.draft.start} max={r.draft.end || undefined} onChange={(e) => r.setDraft((d) => ({ ...d, start: e.target.value }))} />}</FieldShell>
      <FieldShell label="End date">{(p) => <input {...p} type="date" className="control" value={r.draft.end} min={r.draft.start || undefined} onChange={(e) => r.setDraft((d) => ({ ...d, end: e.target.value }))} />}</FieldShell>
    </>
  );
}

const INIT_CP = { start: monthStart(), end: today(), name: "" };

export function CheckpointEntryReport() {
  const list = useListState<Record<string, string>>(INIT_CP);
  const range = useDateRange(list);
  const [name, setName] = useState("");
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["reports", "checkpoint-entries", list.params], placeholderData: keepPreviousData,
    queryFn: () => apiFetch<Paginated<CheckpointEntryRow>>("/reports/checkpoint-entries", { params: list.params as ListParams }),
  });
  const columns: Column<CheckpointEntryRow>[] = [
    { key: "sn", header: "S.N", cell: (_, n) => n, className: "w-14 text-muted" },
    { key: "sangh", header: "Sthaniya sangh", cell: (r) => r.sangh }, { key: "cp", header: "Checkpoint", cell: (r) => r.checkpoint },
    { key: "user", header: "Checkpoint user", cell: (r) => r.user }, { key: "date", header: "Entry date", cell: (r) => formatDate(r.entryDate) },
    { key: "veh", header: "Total vehicles", cell: (r) => r.totalVehicles, className: "tabular-nums" },
    { key: "amt", header: "Total amount", cell: (r) => formatMoney(r.totalAmount), className: "tabular-nums" },
  ];
  return (
    <>
      <form className="card no-print mb-5 grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto]" onSubmit={(e) => { e.preventDefault(); list.setFilter("name", name.trim()); range.apply(); }}>
        <FieldShell label="Checkpoint / user name">{(p) => <input {...p} className="control" value={name} onChange={(e) => setName(e.target.value)} placeholder="Search by name" />}</FieldShell>
        <DateFields r={range} />
        <div className="flex items-end gap-2">
          <Button type="submit"><Search className="size-4" /> Search</Button>
          <Button variant="secondary" onClick={() => { setName(""); range.reset(); list.reset(); }}>Clear</Button>
        </div>
      </form>
      <DataTable caption="Checkpoint entry report" columns={columns} rows={data?.data} rowKey={(r) => r.id} loading={isLoading} refreshing={isFetching && !isLoading}
        error={error} onRetry={() => refetch()} meta={data?.meta} onPage={list.setPage} onPageSize={list.setPageSize}
        empty={{ title: "No entries for these filters", hint: "Widen the date range or clear the name to see more." }} />
    </>
  );
}

const INIT_DETAIL = { start: monthStart(), end: today(), vehicleNo: "", goods: "", billNo: "" };

export function DetailEntryReport() {
  const toast = useToast();
  const list = useListState<Record<string, string>>(INIT_DETAIL);
  const range = useDateRange(list);
  const [draft, setDraft] = useState({ vehicleNo: "", goods: "", billNo: "" });
  const [exporting, setExporting] = useState(false);
  const vehicles = useLookup("vehicle-numbers"); const goods = useLookup("goods"); const bills = useLookup("bill-numbers");
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["reports", "detail-entries", list.params], placeholderData: keepPreviousData,
    queryFn: () => apiFetch<Paginated<DetailEntryRow>>("/reports/detail-entries", { params: list.params as ListParams }),
  });
  const columns = useMemo<Column<DetailEntryRow>[]>(() => [
    { key: "sn", header: "S.N", cell: (_, n) => n, className: "w-14 text-muted" },
    { key: "dt", header: "Date & time", cell: (r) => new Date(r.dateTime).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) },
    { key: "rec", header: "Receipt no.", cell: (r) => r.receiptNo }, { key: "veh", header: "Vehicle no.", cell: (r) => <span className="font-medium">{r.vehicleNo}</span> },
    { key: "vt", header: "Vehicle type", cell: (r) => r.vehicleType }, { key: "cp", header: "Checkpoint", cell: (r) => r.checkpoint },
    { key: "rt", header: "From – to", cell: (r) => r.route }, { key: "w", header: "Gross weight (kg)", cell: (r) => r.grossWeight.toLocaleString("en-IN"), className: "tabular-nums" },
    { key: "m", header: "Material", cell: (r) => r.material }, { key: "rm", header: "Remarks", cell: (r) => r.remarks ?? "—" },
  ], []);

  const sel = (key: keyof typeof draft, opts?: { value: string; label: string }[]) => (
    <select className="control" value={draft[key]} onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}>
      <option value="">All</option>{opts?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
  // Excel export downloads every row matching the applied filters, not just the visible page.
  const exportCsv = async () => {
    setExporting(true);
    try {
      const all = await apiFetch<Paginated<DetailEntryRow>>("/reports/detail-entries", { params: { ...list.params, page: 1, pageSize: 1000 } as ListParams });
      downloadBlob("\ufeff" + toCsv(
        ["Date & time", "Receipt no.", "Vehicle no.", "Vehicle type", "Checkpoint", "From – to", "Gross weight (kg)", "Material", "Remarks"],
        all.data.map((r) => [r.dateTime, r.receiptNo, r.vehicleNo, r.vehicleType, r.checkpoint, r.route, r.grossWeight, r.material, r.remarks]),
      ), `detail-entry-report-${today()}.csv`, "text/csv;charset=utf-8");
      toast.success(`Exported ${all.data.length} rows`);
    } catch (e) { toast.error(errorMessage(e)); } finally { setExporting(false); }
  };

  return (
    <>
      <div className="no-print mb-3 flex justify-end gap-2">
        <Button variant="secondary" onClick={() => window.print()} disabled={!data?.data.length}><Printer className="size-4" /> Print</Button>
        <Button variant="secondary" onClick={exportCsv} loading={exporting} disabled={!data?.data.length}><Download className="size-4" /> Export Excel</Button>
      </div>
      <form className="card no-print mb-5 grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-6" onSubmit={(e) => { e.preventDefault(); Object.entries(draft).forEach(([k, v]) => list.setFilter(k, v)); range.apply(); }}>
        <DateFields r={range} />
        <FieldShell label="Vehicle no.">{() => sel("vehicleNo", vehicles.data)}</FieldShell>
        <FieldShell label="Goods">{() => sel("goods", goods.data)}</FieldShell>
        <FieldShell label="Bill no.">{() => sel("billNo", bills.data)}</FieldShell>
        <div className="flex items-end gap-2">
          <Button type="submit"><Search className="size-4" /> Search</Button>
          <Button variant="secondary" onClick={() => { setDraft({ vehicleNo: "", goods: "", billNo: "" }); range.reset(); list.reset(); }}>Clear</Button>
        </div>
      </form>
      <DataTable caption="Detail entry report" columns={columns} rows={data?.data} rowKey={(r) => r.id} loading={isLoading} refreshing={isFetching && !isLoading}
        error={error} onRetry={() => refetch()} meta={data?.meta} onPage={list.setPage} onPageSize={list.setPageSize}
        empty={{ title: "No entries for these filters", hint: "Try a wider date range or remove the vehicle, goods or bill filter." }} />
    </>
  );
}
