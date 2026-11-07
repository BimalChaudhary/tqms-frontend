import { Truck, QrCode, ListOrdered, MapPin, PlusSquare, FileBarChart, LayoutDashboard, type LucideIcon } from "lucide-react";

export interface NavItem { label: string; href?: string; icon: LucideIcon; children?: { label: string; href: string }[] }

/** Mirrors the existing TQMS navigation so checkpoint staff keep their mental model. */
export const NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Checkpoints", icon: MapPin, children: [{ label: "Checkpoint users", href: "/checkpoint-users" }, { label: "Narration", href: "/narration" }] },
  { label: "Queue", href: "/queue", icon: ListOrdered },
  { label: "Add new queue", href: "/queue/new", icon: PlusSquare },
  { label: "Vehicle", icon: Truck, children: [
    { label: "Vehicle owners", href: "/vehicle-owners" }, { label: "Vehicles", href: "/vehicles" }, { label: "Other vehicles", href: "/other-vehicles" } ] },
  { label: "Report", icon: FileBarChart, children: [
    { label: "Checkpoint entry", href: "/reports/checkpoint-entries" }, { label: "Detail entry report", href: "/reports/detail-entries" } ] },
  { label: "Generate QR", href: "/qr", icon: QrCode },
];
