"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { TextField } from "@/shared/forms/fields";
import { applyServerErrors } from "@/shared/forms/server-errors";
import { today } from "@/shared/lib/format";
import { useSession } from "@/features/auth/hooks";
import { Button } from "@/shared/ui/button";
import { Section } from "@/shared/ui/card-section";
import { DetailList } from "@/shared/ui/detail-list";
import { PageHeader } from "@/shared/ui/page-header";
import { Skeleton } from "@/shared/ui/skeleton";
import { ErrorState } from "@/shared/ui/states";
import { formatDate, formatKg } from "@/shared/lib/format";
import { useCheckIn, useQueue } from "../hooks";
import { checkInSchema, type CheckInValues } from "../schemas";
import { ReceiptPreview } from "./receipt-preview";

export function CheckInForm({ id }: { id: string }) {
  const router = useRouter();
  const { data: q, isLoading, error, refetch } = useQueue(id);
  const { data: session } = useSession();
  const checkIn = useCheckIn(id);
  const methods = useForm<CheckInValues>({ resolver: zodResolver(checkInSchema), defaultValues: { grossWeight: "" } });
  const weight = useWatch({ control: methods.control, name: "grossWeight" });

  if (error) return <div className="card"><ErrorState error={error} onRetry={() => refetch()} /></div>;
  if (isLoading || !q) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-72 w-full" /></div>;

  return (
    <>
      <PageHeader title="Check in" crumbs={[{ label: "Queue", href: "/queue" }, { label: q.vehicleNumber, href: `/queue/${id}` }, { label: "Check in" }]} />
      <FormProvider {...methods}>
        <form noValidate className="grid items-start gap-6 lg:grid-cols-[1fr_20rem]"
          onSubmit={methods.handleSubmit(async (v) => { try { await checkIn.mutateAsync({ grossWeight: Number(v.grossWeight) }); } catch (e) { applyServerErrors(e, methods.setError); } })}>
          <div className="space-y-5">
            <Section title="Weigh in">
              <TextField name="grossWeight" label="Gross weight (kg)" required type="number" inputMode="decimal" placeholder="0" className="max-w-xs" />
              {checkIn.isError && !checkIn.error.fieldErrors && <p role="alert" className="mt-3 text-sm text-bad">{checkIn.error.message}</p>}
              <div className="mt-5 flex gap-2">
                <Button type="submit" loading={checkIn.isPending}>Save check-in</Button>
                <Button variant="secondary" onClick={() => router.push(`/queue/${id}`)} disabled={checkIn.isPending}>Cancel</Button>
              </div>
            </Section>
            <Section title="Queue status">
              <DetailList columns={1} items={[
                { label: "Queue number", value: q.queueNumber }, { label: "Entry date", value: formatDate(q.entryDate) },
                { label: "Last checkpoint", value: q.lastCheckpoint }, { label: "Route", value: q.route },
                { label: "Transport company", value: q.transportCompany }, { label: "Load details", value: q.loadDetails },
                { label: "Checkpoint weight", value: formatKg(q.checkpointWeight) },
              ]} />
            </Section>
            <Section title="Vehicle status">
              <DetailList columns={1} items={[
                { label: "Type", value: q.vehicleType }, { label: "Registered", value: q.isRegistered ? "Yes" : "No" },
                { label: "Card / sthaniya", value: q.sangh ?? "Not associated with any sthaniya" }, { label: "Owner", value: q.owner },
              ]} />
            </Section>
          </div>
          <div className="lg:sticky lg:top-20">
            <ReceiptPreview draft data={{ sangh: session?.sthaniyaSangh, checkpoint: session?.name, date: today(), vehicleNumber: q.vehicleNumber, load: q.loadDetails, weight: weight ? Number(weight) : null }} />
          </div>
        </form>
      </FormProvider>
    </>
  );
}
