import { z } from "zod";
import { isValidVehicleNumber, nepaliMobile, positiveNumber } from "@/shared/forms/validators";
import type { VehicleKind } from "./types";

/** Registered vehicles are picked from the register; unregistered/Indian ones are typed in. */
export const createQueueSchema = (kind: VehicleKind) =>
  z.object({
    vehicleId: z.string(),
    vehicleNumber: z.string().trim(),
    vehicleTypeId: z.string(),
    from: z.string().min(1, "Select the start point"),
    to: z.string().min(1, "Select the destination"),
    grossWeight: positiveNumber("a gross weight"),
    transportCompany: z.string().trim().optional(),
    loadDetails: z.string().trim().min(1, "Enter the load details"),
    narration: z.string().trim().max(200, "Keep it under 200 characters").optional(),
  }).superRefine((v, ctx) => {
    if (kind === "registered" && !v.vehicleId) ctx.addIssue({ code: "custom", path: ["vehicleId"], message: "Select a vehicle" });
    if (kind !== "registered") {
      if (!v.vehicleNumber) ctx.addIssue({ code: "custom", path: ["vehicleNumber"], message: "Enter the vehicle number" });
      else if (!isValidVehicleNumber(v.vehicleNumber)) ctx.addIssue({ code: "custom", path: ["vehicleNumber"], message: "Enter a valid plate number using letters, digits, spaces or hyphens" });
      if (!v.vehicleTypeId) ctx.addIssue({ code: "custom", path: ["vehicleTypeId"], message: "Select a vehicle type" });
    }
    if (v.from && v.from === v.to) ctx.addIssue({ code: "custom", path: ["to"], message: "Destination must differ from the start point" });
  });
export type CreateQueueValues = z.infer<ReturnType<typeof createQueueSchema>>;

export const checkInSchema = z.object({ grossWeight: positiveNumber("a gross weight") });
export type CheckInValues = z.infer<typeof checkInSchema>;

export const approvePendingSchema = z.object({
  matchedVehicleId: z.string().optional(),
  from: z.string().min(1, "Select the start point"),
  to: z.string().min(1, "Select the destination"),
  entryPosition: z.string().min(1, "Select the checkpoint entry"),
  grossWeight: positiveNumber("a gross weight"),
  material: z.string().trim().min(1, "Enter the material"),
  remarks: z.string().trim().optional(),
  driverPhone: z.union([z.literal(""), nepaliMobile]).optional(),
}).refine((v) => v.from !== v.to, { path: ["to"], message: "Destination must differ from the start point" });
export type ApprovePendingValues = z.infer<typeof approvePendingSchema>;
