import { z } from "zod";

export const checkpointUserSchema = z.object({
  name: z.string().trim().min(2, "Enter the staff name").max(100, "Keep the staff name under 100 characters"),
  provinceId: z.string().min(1, "Select a state"),
  districtId: z.string().min(1, "Select a district"),
  address: z.string().trim().max(200, "Keep the street address under 200 characters").optional(),
  contact: z.string().trim().regex(/^9[678]\d{8}$/, "Enter a 10-digit mobile number starting with 96, 97 or 98"),
  email: z.string().trim().min(1, "Enter an email address").email("Enter a valid email address"),
  isActive: z.boolean(),
});
export type CheckpointUserValues = z.infer<typeof checkpointUserSchema>;
