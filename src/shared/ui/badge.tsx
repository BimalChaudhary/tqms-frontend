import { cn } from "@/shared/lib/cn";

type Tone = "neutral" | "ok" | "warn" | "bad" | "info" | "brand";
const tones: Record<Tone, string> = {
  neutral: "bg-stone-100 text-stone-700", ok: "bg-green-50 text-ok", warn: "bg-amber-50 text-warn",
  bad: "bg-red-50 text-bad", info: "bg-blue-50 text-info", brand: "bg-brand-50 text-brand-700",
};

export function Badge({ tone = "neutral", children, className }: { tone?: Tone; children: React.ReactNode; className?: string }) {
  return <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", tones[tone], className)}>{children}</span>;
}

/** One place that maps domain statuses to a label + tone, so every screen shows them identically. */
const STATUS: Record<string, { label: string; tone: Tone }> = {
  in_job: { label: "In job", tone: "info" },
  in_queue: { label: "In queue", tone: "warn" },
  unregistered: { label: "Unregistered", tone: "neutral" },
  payment_pending: { label: "Payment pending", tone: "bad" },
  pending: { label: "Pending approval", tone: "warn" },
  completed: { label: "Completed", tone: "ok" },
  active: { label: "Active", tone: "ok" },
  inactive: { label: "Inactive", tone: "neutral" },
  verified: { label: "Verified", tone: "ok" },
  unverified: { label: "Unverified", tone: "warn" },
  assigned: { label: "Assigned", tone: "ok" },
  unassigned: { label: "Unassigned", tone: "neutral" },
};
export function StatusBadge({ status }: { status: string }) {
  const s = STATUS[status] ?? { label: status, tone: "neutral" as Tone };
  return <Badge tone={s.tone}>{s.label}</Badge>;
}
