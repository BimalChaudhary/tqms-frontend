"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { apiFetch } from "@/shared/api/client";
import type { Single } from "@/shared/api/types";
import { ComboField, PhoneField, SelectField, TextField, TextareaField } from "@/shared/forms/fields";
import { applyServerErrors } from "@/shared/forms/server-errors";
import { formatBsDate, today } from "@/shared/lib/format";
import { useSession } from "@/features/auth/hooks";
import { Button } from "@/shared/ui/button";
import { Section } from "@/shared/ui/card-section";
import { useCreateQueue } from "../hooks";
import { createQueueSchema, type CreateQueueValues } from "../schemas";
import type { VehicleKind } from "../types";
import { ReceiptPreview } from "./receipt-preview";

const EMPTY: CreateQueueValues = {
  vehicleId: "", vehicleNumber: "", vehicleTypeId: "", from: "", to: "", grossWeight: "", transportCompany: "", loadDetails: "", narration: "", driverPhone: "",
};

export function CreateQueueForm({ kind }: { kind: VehicleKind }) {
  const router = useRouter();
  const create = useCreateQueue();
  const { data: session } = useSession();
  const [vehicleLabel, setVehicleLabel] = useState("");
  const [cutFee, setCutFee] = useState(50);
  const schema = useMemo(() => createQueueSchema(kind), [kind]);
  const methods = useForm<CreateQueueValues>({ resolver: zodResolver(schema), defaultValues: EMPTY });
  const v = useWatch({ control: methods.control });

  // Prefill the checkpoint's default narration once, without overwriting what the user typed.
  const narration = useQuery({ queryKey: ["narration"], queryFn: () => apiFetch<Single<{ narration: string }>>("/narration").then((r) => r.data) });
  useEffect(() => {
    if (narration.data && !methods.getFieldState("narration").isDirty && !methods.getValues("narration")) methods.setValue("narration", narration.data.narration);
  }, [narration.data, methods]);

  const submit = methods.handleSubmit(async (values) => {
    try {
      await create.mutateAsync({
        kind, from: values.from, to: values.to, grossWeight: Number(values.grossWeight), loadDetails: values.loadDetails,
        transportCompany: values.transportCompany || undefined, narration: values.narration || undefined,
        driverPhone: values.driverPhone || undefined,
        cutFee,
        ...(kind === "registered" ? { vehicleId: values.vehicleId } : { vehicleNumber: values.vehicleNumber, vehicleTypeId: values.vehicleTypeId }),
      });
    } catch (e) { applyServerErrors(e, methods.setError); }
  });

  const label = { registered: "Registered vehicle", unregistered: "Unregistered vehicle", indian: "Indian vehicle" }[kind];
  return (
    <FormProvider {...methods}>
      <form noValidate onSubmit={submit} className="grid items-start gap-6 lg:grid-cols-[1fr_20rem]">
        <Section title={`Checkpoint entry · ${label}`}>
          <div className="grid gap-4 sm:grid-cols-2">
            {kind === "registered"
              ? <ComboField name="vehicleId" label="Vehicle" required lookup="vehicles" placeholder="Search by plate number" className="sm:col-span-2" onSelect={(o) => setVehicleLabel(o?.label ?? "")} />
              : <>
                  <TextField name="vehicleNumber" label="Vehicle number" required placeholder={kind === "indian" ? "e.g. UP-32-AB-1234" : "Plate number"} />
                  <SelectField name="vehicleTypeId" label="Vehicle type" required lookup="vehicle-types" />
                </>}
            <SelectField name="from" label="From" required lookup="stations" excludeValues={[v.to ?? ""]} placeholder="Select start point" />
            <SelectField name="to" label="To" required lookup="stations" excludeValues={[v.from ?? ""]} placeholder="Select destination" />
            <TextField name="grossWeight" label="Gross weight (kg)" required type="number" inputMode="decimal" placeholder="0" />
            <div className="space-y-1.5">
              <span className="block text-sm font-medium">Entry date (B.S.)</span>
              <input className="control" value={formatBsDate(today())} readOnly aria-readonly /><p className="text-xs text-muted">Set automatically</p>
            </div>
            <TextField name="transportCompany" label="Transport company" placeholder="Optional" />
            <TextField name="loadDetails" label="Load details" required placeholder="e.g. Cement, 20 tons" />
            <TextareaField name="narration" label="Narration" className="sm:col-span-2" />
            <PhoneField name="driverPhone" label="Driver’s phone" />
          </div>
          {create.isError && !create.error.fieldErrors && <p role="alert" className="mt-4 text-sm text-bad">{create.error.message}</p>}
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => router.push("/queue")} disabled={create.isPending}>Cancel</Button>
            <Button type="submit" loading={create.isPending}>Save</Button>
          </div>
        </Section>
        <div className="lg:sticky lg:top-20">
          <ReceiptPreview draft cutFee={cutFee} onCutFeeChange={setCutFee} data={{
            sangh: session?.sthaniyaSangh, checkpoint: session?.name, date: formatBsDate(today()), time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
            vehicleNumber: kind === "registered" ? vehicleLabel : v.vehicleNumber, load: v.loadDetails, narration: v.narration,
            weight: v.grossWeight ? Number(v.grossWeight) : null, driverPhone: v.driverPhone,
          }} />
        </div>
      </form>
    </FormProvider>
  );
}
