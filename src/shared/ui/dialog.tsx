"use client";
import { X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { IconButton } from "./button";

/** Built on the native <dialog>: focus trap, Esc to close and inert background come from the browser. */
export function Dialog({ open, onClose, title, description, children, size = "md" }: {
  open: boolean; onClose: () => void; title: string; description?: string; children: ReactNode; size?: "sm" | "md" | "lg";
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const openRef = useRef(open);
  openRef.current = open;
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref} onClose={() => { if (openRef.current) onClose(); }} onClick={(e) => e.target === ref.current && onClose()}
      aria-label={title}
      className={cn("m-auto w-[calc(100%-2rem)] rounded-xl border border-line bg-white p-0 shadow-xl",
        size === "sm" && "max-w-sm", size === "md" && "max-w-lg", size === "lg" && "max-w-3xl")}
    >
      {open && (
        <div className="max-h-[85vh] overflow-y-auto">
          <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
            <div>
              <h2 className="text-base font-semibold">{title}</h2>
              {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
            </div>
            <IconButton label="Close dialog" onClick={onClose}><X className="size-4" /></IconButton>
          </div>
          <div className="p-5">{children}</div>
        </div>
      )}
    </dialog>
  );
}
