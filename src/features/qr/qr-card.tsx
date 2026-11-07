"use client";
import { useQuery } from "@tanstack/react-query";
import { Download, Printer } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { useRef } from "react";
import { apiFetch } from "@/shared/api/client";
import type { Single } from "@/shared/api/types";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { ErrorState } from "@/shared/ui/states";

/** The QR carries the URL drivers scan to self-register an unregistered vehicle at this checkpoint. */
export function QrCard() {
  const ref = useRef<HTMLDivElement>(null);
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ["checkpoint-qr"], queryFn: () => apiFetch<Single<{ payload: string; label: string }>>("/checkpoint/qr").then((r) => r.data) });
  if (error) return <div className="card"><ErrorState error={error} onRetry={() => refetch()} /></div>;

  const download = () => {
    const canvas = ref.current?.querySelector("canvas");
    if (!canvas) return;
    Object.assign(document.createElement("a"), { href: canvas.toDataURL("image/png"), download: "checkpoint-qr.png" }).click();
  };
  return (
    <div className="card mx-auto max-w-sm p-6 text-center">
      {isLoading || !data ? <Skeleton className="mx-auto size-64" /> : (
        <>
          <div ref={ref} className="inline-block rounded-lg border border-line bg-white p-3">
            <QRCodeCanvas value={data.payload} size={256} marginSize={1} role="img" aria-label={`QR code for ${data.label}`} />
          </div>
          <p className="mt-3 font-medium">{data.label}</p>
          <p className="mt-1 text-sm text-muted">Drivers scan this to submit their vehicle for approval.</p>
          <div className="no-print mt-5 flex justify-center gap-2">
            <Button onClick={download}><Download className="size-4" /> Download PNG</Button>
            <Button variant="secondary" onClick={() => window.print()}><Printer className="size-4" /> Print</Button>
          </div>
        </>
      )}
    </div>
  );
}
