"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { applyServerErrors } from "@/shared/forms/server-errors";
import { PhoneField, ProvinceDistrictFields, SwitchField, TextField } from "@/shared/forms/fields";
import { Button } from "@/shared/ui/button";
import { Section } from "@/shared/ui/card-section";
import { Skeleton } from "@/shared/ui/skeleton";
import { ErrorState } from "@/shared/ui/states";
import { useCheckpointUser, useSaveCheckpointUser } from "../hooks";
import { checkpointUserSchema, type CheckpointUserValues } from "../schemas";

const EMPTY: CheckpointUserValues = { name: "", provinceId: "", districtId: "", address: "", contact: "", email: "", isActive: true };

export function UserForm({ id }: { id?: string }) {
  const { data, isLoading, error, refetch } = useCheckpointUser(id ?? "");
  if (id && error) return <Section><ErrorState error={error} onRetry={() => refetch()} /></Section>;
  if (id && (isLoading || !data)) return <Section><div className="grid gap-4 sm:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div></Section>;
  return <UserFormInner id={id} initial={data ? { ...EMPTY, ...data, address: data.address ?? "" } : EMPTY} />;
}

function UserFormInner({ id, initial }: { id?: string; initial: CheckpointUserValues }) {
  const router = useRouter();
  const save = useSaveCheckpointUser(id);
  const methods = useForm<CheckpointUserValues>({ resolver: zodResolver(checkpointUserSchema), defaultValues: initial });
  return (
    <Section title="Checkpoint staff">
      <FormProvider {...methods}>
        <form noValidate onSubmit={methods.handleSubmit(async (v) => { try { await save.mutateAsync(v); } catch (e) { applyServerErrors(e, methods.setError); } })}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <TextField name="name" label="Staff name" required placeholder="Full name" />
            <ProvinceDistrictFields />
            <TextField name="address" label="Street address" placeholder="Street or tole" />
            <PhoneField name="contact" label="Mobile number" required />
            <TextField name="email" label="Email" required type="email" disabled={!!id} hint={id ? "Email can’t be changed after the account is created." : undefined} />
            {id && <div className="flex items-end pb-2"><SwitchField name="isActive" label="Active" className="w-full" /></div>}
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => router.push("/checkpoint-users")} disabled={save.isPending}>Cancel</Button>
            <Button type="submit" loading={save.isPending}>Save</Button>
          </div>
        </form>
      </FormProvider>
    </Section>
  );
}
