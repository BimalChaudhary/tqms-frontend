import type { ReactNode } from "react";
import { orDash } from "@/shared/lib/format";

export function DetailList({ items, columns = 2 }: { items: { label: string; value: ReactNode }[]; columns?: 1 | 2 }) {
  return (
    <dl className={columns === 2 ? "grid gap-x-10 sm:grid-cols-2" : "grid"}>
      {items.map((it) => (
        <div key={it.label} className="flex items-baseline justify-between gap-4 border-b border-line py-2.5 last:border-0">
          <dt className="text-sm text-muted">{it.label}</dt>
          <dd className="text-right text-sm font-medium">{typeof it.value === "string" || typeof it.value === "number" ? orDash(it.value) : it.value ?? "—"}</dd>
        </div>
      ))}
    </dl>
  );
}
