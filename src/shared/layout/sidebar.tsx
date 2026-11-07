"use client";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/shared/lib/cn";
import { NAV, type NavItem } from "./nav";

const isActive = (path: string, href: string) => path === href || (href !== "/dashboard" && path.startsWith(`${href}/`));

function Group({ item, path, onNavigate, collapsed }: { item: NavItem; path: string; onNavigate: () => void; collapsed: boolean }) {
  const childActive = item.children?.some((child) => isActive(path, child.href)) ?? false;
  const [open, setOpen] = useState(childActive);
  const [flyoutOpen, setFlyoutOpen] = useState(false);
  const Icon = item.icon;
  const base = cn(
    "flex w-full items-center rounded-md py-2 text-sm font-medium transition-colors",
    collapsed ? "justify-center px-0" : "gap-3 px-3",
  );

  if (!item.children) {
    const active = isActive(path, item.href!) && !(item.href === "/queue" && path.startsWith("/queue/new"));
    return (
      <Link href={item.href!} onClick={onNavigate} aria-current={active ? "page" : undefined} title={collapsed ? item.label : undefined}
        className={cn(base, active ? "bg-brand-50 text-brand-700" : "text-ink hover:bg-stone-100")}>
        <Icon className="size-4 shrink-0" aria-hidden />
        {!collapsed && item.label}
      </Link>
    );
  }

  const children = (
    <ul className={cn("space-y-0.5", collapsed ? "p-1" : "ml-5 mt-1 border-l border-line pl-3")}>
      {item.children.map((child) => {
        const active = isActive(path, child.href);
        return (
          <li key={child.href}>
            <Link href={child.href} onClick={() => { setFlyoutOpen(false); onNavigate(); }} aria-current={active ? "page" : undefined}
              className={cn("block rounded-md px-3 py-2 text-sm", active ? "bg-brand-50 font-medium text-brand-700" : "text-muted hover:bg-stone-100 hover:text-ink")}>
              {child.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  if (collapsed) {
    return (
      <div className="group relative">
        <button type="button" aria-label={item.label} aria-expanded={flyoutOpen} title={item.label} onClick={() => setFlyoutOpen((value) => !value)}
          className={cn(base, childActive ? "bg-brand-50 text-brand-700" : "text-ink hover:bg-stone-100")}>
          <Icon className="size-4 shrink-0" aria-hidden />
        </button>
        {flyoutOpen && (
          <div className="absolute left-full top-0 z-50 ml-2 w-56 rounded-lg border border-line bg-white p-2 shadow-lg">
            <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted">{item.label}</p>
            {children}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <button type="button" aria-expanded={open || childActive} onClick={() => setOpen((value) => !value)}
        className={cn(base, childActive ? "text-brand-700" : "text-ink hover:bg-stone-100")}>
        <Icon className="size-4 shrink-0" aria-hidden />
        <span className="flex-1 text-left">{item.label}</span>
        <ChevronDown className={cn("size-4 transition-transform", (open || childActive) && "rotate-180")} aria-hidden />
      </button>
      {(open || childActive) && children}
    </div>
  );
}

export function Sidebar({ onNavigate, collapsed = false }: { onNavigate: () => void; collapsed?: boolean }) {
  const path = usePathname();
  return (
    <nav aria-label="Main" className={cn("flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto", collapsed ? "items-stretch p-2" : "p-3")}>
      {NAV.map((item) => <Group key={item.label} item={item} path={path} onNavigate={onNavigate} collapsed={collapsed} />)}
    </nav>
  );
}
