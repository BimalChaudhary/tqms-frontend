"use client";
import { Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useListState } from "@/shared/hooks/use-list-state";
import { Button, IconButton } from "@/shared/ui/button";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { DataTable, type Column } from "@/shared/ui/data-table";
import { SearchInput } from "@/shared/ui/search-input";
import { cn } from "@/shared/lib/cn";
import { useCheckpointUsers, useDeleteCheckpointUser, useToggleUserStatus } from "../hooks";
import type { CheckpointUser } from "../types";

const NO_FILTERS = {} as Record<string, string>;

export function UserList() {
  const list = useListState(NO_FILTERS);
  const { data, isLoading, isFetching, error, refetch } = useCheckpointUsers(list.params);
  const toggle = useToggleUserStatus(list.params);
  const del = useDeleteCheckpointUser();
  const [target, setTarget] = useState<CheckpointUser | null>(null);

  const columns: Column<CheckpointUser>[] = [
    { key: "sn", header: "S.N", cell: (_, n) => n, className: "w-14 text-muted" },
    { key: "name", header: "Name", sortable: true, cell: (u) => <span className="font-medium">{u.name}</span> },
    { key: "address", header: "Address", cell: (u) => u.address || "—" },
    { key: "contact", header: "Contact", cell: (u) => u.contact },
    { key: "status", header: "Status", cell: (u) => (
      <button role="switch" aria-checked={u.isActive} aria-label={`${u.name} is ${u.isActive ? "active" : "inactive"}`}
        onClick={() => toggle.mutate({ id: u.id, isActive: !u.isActive })}
        className={cn(
          "relative h-5 w-9 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          u.isActive
            ? "bg-ok focus-visible:ring-ok"
            : "bg-stone-300 focus-visible:ring-stone-500",
        )}>
        <span className={cn("absolute left-0.5 top-0.5 size-4 rounded-full bg-white shadow transition-transform", u.isActive && "translate-x-4")} />
      </button>) },
    { key: "actions", header: "Actions", srOnlyHeader: true, className: "w-24", cell: (u) => (
      <div className="flex justify-end">
        <Link href={`/checkpoint-users/${u.id}/edit`} aria-label={`Edit ${u.name}`} title="Edit"
          className="inline-flex size-8 items-center justify-center rounded-md text-info transition-colors hover:bg-blue-50 hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info focus-visible:ring-offset-1">
          <Pencil className="size-4" />
        </Link>
        <IconButton label={`Delete ${u.name}`} onClick={() => setTarget(u)}
          className="text-bad hover:bg-red-50 hover:text-red-800 focus-visible:ring-bad">
          <Trash2 className="size-4" />
        </IconButton>
      </div>) },
  ];

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <SearchInput value={list.state.q} onChange={list.setQ} placeholder="Search by name, contact or address" />
        <Link href="/checkpoint-users/new"><Button><Plus className="size-4" /> Add staff</Button></Link>
      </div>
      <DataTable caption="Checkpoint staff" columns={columns} rows={data?.data} rowKey={(u) => u.id} loading={isLoading} refreshing={isFetching && !isLoading}
        error={error} onRetry={() => refetch()} meta={data?.meta} onPage={list.setPage} onPageSize={list.setPageSize}
        sort={{ key: list.state.sort, order: list.state.order }} onSort={list.toggleSort}
        empty={list.state.q ? { title: "No staff match your search", hint: "Try a different name or number." }
          : { title: "No staff added yet", hint: "Add the people who operate this checkpoint.", action: <Link href="/checkpoint-users/new"><Button size="sm">Add staff</Button></Link> }} />
      <ConfirmDialog open={!!target} title="Delete staff member?" confirmLabel="Delete" loading={del.isPending}
        description={`${target?.name} will lose access to this checkpoint. This can’t be undone.`}
        onCancel={() => setTarget(null)} onConfirm={() => target && del.mutate(target.id, { onSettled: () => setTarget(null) })} />
    </>
  );
}
