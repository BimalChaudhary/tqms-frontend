"use client";
import { Eye, Pencil, Plus, Printer } from "lucide-react";
import Link from "next/link";
import { useListState } from "@/shared/hooks/use-list-state";
import { Button } from "@/shared/ui/button";
import { StatusBadge } from "@/shared/ui/badge";
import { DataTable, type Column } from "@/shared/ui/data-table";
import { SearchInput } from "@/shared/ui/search-input";
import { useSession } from "@/features/auth/hooks";
import { useOwners } from "../hooks";
import type { OwnerSummary } from "../types";

const INIT = { verified: "all" };
const iconLink = "inline-flex size-8 items-center justify-center rounded-md text-muted hover:bg-stone-100 hover:text-ink";

export function OwnerList() {
  const list = useListState(INIT);
  const { data, isLoading, isFetching, error, refetch } = useOwners(list.params);
  const { data: session } = useSession();
  const columns: Column<OwnerSummary>[] = [
    { key: "sn", header: "S.N", cell: (_, n) => n, className: "w-14 text-muted" },
    { key: "name", header: "Name / company", sortable: true, cell: (o) => (<><span className="font-medium">{o.name}</span><span className="block text-xs text-muted">{o.email ?? "No email"}</span></>) },
    { key: "address", header: "Address", cell: (o) => o.address },
    { key: "phone", header: "Phone", cell: (o) => o.phone },
    { key: "linked", header: "Linked owner", cell: (o) => o.linkedOwner ?? "—" },
    { key: "assigned", header: "Vehicle", cell: (o) => <StatusBadge status={o.isAssigned ? "assigned" : "unassigned"} /> },
    { key: "actions", header: "Actions", srOnlyHeader: true, className: "no-print w-24", cell: (o) => (
      <div className="no-print flex justify-end">
        <Link className={iconLink} href={`/vehicle-owners/${o.id}/edit`} aria-label={`Edit ${o.name}`} title="Edit"><Pencil className="size-4" /></Link>
        <Link className={iconLink} href={`/vehicle-owners/${o.id}`} aria-label={`View ${o.name}`} title="View"><Eye className="size-4" /></Link>
      </div>) },
  ];
  return (
    <>
      <div className="no-print mb-4 flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap items-end gap-3">
          <label className="space-y-1.5 text-sm font-medium">Verification
            <select className="control mt-1.5 !w-44" value={list.state.filters.verified} onChange={(e) => list.setFilter("verified", e.target.value)}>
              <option value="all">All owners</option><option value="verified">Verified</option><option value="unverified">Unverified</option>
            </select>
          </label>
          <SearchInput value={list.state.q} onChange={list.setQ} placeholder="Search by name or phone" label="Search owners" />
          <Button variant="secondary" onClick={list.reset} disabled={!list.state.q && list.state.filters.verified === "all"}>Clear</Button>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => window.print()} disabled={!data?.data.length}><Printer className="size-4" /> Print</Button>
          <Link href="/vehicle-owners/new"><Button><Plus className="size-4" /> Add owner</Button></Link>
        </div>
      </div>
      <div className="owner-screen-list">
        <DataTable caption="Vehicle owners" columns={columns} rows={data?.data} rowKey={(o) => o.id} loading={isLoading} refreshing={isFetching && !isLoading}
          error={error} onRetry={() => refetch()} meta={data?.meta} onPage={list.setPage} onPageSize={list.setPageSize}
          sort={{ key: list.state.sort, order: list.state.order }} onSort={list.toggleSort}
          empty={{ title: "No owners match", hint: "Try another name, number or verification filter.", action: <Button variant="secondary" size="sm" onClick={list.reset}>Clear filters</Button> }} />
      </div>
      <section className="owner-print-report" aria-label="Vehicle owner print report">
        <table>
          <thead>
            <tr>
              <th>Mahasangh Name</th>
              <th>SthaniyaSangh Name</th>
              <th>VehicleOwner Name</th>
              <th>Address</th>
              <th>Email</th>
              <th>Phone Number</th>
              <th>VehicleOwner Type</th>
            </tr>
          </thead>
          <tbody>
            {data?.data.map((owner) => (
              <tr key={owner.id}>
                <td>नेपाल ट्रक यातायात व्यवसायी महासंघ</td>
                <td>{session?.sthaniyaSangh ?? "N/A"}</td>
                <td>{owner.name || "N/A"}</td>
                <td>{owner.address || "N/A"}</td>
                <td>{owner.email || "N/A"}</td>
                <td>{owner.phone || "N/A"}</td>
                <td>{owner.isVerified ? "Verified" : "Unverified"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
