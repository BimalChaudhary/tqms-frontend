"use client";
import { useEffect, useRef, useState } from "react";
import Select from "react-select";
import { useFormContext, useController, type FieldValues } from "react-hook-form";
import { useLookup, type LookupType } from "@/shared/api/lookup";
import type { Option } from "@/shared/api/types";
import { cn } from "@/shared/lib/cn";
import { Combobox } from "./combobox";
import { FieldShell } from "./field-shell";
import { selectStyles } from "./select-styles";

/**
 * Field components bind to the surrounding <FormProvider>; they render label, control and error.
 * Feature forms just declare fields — no repeated markup, consistent accessibility.
 */
interface Base { name: string; label: string; required?: boolean; hint?: string; className?: string; disabled?: boolean }
const useErr = (name: string) => {
  const { formState: { errors } } = useFormContext<FieldValues>();
  const e = errors[name]?.message;
  return typeof e === "string" ? e : undefined;
};

export function TextField({ name, label, required, hint, className, disabled, type = "text", placeholder, inputMode, digitsOnly, maxLength }: Base & {
  type?: "text" | "email" | "tel" | "date" | "number" | "password"; placeholder?: string; inputMode?: "numeric" | "decimal" | "tel"; digitsOnly?: boolean; maxLength?: number;
}) {
  const { register } = useFormContext<FieldValues>();
  const error = useErr(name);
  const registration = register(name);
  return (
    <FieldShell label={label} required={required} error={error} hint={hint} className={className}>
      {(p) => <input {...p} {...registration} type={type} disabled={disabled} placeholder={placeholder} inputMode={inputMode} maxLength={maxLength} onChange={digitsOnly ? (event) => registration.onChange({ ...event, target: { ...event.target, value: event.target.value.replace(/\\D/g, "").slice(0, maxLength) } }) : registration.onChange} step={type === "number" ? "any" : undefined} className="control" />}
    </FieldShell>
  );
}

export function PhoneField({ name, label, required, hint, className, disabled, placeholder = "98XXXXXXXX" }: Base & { placeholder?: string }) {
  const { control } = useFormContext<FieldValues>();
  const { field } = useController({ name, control });
  const error = useErr(name);
  return (
    <FieldShell label={label} required={required} error={error} hint={hint} className={className}>
      {(p) => (
        <input
          {...p}
          ref={field.ref}
          name={field.name}
          value={field.value ?? ""}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder={placeholder}
          maxLength={10}
          disabled={disabled}
          onBlur={field.onBlur}
          onChange={(event) => {
            const digits = event.target.value.replace(/\D/g, "").slice(0, 10);
            field.onChange(digits);
            event.target.value = digits;
          }}
          className="control"
        />
      )}
    </FieldShell>
  );
}

export function TextareaField({ name, label, required, hint, className, disabled, placeholder, rows = 3 }: Base & { placeholder?: string; rows?: number }) {
  const { register } = useFormContext<FieldValues>();
  const error = useErr(name);
  return (
    <FieldShell label={label} required={required} error={error} hint={hint} className={className}>
      {(p) => <textarea {...p} {...register(name)} rows={rows} disabled={disabled} placeholder={placeholder} className="control resize-y" />}
    </FieldShell>
  );
}

export function SelectField({ name, label, required, hint, className, disabled, lookup, parentId, options, excludeValues = [], placeholder = "Select…" }: Base & {
  lookup?: LookupType; parentId?: string; options?: Option[]; excludeValues?: string[]; placeholder?: string;
}) {
  const { control } = useFormContext<FieldValues>();
  const { field } = useController({ name, control });
  const error = useErr(name);
  const waitingForParent = lookup === "districts" && !parentId;
  const { data, isLoading, isError } = useLookup(lookup, { parentId, enabled: !waitingForParent });
  const list = options ?? data ?? [];
  const selected = list.find((option) => option.value === field.value) ?? null;
  const available = list.filter((option) => !excludeValues.includes(option.value));
  return (
    <FieldShell label={label} required={required} error={error} hint={isError ? "Couldn’t load options. Reload to retry." : hint} className={className}>
      {(p) => (
        <Select<Option, false>
          {...p}
          ref={field.ref}
          inputId={p.id}
          name={field.name}
          value={selected}
          options={available}
          onBlur={field.onBlur}
          onChange={(option) => field.onChange(option?.value ?? "")}
          isDisabled={disabled || waitingForParent}
          isLoading={isLoading && !options}
          isSearchable
          isClearable
          placeholder={waitingForParent ? "Select a state first" : isLoading ? "Loading…" : placeholder}
          classNamePrefix="react-select"
          styles={selectStyles}
        />
      )}
    </FieldShell>
  );
}

