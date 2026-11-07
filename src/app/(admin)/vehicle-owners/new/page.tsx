import type { Metadata } from "next";
import { OwnerForm } from "@/features/vehicle-owners/components/owner-form";
export const metadata: Metadata = { title: "Add vehicle owner" };
export default function Page() { return <OwnerForm />; }
