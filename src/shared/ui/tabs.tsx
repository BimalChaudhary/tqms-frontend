"use client";
import { useRef, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

export interface TabItem { id: string; label: string }

/** WAI-ARIA tabs: roving tabindex, Left/Right/Home/End keys. Panels are rendered by the caller. */
export function Tabs({ tabs, value, onChange, label, variant = "underline" }: {
  tabs: TabItem[]; value: string; onChange: (id: string) => void; label: string; variant?: "underline" | "pill";
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: KeyboardEvent, i: number) => {
    const n = tabs.length;
    const next = e.key === "ArrowRight" ? (i + 1) % n : e.key === "ArrowLeft" ? (i - 1 + n) % n : e.key === "Home" ? 0 : e.key === "End" ? n - 1 : -1;
    if (next < 0) return;
    e.preventDefault();
    onChange(tabs[next].id);
    refs.current[next]?.focus();
  };
  return (
    <div role="tablist" aria-label={label} className={cn("flex gap-1 overflow-x-auto", variant === "underline" && "border-b border-line")}>
      {tabs.map((t, i) => {
        const active = t.id === value;
        return (
          <button key={t.id} ref={(el) => { refs.current[i] = el; }} role="tab" id={`tab-${t.id}`} aria-selected={active} aria-controls={`panel-${t.id}`}
            tabIndex={active ? 0 : -1} onClick={() => onChange(t.id)} onKeyDown={(e) => onKey(e, i)}
            className={cn("shrink-0 whitespace-nowrap text-sm font-medium transition-colors",
              variant === "underline"
                ? cn("-mb-px border-b-2 px-3 py-2.5", active ? "border-brand-600 text-brand-700" : "border-transparent text-muted hover:text-ink")
                : cn("rounded-md px-3 py-1.5", active ? "bg-brand-600 text-white" : "bg-stone-100 text-ink hover:bg-stone-200"))}>
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

export const TabPanel = ({ id, children }: { id: string; children: ReactNode }) => (
  <div role="tabpanel" id={`panel-${id}`} aria-labelledby={`tab-${id}`} tabIndex={0} className="pt-5 focus-visible:outline-none">{children}</div>
);
