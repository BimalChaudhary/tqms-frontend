"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { apiFetch } from "@/shared/api/client";
import type { Single } from "@/shared/api/types";
import { TextareaField } from "@/shared/forms/fields";
import { applyServerErrors } from "@/shared/forms/server-errors";
import { Button } from "@/shared/ui/button";
import { Section } from "@/shared/ui/card-section";
import { Skeleton } from "@/shared/ui/skeleton";
import { ErrorState } from "@/shared/ui/states";
import { useToast } from "@/shared/ui/toast";

/** Default narration text printed on every receipt this checkpoint issues. */
const schema = z.object({ narration: z.string().trim().min(1, "Enter the narration text").max(200, "Keep it under 200 characters") });
type Values = z.infer<typeof schema>;
const KEY = ["narration"];

export function NarrationForm() {
  const { data, isLoading, error, refetch } = useQuery({ queryKey: KEY, queryFn: () => apiFetch<Single<Values>>("/narration").then((r) => r.data) });
  if (error) return <Section><ErrorState error={error} onRetry={() => refetch()} /></Section>;
  if (isLoading || !data) return <Section><Skeleton className="h-10 max-w-md" /></Section>;
  return <Inner initial={data} />;
}

function Inner({ initial }: { initial: Values }) {
  const qc = useQueryClient();
  const toast = useToast();
  const m = useMutation({
    mutationFn: (b: Values) => apiFetch<Single<Values>>("/narration", { method: "PATCH", body: { ...b } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEY }); toast.success("Narration saved"); },
  });
  const methods = useForm<Values>({ resolver: zodResolver(schema), defaultValues: initial });
  return (
    <Section title="Narration details">
      <FormProvider {...methods}>
        <form noValidate className="max-w-xl space-y-4"
          onSubmit={methods.handleSubmit(async (v) => { try { await m.mutateAsync(v); methods.reset(v); } catch (e) { applyServerErrors(e, methods.setError); } })}>
          <TextareaField name="narration" label="Receipt narration" required hint="Printed on every receipt issued from this checkpoint." />
          {m.isError && !m.error.fieldErrors && <p role="alert" className="text-sm text-bad">{m.error.message}</p>}
          <div className="flex gap-2">
            <Button type="submit" loading={m.isPending} disabled={!methods.formState.isDirty}>Save</Button>
            <Button variant="secondary" onClick={() => methods.reset()} disabled={!methods.formState.isDirty}>Reset</Button>
          </div>
        </form>
      </FormProvider>
    </Section>
  );
}
