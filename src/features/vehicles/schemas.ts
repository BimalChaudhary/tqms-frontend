import { z } from "zod";

export const vehicleSchema = z.object({
  sanghId: z.string().min(1, "Select a sthaniya sangh"),
  ownerId: z.string().min(1, "Select the vehicle owner"),
  vehicleTypeId: z.string().min(1, "Select a vehicle type"),
  plateColorId: z.string().min(1, "Select the plate colour"),
  engineNumber: z.string().trim().optional(),
  chassisNumber: z.string().trim().optional(),
  companyName: z.string().trim().optional(),
  modelNo: z.string().trim().optional(),
  plateType: z.enum(["embossed", "provincial", "zonal"], { errorMap: () => ({ message: "Select a plate type" }) }),
  zonalCodeId: z.string(), provinceId: z.string(), symbolId: z.string(),
  lotNo: z.string().trim(), vehicleNumber: z.string().trim(), embossedNumber: z.string().trim(),
}).superRefine((v, ctx) => {
  const need = (path: keyof typeof v, message: string) => { if (!v[path]) ctx.addIssue({ code: "custom", path: [path], message }); };
  const lotNumber = v.lotNo.trim();
  if (lotNumber && !/^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/.test(lotNumber))
    ctx.addIssue({ code: "custom", path: ["lotNo"], message: "Use letters or digits separated by hyphens for the lot number" });
  const numericPlatePart = (path: "vehicleNumber", label: string) => {
    const value = v[path].trim();
    if (value && !/^\d{1,4}$/.test(value)) ctx.addIssue({ code: "custom", path: [path], message: `${label} must be 1–4 digits` });
  };
  if (v.plateType === "zonal") {
    need("zonalCodeId", "Select a zonal code"); need("symbolId", "Select a symbol");
    need("lotNo", "Enter the lot number"); need("vehicleNumber", "Enter the vehicle number");
    numericPlatePart("vehicleNumber", "Vehicle number");
  }
  if (v.plateType === "provincial") {
    need("provinceId", "Select a state"); need("symbolId", "Select a symbol");
    need("lotNo", "Enter the lot number"); need("vehicleNumber", "Enter the vehicle number");
    numericPlatePart("vehicleNumber", "Vehicle number");
  }
  if (v.plateType === "embossed") {
    need("embossedNumber", "Enter the embossed plate number");
    if (v.embossedNumber && !/^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/.test(v.embossedNumber.trim()))
      ctx.addIssue({ code: "custom", path: ["embossedNumber"], message: "Use letters or digits separated by hyphens" });
  }
});
export type VehicleValues = z.infer<typeof vehicleSchema>;

export const tareWeightSchema = z.object({
  tareWeight: z.string().trim().refine((v) => v !== "" && Number(v) > 0 && Number(v) <= 100000, "Enter a weight between 1 and 100,000 kg"),
});
