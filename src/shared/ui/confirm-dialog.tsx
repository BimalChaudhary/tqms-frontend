"use client";
import { Button } from "./button";
import { Dialog } from "./dialog";

export function ConfirmDialog({ open, title, description, confirmLabel = "Confirm", tone = "danger", loading, onConfirm, onCancel }: {
  open: boolean; title: string; description: string; confirmLabel?: string; tone?: "danger" | "primary";
  loading?: boolean; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <Dialog open={open} onClose={onCancel} title={title} size="sm">
      <p className="text-sm text-muted">{description}</p>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>Cancel</Button>
        <Button variant={tone} loading={loading} onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </Dialog>
  );
}
