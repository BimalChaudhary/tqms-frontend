"use client";
import { CheckCircle2, Info, XCircle } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

type Tone = "success" | "error" | "info";
interface ToastItem { id: number; tone: Tone; message: string }
interface Api { success: (m: string) => void; error: (m: string) => void; info: (m: string) => void }

const Ctx = createContext<Api | null>(null);
let seq = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const push = useCallback((tone: Tone, message: string) => {
    const id = ++seq;
    setItems((s) => [...s, { id, tone, message }]);
    setTimeout(() => setItems((s) => s.filter((t) => t.id !== id)), tone === "error" ? 6000 : 3500);
  }, []);
  const api = useMemo<Api>(() => ({ success: (m) => push("success", m), error: (m) => push("error", m), info: (m) => push("info", m) }), [push]);
  const Icon = { success: CheckCircle2, error: XCircle, info: Info };

  return (
    <Ctx.Provider value={api}>
      {children}
      <div aria-live="polite" role="status" className="no-print pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-end gap-2 sm:left-auto">
        {items.map((t) => {
          const I = Icon[t.tone];
          return (
            <div key={t.id} className="pointer-events-auto flex w-full max-w-sm items-start gap-2.5 rounded-lg border border-line bg-white px-4 py-3 text-sm shadow-lg">
              <I className={cn("mt-0.5 size-4 shrink-0", t.tone === "success" && "text-ok", t.tone === "error" && "text-bad", t.tone === "info" && "text-info")} aria-hidden />
              <p>{t.message}</p>
            </div>
          );
        })}
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useToast must be used inside <ToastProvider>");
  return c;
}
