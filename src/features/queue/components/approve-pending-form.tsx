"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { Combobox } from "@/shared/forms/combobox";
import { FieldShell } from "@/shared/forms/field-shell";
import { PhoneField, SelectField, TextField, TextareaField } from "@/shared/forms/fields";
import { applyServerErrors } from "@/shared/forms/server-errors";
import { Button } from "@/shared/ui/button";
import { Section } from "@/shared/ui/card-section";
import { Dialog } from "@/shared/ui/dialog";
import { PageHeader } from "@/shared/ui/page-header";
import { Skeleton } from "@/shared/ui/skeleton";
import { ErrorState } from "@/shared/ui/states";
import { formatDate } from "@/shared/lib/format";
import { useApprovePending, usePendingQueue } from "../hooks";
import { approvePendingSchema, type ApprovePendingValues } from "../schemas";

export function ApprovePendingForm({ id }: { id: string }) {
  const router = useRouter();
  const { data: p, isLoading, error, refetch } = usePendingQueue(id);
  const approve = useApprovePending(id);
  const [matchOpen, setMatchOpen] = useState(false);
  const [pick, setPick] = useState("");
  const [matched, setMatched] = useState<{ id: string; label: string } | null>(null);
  const methods = useForm<ApprovePendingValues>({ resolver: zodResolver(approvePendingSchema), defaultValues: { from: "", to: "", entryPosition: "", grossWeight: "", material: "", remarks: "", driverPhone: "" } });
  const from = useWatch({ control: methods.control, name: "from" });
  const to = useWatch({ control: methods.control, name: "to" });

  if (error) return <div className="card"><ErrorState error={error} onRetry={() => refetch()} /></div>;
  if (isLoading || !p) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-72 w-full" /></div>;

  return (
    <>
      <PageHeader title="Approve queue" crumbs={[{ label: "Queue", href: "/queue" }, { label: p.vehicleNumber }]} />
      <p role="note" className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-warn">
        If this vehicle already has an active queue, the route and material you enter here will replace the data from its previous queue entry.
      </p>
      <FormProvider {...methods}>
        <form noValidate onSubmit={methods.handleSubmit(async (v) => {
          try { await approve.mutateAsync({ ...v, grossWeight: Number(v.grossWeight), matchedVehicleId: matched?.id, driverPhone: v.driverPhone || undefined, remarks: v.remarks || undefined }); }
          catch (e) { applyServerErrors(e, methods.setError); }
        })}>
          <Section title={`Vehicle ${p.vehicleNumber}`} actions={<span className="text-xs text-muted">Entered {formatDate(p.entryDate)} · {p.route}</span>}>
            <div className="mb-5 flex flex-wrap items-center gap-3 rounded-lg bg-stone-50 px-4 py-3 text-sm">
              <Link2 className="size-4 text-muted" aria-hidden />
              {matched ? <span>Matched to <strong>{matched.label}</strong></span> : <span className="text-muted">Not linked to a registered vehicle</span>}
              <Button variant="secondary" size="sm" onClick={() => setMatchOpen(true)}>{matched ? "Change match" : "Match vehicle"}</Button>
              {matched && <Button variant="ghost" size="sm" onClick={() => setMatched(null)}>Remove</Button>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <SelectField name="from" label="From" required lookup="stations" excludeValues={[to]} />
              <SelectField name="to" label="To" required lookup="stations" excludeValues={[from]} />
              <SelectField name="entryPosition" label="Checkpoint entry" required lookup="entry-positions" />
              <TextField name="grossWeight" label="Gross weight (kg)" required type="number" inputMode="decimal" placeholder="0" />
              <TextField name="material" label="Material" required />
              <PhoneField name="driverPhone" label="Driver’s phone" />
              <TextareaField name="remarks" label="Remarks" className="sm:col-span-2 lg:col-span-3" />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => router.push("/queue")} disabled={approve.isPending}>Cancel</Button>
              <Button type="submit" loading={approve.isPending}>Approve queue</Button>
            </div>
          </Section>
        </form>
      </FormProvider>
      <Dialog open={matchOpen} onClose={() => setMatchOpen(false)} title="Match to a registered vehicle" description="Link this entry to the vehicle’s record and card.">
        <FieldShell label="Registered vehicle">{(f) => <Combobox id={f.id} lookup="vehicles" value={pick} onChange={(v, o) => { setPick(v); if (o) setMatched({ id: o.value, label: o.label }); }} placeholder="Search by plate number" />}</FieldShell>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setMatchOpen(false)}>Cancel</Button>
          <Button disabled={!pick} onClick={() => setMatchOpen(false)}>Use this vehicle</Button>
        </div>
      </Dialog>
    </>
  );
}
