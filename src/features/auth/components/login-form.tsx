"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { applyServerErrors } from "@/shared/forms/server-errors";
import { TextField } from "@/shared/forms/fields";
import { FieldShell } from "@/shared/forms/field-shell";
import { Button } from "@/shared/ui/button";
import { errorMessage } from "@/shared/api/client";
import { useLogin } from "../hooks";
import { loginSchema } from "../schemas";
import type { LoginInput } from "../types";

export function LoginForm() {
  const login = useLogin();
  const [show, setShow] = useState(false);
  const [formError, setFormError] = useState<string>();
  const methods = useForm<LoginInput>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "", remember: true } });
  const { register, handleSubmit, setError, formState: { errors } } = methods;

  const submit = handleSubmit(async (v) => {
    setFormError(undefined);
    try { await login.mutateAsync(v); }
    catch (e) { if (!applyServerErrors(e, setError)) setFormError(errorMessage(e)); }
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={submit} noValidate className="space-y-4">
        {formError && <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-bad">{formError}</p>}
        <TextField name="email" label="Username" type="email" placeholder="you@example.com" required />
        <FieldShell label="Password" required error={errors.password?.message}>
          {(p) => (
            <div className="relative">
              <input {...p} {...register("password")} type={show ? "text" : "password"} autoComplete="current-password" className="control pr-10" />
              <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"} aria-pressed={show}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted hover:text-ink">
                {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          )}
        </FieldShell>
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" {...register("remember")} className="size-4 accent-brand-600" /> Remember me</label>
          <Link href="/forgot-password" className="text-brand-700 hover:underline">Forgot password?</Link>
        </div>
        <Button type="submit" className="w-full" loading={login.isPending}><LogIn className="size-4" /> Log in</Button>
      </form>
    </FormProvider>
  );
}
