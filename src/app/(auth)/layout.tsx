import { Truck } from "lucide-react";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-b from-brand-50 to-canvas p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-2 text-lg font-semibold tracking-wide text-brand-700"><Truck className="size-6" aria-hidden /> TQMS</div>
        <div className="card p-6 shadow-sm">{children}</div>
      </div>
    </main>
  );
}
