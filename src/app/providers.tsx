"use client";
import type { ReactNode } from "react";
import { QueryProvider } from "@/shared/api/query-provider";
import { ToastProvider } from "@/shared/ui/toast";

export function Providers({ children }: { children: ReactNode }) {
  return <QueryProvider><ToastProvider>{children}</ToastProvider></QueryProvider>;
}
