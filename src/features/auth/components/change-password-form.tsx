"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { applyServerErrors } from "@/shared/forms/server-errors";
import { TextField } from "@/shared/forms/fields";
import { Button } from "@/shared/ui/button";
import { Section } from "@/shared/ui/card-section";
import { useChangePassword } from "../hooks";
import { changePasswordSchema } from "../schemas";
import type { ChangePasswordInput } from "../types";

export function ChangePasswordForm() {
  const router = useRouter();
  const m = useChangePassword();
  const methods = useForm<ChangePasswordInput>({ resolver: zodResolver(changePasswordSchema), defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" } });
  return (
    <Section>
      <FormProvider {...methods}>
        <form noValidate className="max-w-md space-y-4"
          onSubmit={methods.handleSubmit(async (v) => {
            try { await m.mutateAsync(v); methods.reset(); } catch (e) { applyServerErrors(e, methods.setError); }
          })}>
          <TextField name="currentPassword" label="Current password" type="password" required />
          <TextField name="newPassword" label="New password" type="password" required hint="At least 8 characters, with a letter and a number." />
          <TextField name="confirmPassword" label="Confirm new password" type="password" required />
          <div className="flex gap-2 pt-1">
            <Button type="submit" loading={m.isPending}>Save password</Button>
            <Button variant="secondary" onClick={() => router.back()}>Cancel</Button>
          </div>
        </form>
      </FormProvider>
    </Section>
  );
}
