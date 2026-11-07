import { AlertTriangle, Inbox } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "./button";
import { errorMessage } from "@/shared/api/client";

export function EmptyState({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
      <Inbox className="size-8 text-stone-300" aria-hidden />
      <p className="font-medium">{title}</p>
      {hint && <p className="max-w-sm text-sm text-muted">{hint}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-2 px-6 py-12 text-center">
      <AlertTriangle className="size-8 text-bad" aria-hidden />
      <p className="font-medium">Couldn’t load this data</p>
      <p className="max-w-sm text-sm text-muted">{errorMessage(error)}</p>
      {onRetry && <Button variant="secondary" size="sm" className="mt-2" onClick={onRetry}>Try again</Button>}
    </div>
  );
}
