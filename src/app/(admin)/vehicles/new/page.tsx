import type { Metadata } from "next";
import { VehicleForm } from "@/features/vehicles/components/vehicle-form";
export const metadata: Metadata = { title: "Add vehicle" };
export default function Page() { return <VehicleForm />; }
