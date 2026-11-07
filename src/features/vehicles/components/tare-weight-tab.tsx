"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { TextField } from "@/shared/forms/fields";
import { applyServerErrors } from "@/shared/forms/server-errors";
import { Button } from "@/shared/ui/button";
import { Dialog } from "@/shared/ui/dialog";
import { Skeleton } from "@/shared/ui/skeleton";
import { ErrorState } from "@/shared/ui/states";
import { formatKg } from "@/shared/lib/format";
import { useTareWeight } from "../hooks";
import { tareWeightSchema } from "../schemas";

export function TareWeightTab({ vehicleId }: { vehicleId: string }) {
  const { query, save } = useTareWeight(vehicleId);
  const [open, setOpen] = useState(false);
  const methods = useForm<{ tareWeight: string }>({ resolver: zodResolver(tareWeightSchema), values: { tareWeight: query.data ? String(query.data.tareWeight) : "" } });

  if (query.error) return <div className="card"><ErrorState error={query.error} onRetry={() => query.refetch()} /></div>;
  return (
    <>
      <div className="flex items-center justify-between rounded-lg border border-line px-5 py-4">
        <div>
          <p className="text-sm text-muted">Tare weight (empty vehicle)</p>
          {query.isLoading ? <Skeleton className="mt-1 h-7 w-24" /> : <p className="text-2xl font-semibold tabular-nums">{formatKg(query.data?.tareWeight)}</p>}
        </div>
        <Button variant="secondary" size="sm" onClick={() => setOpen(true)} disabled={query.isLoading}><Pencil className="size-4" /> Edit</Button>
      </div>
      <Dialog open={open} onClose={() => setOpen(false)} title="Edit tare weight" size="sm">
        <FormProvider {...methods}>
          <form noValidate className="space-y-4" onSubmit={methods.handleSubmit(async (v) => {
            try { await save.mutateAsync(Number(v.tareWeight)); setOpen(false); } catch (e) { applyServerErrors(e, methods.setError); }
          })}>
            <TextField name="tareWeight" label="Tare weight (kg)" required type="number" inputMode="decimal" />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" loading={save.isPending}>Save</Button>
            </div>
          </form>
        </FormProvider>
      </Dialog>
    </>
  );
}
