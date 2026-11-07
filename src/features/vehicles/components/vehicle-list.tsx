"use client";
import { Eye, Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { useListState } from "@/shared/hooks/use-list-state";
import { Button } from "@/shared/ui/button";
import { DataTable, type Column } from "@/shared/ui/data-table";
import { SearchInput } from "@/shared/ui/search-input";
import { useVehicles } from "../hooks";
import type { VehicleSummary } from "../types";

const NO_FILTERS = {} as Record<string, string>;
const iconLink = "inline-flex size-8 items-center justify-center rounded-md text-muted hover:bg-stone-100 hover:text-ink";

export function VehicleList() {
  const list = useListState(NO_FILTERS);
  const { data, isLoading, isFetching, error, refetch } = useVehicles(list.params);
  const columns: Column<VehicleSummary>[] = [
    { key: "sn", header: "S.N", cell: (_, n) => n, className: "w-14 text-muted" },
    { key: "plateNo", header: "Plate no.", sortable: true, cell: (v) => <span className="font-medium">{v.plateNo}</span> },
    { key: "lotNo", header: "Lot no.", cell: (v) => v.lotNo ?? "—" },
    { key: "vehicleNumber", header: "Vehicle number", cell: (v) => v.vehicleNumber },
    { key: "vehicleType", header: "Vehicle type", cell: (v) => v.vehicleType },
    { key: "actions", header: "Actions", srOnlyHeader: true, className: "w-24", cell: (v) => (
      <div className="flex justify-end">
        <Link className={iconLink} href={`/vehicles/${v.id}/edit`} aria-label={`Edit ${v.plateNo}`} title="Edit"><Pencil className="size-4" /></Link>
        <Link className={iconLink} href={`/vehicles/${v.id}`} aria-label={`View ${v.plateNo}`} title="View"><Eye className="size-4" /></Link>
      </div>) },
  ];
  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <SearchInput value={list.state.q} onChange={list.setQ} placeholder="Search by plate number" label="Search vehicles" />
        <Link href="/vehicles/new"><Button><Plus className="size-4" /> Add vehicle</Button></Link>
      </div>
      <DataTable caption="Registered vehicles" columns={columns} rows={data?.data} rowKey={(v) => v.id} loading={isLoading} refreshing={isFetching && !isLoading}
        error={error} onRetry={() => refetch()} meta={data?.meta} onPage={list.setPage} onPageSize={list.setPageSize}
        sort={{ key: list.state.sort, order: list.state.order }} onSort={list.toggleSort}
        empty={list.state.q ? { title: "No vehicle matches that plate number", hint: "Check the number or try a shorter search." }
          : { title: "No vehicles registered yet", action: <Link href="/vehicles/new"><Button size="sm">Add vehicle</Button></Link> }} />
    </>
  );
}
