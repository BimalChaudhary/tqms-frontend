"use client";
import { ChevronLeft, ChevronRight, KeyRound, LogOut, Menu, Truck, UserRound, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { ApiError } from "@/shared/api/client";
import { useLogout, useSession } from "@/features/auth/hooks";
import { cn } from "@/shared/lib/cn";
import { IconButton } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { ErrorState } from "@/shared/ui/states";
import { Sidebar } from "./sidebar";

function UserMenu() {
  const { data } = useSession();
  const logout = useLogout();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close); document.addEventListener("keydown", close);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", close); };
  }, []);
  const item = "flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm hover:bg-stone-100";
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open} className="flex items-center gap-2.5 rounded-md px-2 py-1 hover:bg-stone-100">
        <span className="grid size-8 place-items-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700" aria-hidden>{data?.name?.[0]?.toUpperCase() ?? "?"}</span>
        <span className="hidden text-left leading-tight sm:block">
          <span className="block max-w-40 truncate text-sm font-medium">{data?.name ?? "…"}</span>
          <span className="block text-xs text-muted">Checkpoint</span>
        </span>
      </button>
      {open && (
        <div role="menu" className="absolute right-0 z-40 mt-1 w-52 rounded-lg border border-line bg-white p-1 shadow-lg">
          <Link role="menuitem" href="/profile" className={item} onClick={() => setOpen(false)}><UserRound className="size-4" /> My profile</Link>
          <Link role="menuitem" href="/change-password" className={item} onClick={() => setOpen(false)}><KeyRound className="size-4" /> Change password</Link>
          <button role="menuitem" className={cn(item, "text-bad")} onClick={() => logout.mutate()}><LogOut className="size-4" /> Log out</button>
        </div>
      )}
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { error, isLoading, refetch } = useSession();
  const [drawer, setDrawer] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const unauthorized = error instanceof ApiError && error.status === 401;

  useEffect(() => { if (unauthorized) router.replace("/login"); }, [unauthorized, router]);
  useEffect(() => {
    if (!drawer) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setDrawer(false);
    document.addEventListener("keydown", esc);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", esc);
      document.body.style.overflow = previousOverflow;
    };
  }, [drawer]);

  if (error && !unauthorized) return <div className="grid min-h-screen place-items-center"><ErrorState error={error} onRetry={() => refetch()} /></div>;

  return (
    <div className={cn("min-h-screen lg:grid", collapsed ? "lg:grid-cols-[4.5rem_minmax(0,1fr)]" : "lg:grid-cols-[15rem_minmax(0,1fr)]")}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-2 focus:rounded focus:bg-white focus:px-3 focus:py-2">Skip to content</a>
      {/* Desktop sidebar */}
      <aside className="no-print sticky top-0 hidden h-screen min-h-0 flex-col border-r border-line bg-white lg:flex">
        <Brand collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />
        <Sidebar collapsed={collapsed} onNavigate={() => {}} />
      </aside>
      {/* Mobile / tablet drawer */}
      {drawer && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setDrawer(false)} aria-hidden />
          <aside role="dialog" aria-modal="true" aria-label="Navigation drawer" className="absolute inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
            <Brand onClose={() => setDrawer(false)} />
            <Sidebar onNavigate={() => setDrawer(false)} />
          </aside>
        </div>
      )}
      <div className="min-w-0">
        <div className="no-print sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-white/90 px-4 backdrop-blur">
          <IconButton label="Open navigation" className="lg:hidden" onClick={() => setDrawer(true)}><Menu className="size-5" /></IconButton>
          <span className="hidden lg:block" />
          <UserMenu />
        </div>
        <main id="main" className="mx-auto max-w-7xl p-4 sm:p-6">
          {isLoading ? <div className="space-y-4"><Skeleton className="h-6 w-48" /><Skeleton className="h-64 w-full" /></div>
            : unauthorized ? null : <Suspense fallback={<Skeleton className="h-64 w-full" />}>{children}</Suspense>}
        </main>
      </div>
    </div>
  );
}

function Brand({ collapsed = false, onToggle, onClose }: { collapsed?: boolean; onToggle?: () => void; onClose?: () => void }) {
  return (
    <div className={cn("no-print flex h-14 shrink-0 items-center border-b border-line", collapsed ? "justify-center px-2" : "justify-between px-4")}>
      <Link href="/dashboard" aria-label="TQMS dashboard" title={collapsed ? "TQMS dashboard" : undefined}
        className={cn("flex min-w-0 items-center gap-2 font-semibold tracking-wide text-brand-700", collapsed && "justify-center")}>
        <Truck className="size-5 shrink-0" aria-hidden />
        {!collapsed && <span>TQMS</span>}
      </Link>
      {onToggle && (
        <IconButton label={collapsed ? "Expand sidebar" : "Collapse sidebar"} className="hidden lg:inline-flex" onClick={onToggle}>
          {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </IconButton>
      )}
      {onClose && <IconButton label="Close navigation" className="lg:hidden" onClick={onClose}><X className="size-5" /></IconButton>}
    </div>
  );
}
