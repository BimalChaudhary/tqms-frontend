import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = { title: { default: "TQMS Checkpoint", template: "%s · TQMS Checkpoint" }, description: "Truck queue management for checkpoint staff" };
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en"><body><Providers>{children}</Providers></body></html>
  );
}
