"use client";
import { Printer } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Dialog } from "@/shared/ui/dialog";
import { Skeleton } from "@/shared/ui/skeleton";
import { ErrorState } from "@/shared/ui/states";
import { useReceipt } from "../hooks";
import { ReceiptPreview } from "./receipt-preview";

export function ReceiptDialog({ queueId, onClose }: { queueId: string | null; onClose: () => void }) {
  const { data, isLoading, error, refetch } = useReceipt(queueId ?? "", !!queueId);
  return (
    <Dialog open={!!queueId} onClose={onClose} title="Receipt" size="sm">
      {error ? <ErrorState error={error} onRetry={() => refetch()} />
        : isLoading || !data ? <Skeleton className="h-64 w-full" />
        : <>
            <ReceiptPreview data={data} />
            <div className="no-print mt-4 flex justify-end gap-2">
              <Button variant="secondary" onClick={onClose}>Close</Button>
              <Button onClick={() => window.print()}><Printer className="size-4" /> Print</Button>
            </div>
          </>}
    </Dialog>
  );
}
