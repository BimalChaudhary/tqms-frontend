"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { z } from "zod";
import type { LookupType } from "@/shared/api/lookup";
import type { Option } from "@/shared/api/types";
import { Button } from "@/shared/ui/button";
import { uploadFile } from "@/shared/forms/validators";
import { ComboField, FileField, SelectField, SwitchField, TextField, TextareaField } from "./fields";
import { applyServerErrors } from "./server-errors";

/**
 * Schema-driven form for the many small "add / edit record" dialogs (documents, insurance, bank…).
 * One field list produces the UI, the Zod validation and the submit payload.
 */
export interface FieldDef {
  name: string; label: string; type: "text" | "number" | "date" | "select" | "combo" | "file" | "textarea" | "checkbox";
  required?: boolean; lookup?: LookupType; options?: Option[]; placeholder?: string; hint?: string; fullWidth?: boolean;
  /** For dates: must be on/after this other field (e.g. expiry after start). */
  after?: string; pattern?: RegExp; patternMessage?: string; min?: number; existingName?: string; accept?: string;
}

export type FormValues = Record<string, unknown>;

export function buildSchema(fields: FieldDef[]) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const f of fields) {
    const need = `${f.type === "select" || f.type === "combo" ? "Select" : "Enter"} ${f.label.toLowerCase()}`;
    if (f.type === "file") {
      const schema = uploadFile(f.accept);
      shape[f.name] = f.required
        ? schema.refine((v) => typeof File !== "undefined" && v instanceof File, `Choose ${f.label.toLowerCase()}`)
        : schema;
    } else if (f.type === "checkbox") {
      shape[f.name] = z.boolean().optional();
    } else {
      let s: z.ZodType<string> = z.string().trim();
      if (f.type === "number") s = s.refine((v) => v === "" || (Number.isFinite(Number(v)) && Number(v) >= (f.min ?? 0)), `Enter a number${f.min !== undefined ? ` of ${f.min} or more` : ""}`);
      if (f.type === "date") s = s.refine((v) => {
        if (!v) return true;
        if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
        const parsed = new Date(`${v}T00:00:00.000Z`);
        return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === v;
      }, `Enter a valid ${f.label.toLowerCase()}`);
      if (f.pattern) s = s.refine((v) => v === "" || f.pattern!.test(v), f.patternMessage ?? "Invalid format");
      shape[f.name] = f.required ? s.refine((v) => v.length > 0, need) : s.optional();
    }
  }
  return z.object(shape).superRefine((vals, ctx) => {
    for (const f of fields) {
      const a = f.after && (vals as FormValues)[f.after], b = (vals as FormValues)[f.name];
      if (f.after && typeof a === "string" && typeof b === "string" && a && b && b < a)
        ctx.addIssue({ code: "custom", path: [f.name], message: `${f.label} must be on or after ${fields.find((x) => x.name === f.after)?.label.toLowerCase()}` });
    }
  });
}

const defaultsFor = (fields: FieldDef[], init?: FormValues): FormValues =>
  Object.fromEntries(fields.map((f) => [f.name, init?.[f.name] ?? (f.type === "checkbox" ? false : f.type === "file" ? undefined : "")]));

export function DynamicForm({ fields, initial, submitLabel = "Save", onSubmit, onCancel, columns = 1 }: {
  fields: FieldDef[]; initial?: FormValues; submitLabel?: string; columns?: 1 | 2;
  onSubmit: (values: FormValues) => Promise<unknown>; onCancel?: () => void;
}) {
  const methods = useForm<FormValues>({ resolver: zodResolver(buildSchema(fields)) as Resolver<FormValues>, defaultValues: defaultsFor(fields, initial) });
  const { handleSubmit, setError, formState: { isSubmitting } } = methods;

  return (
    <FormProvider {...methods}>
      <form noValidate onSubmit={handleSubmit(async (v) => { try { await onSubmit(v); } catch (e) { applyServerErrors(e, setError); } })}
        className="space-y-4">
        <div className={columns === 2 ? "grid gap-4 sm:grid-cols-2" : "space-y-4"}>
          {fields.map((f) => {
            const common = { name: f.name, label: f.label, required: f.required, hint: f.hint, className: f.fullWidth ? "sm:col-span-2" : undefined };
            switch (f.type) {
              case "select": return <SelectField key={f.name} {...common} lookup={f.lookup} options={f.options} placeholder={f.placeholder} />;
              case "combo": return <ComboField key={f.name} {...common} lookup={f.lookup!} placeholder={f.placeholder} />;
              case "file": return <FileField key={f.name} {...common} accept={f.accept} existingName={f.existingName} />;
              case "textarea": return <TextareaField key={f.name} {...common} placeholder={f.placeholder} />;
              case "checkbox": return <SwitchField key={f.name} {...common} />;
              default: return <TextField key={f.name} {...common} type={f.type === "date" ? "date" : f.type === "number" ? "number" : "text"} placeholder={f.placeholder} />;
            }
          })}
        </div>
        <div className="flex justify-end gap-2 pt-1">
          {onCancel && <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>}
          <Button type="submit" loading={isSubmitting}>{submitLabel}</Button>
        </div>
      </form>
    </FormProvider>
  );
}
