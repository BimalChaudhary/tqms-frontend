"use client";
import { Dialog } from "@/shared/ui/dialog";
import type { VehicleKind } from "../types";

const KINDS: { id: VehicleKind; title: string; hint: string }[] = [
  { id: "registered", title: "Registered", hint: "Vehicle is in the TQMS register" },
  { id: "unregistered", title: "Unregistered", hint: "Nepali vehicle not yet registered" },
  { id: "indian", title: "Indian", hint: "Vehicle with an Indian plate" },
];

export function VehicleKindDialog({ open, onPick, onClose }: { open: boolean; onPick: (k: VehicleKind) => void; onClose: () => void }) {
  return (
    <Dialog open={open} onClose={onClose} title="Which kind of vehicle is this?" description="This decides which details we ask for next.">
      <div className="grid gap-3 sm:grid-cols-3">
        {KINDS.map((k) => (
          <button key={k.id} onClick={() => onPick(k.id)}
            className="rounded-lg border border-line p-4 text-left transition-colors hover:border-brand-600 hover:bg-brand-50">
            <span className="block font-medium">{k.title}</span>
            <span className="mt-1 block text-xs text-muted">{k.hint}</span>
          </button>
        ))}
      </div>
    </Dialog>
  );
}
