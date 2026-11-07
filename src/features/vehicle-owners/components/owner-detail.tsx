"use client";
import { Eye, Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { DynamicForm, type FieldDef } from "@/shared/forms/dynamic-form";
import { useTabParam } from "@/shared/hooks/use-tab-param";
import { Button } from "@/shared/ui/button";
import { StatusBadge } from "@/shared/ui/badge";
import { Section } from "@/shared/ui/card-section";
import { DataTable, type Column } from "@/shared/ui/data-table";
import { DetailList } from "@/shared/ui/detail-list";
import { Dialog } from "@/shared/ui/dialog";
import { PageHeader } from "@/shared/ui/page-header";
import { Skeleton } from "@/shared/ui/skeleton";
import { ErrorState } from "@/shared/ui/states";
import { Tabs, TabPanel } from "@/shared/ui/tabs";
import {
  useAddBank,
  useUpdateBank,
  useOwner,
  useOwnerBanks,
  useOwnerVehicles,
} from "../hooks";
import { bankFields } from "../schemas";
import type { OwnerBank, OwnerVehicle } from "../types";

const TABS = [
  { id: "profile", label: "Profile" },
  { id: "banks", label: "Bank details" },
  { id: "vehicles", label: "Vehicle details" },
];

function BanksTab({ ownerId }: { ownerId: string }) {
  const { data, isLoading, error, refetch } = useOwnerBanks(ownerId);
  const add = useAddBank(ownerId);
  const update = useUpdateBank(ownerId);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<OwnerBank | null>(null);
  const columns: Column<OwnerBank>[] = [
    {
      key: "bank",
      header: "Bank",
      cell: (b) => <span className="font-medium">{b.bank}</span>,
    },
    { key: "branch", header: "Branch", cell: (b) => b.branch },
    { key: "holder", header: "Account holder", cell: (b) => b.accountHolder },
    {
      key: "no",
      header: "Account number",
      cell: (b) => b.accountNumber,
      className: "tabular-nums",
    },
    {
      key: "current",
      header: "Current",
      cell: (b) => (b.isCurrent ? <StatusBadge status="active" /> : "—"),
    },
    { key: "actions", header: "Actions", cell: (b) => <Button variant="ghost" size="sm" onClick={() => { setEditing(b); setOpen(true); }}><Pencil className="size-4" /> Edit</Button> },
  ];
  return (
    <>
      <div className="mb-3 flex justify-end">
        <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
          <Plus className="size-4" /> Add bank
        </Button>
      </div>
      <DataTable
        caption="Bank accounts"
        columns={columns}
        rows={data}
        rowKey={(b) => b.id}
        loading={isLoading}
        error={error}
        onRetry={() => refetch()}
        empty={{
          title: "No bank accounts yet",
          hint: "Add the account used for this owner’s payments.",
        }}
      />
      <Dialog open={open} onClose={() => { setOpen(false); setEditing(null); }} title={editing ? "Edit bank account" : "Add new bank"}>
        <DynamicForm
          fields={bankFields as unknown as FieldDef[]}
          initial={editing ? { bankId: editing.bankId, branchName: editing.branch, accountHolder: editing.accountHolder, accountNumber: editing.accountNumber, isCurrent: editing.isCurrent } : undefined}
          onCancel={() => { setOpen(false); setEditing(null); }}
          onSubmit={async (v) => {
            if (editing) await update.mutateAsync({ bankId: editing.id, values: v });
            else await add.mutateAsync(v);
            setOpen(false);
            setEditing(null);
          }}
        />
      </Dialog>
    </>
  );
}

function VehiclesTab({ ownerId }: { ownerId: string }) {
  const { data, isLoading, error, refetch } = useOwnerVehicles(ownerId);
  const columns: Column<OwnerVehicle>[] = [
    { key: "name", header: "Name", cell: (v) => v.name },
    { key: "type", header: "Type", cell: (v) => v.type },
    {
      key: "plate",
      header: "Plate number",
      cell: (v) => <span className="font-medium">{v.plateNo}</span>,
    },
    {
      key: "view",
      header: "View",
      srOnlyHeader: true,
      className: "w-12",
      cell: (v) => (
        <Link
          href={`/vehicles/${v.vehicleId}`}
          aria-label={`View ${v.plateNo}`}
          className="inline-flex size-8 items-center justify-center rounded-md text-muted hover:bg-stone-100 hover:text-ink"
        >
          <Eye className="size-4" />
        </Link>
      ),
    },
  ];
  return (
    <DataTable
      caption="Owner vehicles"
      columns={columns}
      rows={data}
      rowKey={(v) => v.id}
      loading={isLoading}
      error={error}
      onRetry={() => refetch()}
      empty={{ title: "No vehicles linked to this owner" }}
    />
  );
}

export function OwnerDetailView({ id }: { id: string }) {
  const { data, isLoading, error, refetch } = useOwner(id);
  const [tab, setTab] = useTabParam(
    TABS.map((t) => t.id),
    "profile",
  );
  if (error)
    return (
      <div className="card">
        <ErrorState error={error} onRetry={() => refetch()} />
      </div>
    );
  if (isLoading || !data)
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  const f = data.form;
  return (
    <>
      <PageHeader
        title={data.name}
        crumbs={[
          { label: "Vehicle owners", href: "/vehicle-owners" },
          { label: data.name },
        ]}
        actions={
          <Link href={`/vehicle-owners/${id}/edit`}>
            <Button variant="secondary">
              <Pencil className="size-4" /> Edit
            </Button>
          </Link>
        }
      />
      <div className="card mb-5 flex flex-wrap items-center gap-x-8 gap-y-2 bg-brand-50 px-5 py-4 text-sm">
        <StatusBadge status={data.isVerified ? "verified" : "unverified"} />
        <span>{data.phone}</span>
        <span>{data.email ?? "No email"}</span>
        <span>{data.address}</span>
      </div>
      <div className="card px-5 pb-5">
        <Tabs
          label="Owner sections"
          tabs={TABS}
          value={tab}
          onChange={setTab}
        />
        <TabPanel id={tab}>
          {tab === "profile" && (
            <DetailList
              items={[
                { label: "State", value: data.province },
                { label: "District", value: data.district },
                { label: "Local level", value: f.localLevel },
                { label: "Street address", value: f.streetAddress },
                { label: "PAN number", value: f.panNumber },
                {
                  label: "Owner type",
                  value: f.isIndividual ? "Individual" : "Company",
                },
                { label: "Contact Detail", value: f.contactName },
                { label: "Contact email", value: f.contactEmail },
                { label: "Contact number", value: f.contactNumber },
                { label: "Registration number", value: f.registrationNumber },
                { label: "Citizenship number", value: f.citizenshipNumber },
              ]}
            />
          )}
          {tab === "banks" && <BanksTab ownerId={id} />}
          {tab === "vehicles" && <VehiclesTab ownerId={id} />}
        </TabPanel>
      </div>
    </>
  );
}
