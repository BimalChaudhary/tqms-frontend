"use client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { apiFetch } from "@/shared/api/client";
import type { Single } from "@/shared/api/types";
import { Skeleton } from "@/shared/ui/skeleton";
import { ErrorState } from "@/shared/ui/states";
import type { DashboardStats } from "./types";

const TILES: { key: keyof DashboardStats; label: string; href: string }[] = [
  { key: "inQueue", label: "Vehicles in queue", href: "/queue?status=in_queue" },
  { key: "inJob", label: "Vehicles in job", href: "/queue?status=in_job" },
  { key: "pendingApprovals", label: "Awaiting approval", href: "/queue" },
  { key: "paymentPending", label: "Payment pending", href: "/queue?status=payment_pending" },
  { key: "todayEntries", label: "Entries today", href: "/reports/detail-entries" },
];

export function StatsGrid() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["dashboard"], queryFn: () => apiFetch<Single<DashboardStats>>("/dashboard").then((r) => r.data),
  });
  if (error) return <div className="card"><ErrorState error={error} onRetry={() => refetch()} /></div>;
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {TILES.map((t) => (
        <li key={t.key}>
          <Link href={t.href} className="card block p-4 transition-colors hover:border-brand-500">
            <p className="text-sm text-muted">{t.label}</p>
            {isLoading ? <Skeleton className="mt-2 h-8 w-16" /> : <p className="mt-1 text-3xl font-semibold tabular-nums">{data?.[t.key] ?? 0}</p>}
          </Link>
        </li>
      ))}
    </ul>
  );
}
