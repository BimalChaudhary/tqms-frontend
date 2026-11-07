"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { VehicleKind } from "../types";
import { CreateQueueForm } from "./create-queue-form";
import { VehicleKindDialog } from "./vehicle-kind-dialog";

const KINDS: VehicleKind[] = ["registered", "unregistered", "indian"];

/** Step 1: choose the vehicle kind (kept in the URL so reload/back work). Step 2: the matching form. */
export function NewQueueFlow() {
  const router = useRouter(); const path = usePathname(); const sp = useSearchParams();
  const k = sp.get("kind") as VehicleKind | null;
  const kind = k && KINDS.includes(k) ? k : null;
  return (
    <>
      {kind && <CreateQueueForm key={kind} kind={kind} />}
      <VehicleKindDialog open={!kind} onPick={(x) => router.replace(`${path}?kind=${x}`)} onClose={() => router.push("/queue")} />
    </>
  );
}
