"use client";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { DynamicForm, type FormValues } from "@/shared/forms/dynamic-form";
import { Button, IconButton } from "@/shared/ui/button";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { DataTable, type Column } from "@/shared/ui/data-table";
import { Dialog } from "@/shared/ui/dialog";
import { useSubRecordMutations, useSubRecords } from "../hooks";
import type { SubResource } from "../sub-resources";
import type { SubRecord } from "../types";

/** One tab = list + add/edit dialog + delete confirmation, all driven by a SubResource config. */
export function SubRecordTab({ vehicleId, config }: { vehicleId: string; config: SubResource }) {
  const { data, isLoading, error, refetch } = useSubRecords(vehicleId, config.resource);
  const { save, remove } = useSubRecordMutations(vehicleId, config.resource, config.noun);
  const [editing, setEditing] = useState<SubRecord | "new" | null>(null);
  const [deleting, setDeleting] = useState<SubRecord | null>(null);

  const columns: Column<SubRecord>[] = [
    ...config.columns.map((c) => ({ key: c.key, header: c.header, cell: (r: SubRecord) => c.render(r) })),
    ...(config.canEdit || config.canDelete ? [{
      key: "actions", header: "Actions", srOnlyHeader: true, className: "w-24", cell: (r: SubRecord) => (
        <div className="flex justify-end">
          {config.canEdit && <IconButton label={`Edit ${config.noun.toLowerCase()}`} onClick={() => setEditing(r)}><Pencil className="size-4" /></IconButton>}
          {config.canDelete && <IconButton label={`Delete ${config.noun.toLowerCase()}`} className="hover:text-bad" onClick={() => setDeleting(r)}><Trash2 className="size-4" /></IconButton>}
        </div>),
    }] : []),
  ];

  const existingFiles = (r: SubRecord) =>
    Object.fromEntries(config.fields.filter((f) => f.type === "file").map((f) => [f.name, r[`${f.name}Name`]]));
  const fields = editing && editing !== "new"
    ? config.fields.map((f) => {
      if (f.type === "file") return { ...f, required: false, existingName: String(existingFiles(editing)[f.name] ?? "") || undefined };
      if (f.type === "combo") return { ...f, initialLabel: String(editing[`${f.name}Label`] ?? "") };
      return f;
    })
    : config.fields;
  const initial: FormValues | undefined = editing && editing !== "new" ? { ...editing } : undefined;

  return (
    <>
      <div className="mb-3 flex justify-end">
        {config.canAdd && <Button variant="secondary" size="sm" onClick={() => setEditing("new")}><Plus className="size-4" /> {config.addLabel}</Button>}
      </div>
      <DataTable caption={config.tab} columns={columns} rows={data} rowKey={(r) => r.id} loading={isLoading} error={error} onRetry={() => refetch()}
        empty={{ title: `No ${config.tab.toLowerCase()} records`, hint: config.canAdd ? `Use “${config.addLabel}” to add the first one.` : undefined }} />
      <Dialog open={!!editing} onClose={() => setEditing(null)} title={editing === "new" ? config.addLabel : `Edit ${config.noun.toLowerCase()}`}>
        <DynamicForm fields={fields} initial={initial} onCancel={() => setEditing(null)}
          onSubmit={async (values) => {
            await save.mutateAsync({ rid: editing && editing !== "new" ? editing.id : undefined, values });
            setEditing(null);
          }} />
      </Dialog>
      <ConfirmDialog open={!!deleting} title={`Delete this ${config.noun.toLowerCase()}?`} confirmLabel="Delete" loading={remove.isPending}
        description="This removes the record from the vehicle. It can’t be undone."
        onCancel={() => setDeleting(null)} onConfirm={() => deleting && remove.mutate(deleting.id, { onSettled: () => setDeleting(null) })} />
    </>
  );
}
