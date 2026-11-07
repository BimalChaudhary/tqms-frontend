import { useId, type ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

export interface ControlProps { id: string; "aria-invalid"?: boolean; "aria-describedby"?: string }

/** Label + control + error/hint wiring (ids, aria-invalid, aria-describedby) in one place. */
export function FieldShell({ label, required, error, hint, className, children }: {
  label: string; required?: boolean; error?: string; hint?: string; className?: string;
  children: (p: ControlProps) => ReactNode;
}) {
  const id = useId();
  const descId = error ? `${id}-err` : hint ? `${id}-hint` : undefined;
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className="block text-sm font-medium">
        {label}{required && <span className="ml-0.5 text-bad" aria-hidden>*</span>}
        {required && <span className="sr-only"> (required)</span>}
      </label>
      {children({ id, "aria-invalid": error ? true : undefined, "aria-describedby": descId })}
      {error ? <p id={`${id}-err`} role="alert" className="text-xs text-bad">{error}</p>
        : hint ? <p id={`${id}-hint`} className="text-xs text-muted">{hint}</p> : null}
    </div>
  );
}