export function ComboField({ name, label, required, hint, className, disabled, lookup, placeholder, initialLabel, minChars, onSelect }: Base & {
  lookup: LookupType; placeholder?: string; initialLabel?: string; minChars?: number; onSelect?: (o?: Option) => void;
}) {
  const { control } = useFormContext<FieldValues>();
  const { field } = useController({ name, control });
  const error = useErr(name);
  return (
    <FieldShell label={label} required={required} error={error} hint={hint} className={className}>
      {(p) => (
        <Combobox id={p.id} invalid={!!p["aria-invalid"]} describedBy={p["aria-describedby"]} lookup={lookup} value={field.value ?? ""}
          placeholder={placeholder} initialLabel={initialLabel} minChars={minChars} disabled={disabled}
          onChange={(v, o) => { field.onChange(v); onSelect?.(o); }} />
      )}
    </FieldShell>
  );
}

export function FileField({ name, label, required, hint, className, disabled, accept = "image/jpeg,image/png,image/webp,application/pdf,.jpg,.jpeg,.png,.webp,.pdf", existingName }: Base & { accept?: string; existingName?: string }) {
  const { control } = useFormContext<FieldValues>();
  const { field } = useController({ name, control });
  const error = useErr(name);
  const file = field.value instanceof File ? field.value : undefined;
  const [previewUrl, setPreviewUrl] = useState<string>();
  useEffect(() => {
    if (!file?.type.startsWith("image/")) { setPreviewUrl(undefined); return; }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  return (
    <FieldShell label={label} required={required} error={error} hint={hint ?? (existingName && !file ? `Current file: ${existingName}` : "PNG, JPG, WebP or PDF, up to 5 MB")} className={className}>
      {(p) => (
        <div className="flex items-center gap-3">
          <input {...p} type="file" accept={accept} disabled={disabled} name={field.name} ref={field.ref} onBlur={field.onBlur}
            onChange={(e) => field.onChange(e.target.files?.[0])}
            className={cn("control min-w-0 flex-1 !p-0 file:mr-3 file:cursor-pointer file:border-0 file:border-r file:border-line file:bg-stone-50 file:px-3 file:py-2 file:text-sm hover:file:bg-stone-100")} />
          {previewUrl && <img src={previewUrl} alt={`${label} preview`} className="size-14 shrink-0 rounded-md border border-line object-cover" />}
        </div>
      )}
    </FieldShell>
  );
}

export function SwitchField({ name, label, hint, className, disabled }: Omit<Base, "required">) {
  const { control } = useFormContext<FieldValues>();
  const { field } = useController({ name, control });
  const on = !!field.value;
  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      <div>
        <span id={`${name}-lbl`} className="text-sm font-medium">{label}</span>
        {hint && <p className="text-xs text-muted">{hint}</p>}
      </div>
      <button type="button" role="switch" aria-checked={on} aria-labelledby={`${name}-lbl`} disabled={disabled} onClick={() => field.onChange(!on)}
        className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50", on ? "bg-brand-600" : "bg-stone-300")}>
        <span className={cn("absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform", on && "translate-x-5")} />
      </button>
    </div>
  );
}

/** State → District pair. District options reload when the state changes and reset to empty. */
export function ProvinceDistrictFields({ provinceName = "provinceId", districtName = "districtId" }: { provinceName?: string; districtName?: string }) {
  const { watch, setValue } = useFormContext<FieldValues>();
  const province = watch(provinceName) as string;
  return (
    <>
      <SelectField name={provinceName} label="State" required lookup="provinces" />
      <SelectFieldWithReset name={districtName} province={province} onProvinceChange={() => setValue(districtName, "")} provinceName={provinceName} />
    </>
  );
}

function SelectFieldWithReset({ name, province, onProvinceChange, provinceName }: { name: string; province: string; onProvinceChange: () => void; provinceName: string }) {
  const { formState: { dirtyFields } } = useFormContext<FieldValues>();
  const prev = useRef(province);
  useEffect(() => {
    // Only clear the district when the user changed the state, not on the initial form prefill.
    if (prev.current !== province && dirtyFields[provinceName]) onProvinceChange();
    prev.current = province;
  }, [province]); // eslint-disable-line react-hooks/exhaustive-deps
  return <SelectField name={name} label="District" required lookup="districts" parentId={province} />;
}
