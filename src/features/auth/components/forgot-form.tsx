"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { FormProvider, useForm } from "react-hook-form";
import { applyServerErrors } from "@/shared/forms/server-errors";
import { TextField } from "@/shared/forms/fields";
import { Button } from "@/shared/ui/button";
import { useForgotPassword } from "../hooks";
import { forgotSchema } from "../schemas";

export function ForgotForm() {
  const m = useForgotPassword();
  const methods = useForm<{ email: string }>({ resolver: zodResolver(forgotSchema), defaultValues: { email: "" } });
  if (m.isSuccess) return (
    <div role="status" className="space-y-4 text-sm">
      <p>If that email belongs to a checkpoint account, a reset link is on its way.</p>
      <Link href="/login" className="font-medium text-brand-700 hover:underline">Back to log in</Link>
    </div>
  );
  return (
    <FormProvider {...methods}>
      <form noValidate className="space-y-4"
        onSubmit={methods.handleSubmit(async (v) => { try { await m.mutateAsync(v.email); } catch (e) { applyServerErrors(e, methods.setError); } })}>
        <TextField name="email" label="Email" type="email" required />
        <Button type="submit" className="w-full" loading={m.isPending}>Send reset link</Button>
        <Link href="/login" className="block text-center text-sm text-brand-700 hover:underline">Back to log in</Link>
      </form>
    </FormProvider>
  );
}
