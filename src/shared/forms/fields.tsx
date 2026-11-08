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
import NepaliDate from "nepali-date-converter";

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

/** Bikram Sambat date input; form state stays ISO Gregorian for API compatibility. */
export function NepaliDateField({ name, label, required, hint, className, disabled }: Base) {
  const { control } = useFormContext<FieldValues>();
  const { field } = useController({ name, control });
  const error = useErr(name);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => {
    try {
      const initial = iso ? new NepaliDate(new Date(`${iso}T06:00:00Z`)) : new NepaliDate();
      return { year: initial.getYear(), month: initial.getMonth() };
    } catch { const now = new NepaliDate(); return { year: now.getYear(), month: now.getMonth() }; }
  });
  const iso = typeof field.value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(field.value) ? field.value : "";
  let bs = "";
  if (iso) {
    try {
      const [y, m, d] = iso.split("-").map(Number);
      const converted = new NepaliDate(new Date(Date.UTC(y, m - 1, d, 6))).getBS();
      bs = `${converted.year}-${String(converted.month + 1).padStart(2, "0")}-${String(converted.date).padStart(2, "0")}`;
    } catch { /* An unsupported Gregorian date remains editable for correction. */ }
  }
  const bsMonthNames = ["बैशाख", "जेठ", "असार", "साउन", "भदौ", "असोज", "कार्तिक", "मंसिर", "पुष", "माघ", "फागुन", "चैत"];
  const toIso = (year: number, month: number, day: number) => {
    try {
      const converted = new NepaliDate(year, month, day);
      const actual = converted.getBS();
      if (actual.year !== year || actual.month !== month || actual.date !== day) return undefined;
      const date = converted.toJsDate();
      const ad = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      return /^\d{4}-\d{2}-\d{2}$/.test(ad) ? ad : undefined;
    } catch { return undefined; }
  };
  const firstDay = new NepaliDate(view.year, view.month, 1).getDay();
  let daysInMonth = 0;
  for (let day = 1; day <= 32; day++) {
    const normalized = new NepaliDate(view.year, view.month, day).getBS();
    if (normalized.year !== view.year || normalized.month !== view.month) break;
    daysInMonth = day;
  }
  const moveMonth = (delta: number) => {
    const cursor = new NepaliDate(view.year, view.month, 1);
    cursor.setMonth(view.month + delta);
    const next = cursor.getBS();
    setView({ year: next.year, month: next.month });
  };
  return <FieldShell label={label} required={required} error={error} hint={hint ?? "Bikram Sambat (YYYY-MM-DD)"} className={className}>
    {(p) => <div className="relative">
      <div className="flex gap-2">
        <input {...p} ref={field.ref} name={field.name} value={iso ? bs : String(field.value ?? "")} disabled={disabled}
          placeholder="2083-01-01" inputMode="numeric" autoComplete="off" onBlur={field.onBlur}
          onChange={(e) => {
        const raw = e.target.value.trim();
        if (!raw) { field.onChange(""); return; }
        if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) { field.onChange(raw); return; }
        try {
          const [y, m, d] = raw.split("-").map(Number);
          field.onChange(toIso(y, m - 1, d) ?? raw);
        } catch { field.onChange(raw); }
      }} className="control min-w-0 flex-1" />
        <button type="button" disabled={disabled} aria-label={`Choose ${label.toLowerCase()} in Nepali calendar`} aria-expanded={open}
          onClick={() => { if (!open) { if (iso) { const selected = new NepaliDate(new Date(`${iso}T06:00:00Z`)); setView({ year: selected.getYear(), month: selected.getMonth() }); } setOpen(true); } else setOpen(false); }}
          className="control flex w-11 shrink-0 items-center justify-center px-2" title="Open Nepali calendar">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3.5" y="5" width="17" height="16" rx="2"/><path d="M16 3v4M8 3v4M4 9h16"/></svg>
        </button>
      </div>
      {open && <div role="dialog" aria-label="Nepali date picker" className="mt-2 w-72 max-w-full rounded-lg border border-line bg-white p-3 shadow-md">
        <div className="mb-2 flex items-center justify-between">
          <button type="button" onClick={() => moveMonth(-1)} aria-label="Previous Nepali month" className="rounded px-2 py-1 text-lg hover:bg-stone-100">‹</button>
          <span className="font-medium">{bsMonthNames[view.month]} {view.year}</span>
          <button type="button" onClick={() => moveMonth(1)} aria-label="Next Nepali month" className="rounded px-2 py-1 text-lg hover:bg-stone-100">›</button>
        </div>
        <div className="grid grid-cols-7 text-center text-xs text-muted">{["आ", "सो", "मं", "बु", "बि", "शु", "श"].map((day) => <span key={day} className="py-1">{day}</span>)}</div>
        <div className="grid grid-cols-7 gap-1 text-center text-sm">
          {Array.from({ length: firstDay }, (_, i) => <span key={`blank-${i}`} />)}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dateIso = toIso(view.year, view.month, day);
            const selected = dateIso && dateIso === iso;
            return <button key={day} type="button" disabled={!dateIso} aria-pressed={!!selected}
              onClick={() => { if (dateIso) { field.onChange(dateIso); setOpen(false); } }}
              className={`rounded py-1.5 hover:bg-brand-100 disabled:opacity-30 ${selected ? "bg-brand-700 text-white hover:bg-brand-700" : ""}`}>{day}</button>;
          })}
        </div>
        <div className="mt-2 flex justify-between border-t border-line pt-2 text-xs">
          <button type="button" className="text-brand-700 hover:underline" onClick={() => { field.onChange(""); setOpen(false); }}>मेट्नुहोस्</button>
          <button type="button" className="text-brand-700 hover:underline" onClick={() => { const now = new NepaliDate(); const current = now.getBS(); const dateIso = toIso(current.year, current.month, current.date); if (dateIso) field.onChange(dateIso); setView({ year: current.year, month: current.month }); setOpen(false); }}>आज</button>
        </div>
      </div>}
    </div>}
  </FieldShell>;
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
  const currentUrl = existingName?.startsWith("https://") ? existingName : undefined;
  const [previewUrl, setPreviewUrl] = useState<string>();
  useEffect(() => {
    if (!file?.type.startsWith("image/")) { setPreviewUrl(undefined); return; }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  return (
    <FieldShell label={label} required={required} error={error} hint={hint ?? (existingName && !file && !currentUrl ? `Current file: ${existingName}` : "PNG, JPG, WebP or PDF, up to 5 MB")} className={className}>
      {(p) => (
        <div className="flex items-center gap-3">
          <input {...p} type="file" accept={accept} disabled={disabled} name={field.name} ref={field.ref} onBlur={field.onBlur}
            onChange={(e) => field.onChange(e.target.files?.[0])}
            className={cn("control min-w-0 flex-1 !p-0 file:mr-3 file:cursor-pointer file:border-0 file:border-r file:border-line file:bg-stone-50 file:px-3 file:py-2 file:text-sm hover:file:bg-stone-100")} />
          {previewUrl && <img src={previewUrl} alt={`${label} preview`} className="size-14 shrink-0 rounded-md border border-line object-cover" />}
          {currentUrl && !file && <a href={currentUrl} target="_blank" rel="noreferrer" className="shrink-0 text-sm text-brand-700 underline">View current file</a>}
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
