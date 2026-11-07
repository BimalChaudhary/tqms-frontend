import { z } from "zod";
import { nepaliMobile, uploadFile } from "@/shared/forms/validators";

const optionalEmail = z.string().trim().refine(
  (value) => value === "" || z.string().email().safeParse(value).success,
  "Enter a valid email address",
);
const optionalPan = z.string().trim().refine((value) => value === "" || /^\d{9}$/.test(value), "PAN is 9 digits");
const optionalMobile = z.string().trim().refine(
  (value) => value === "" || nepaliMobile.safeParse(value).success,
  "Enter a 10-digit mobile number starting with 96, 97 or 98",
);

export const ownerSchema = z.object({
  name: z.string().trim().min(2, "Enter the owner or company name").max(150, "Keep the owner or company name under 150 characters"),
  provinceId: z.string().min(1, "Select a state"),
  districtId: z.string().min(1, "Select a district"),
  localLevel: z.string().trim().max(100, "Keep the local level under 100 characters"),
  streetAddress: z.string().trim().max(200, "Keep the street address under 200 characters"),
  email: optionalEmail,
  panNumber: optionalPan,
  phone: nepaliMobile,
  isIndividual: z.boolean(),
  contactName: z.string().trim().max(100, "Keep the contact name under 100 characters"), contactEmail: optionalEmail,
  contactNumber: optionalMobile,
  registrationNumber: z.string().trim(),
  citizenshipNumber: z.string().trim(),
  logo: uploadFile("image/*"),
  registrationDocument: uploadFile(),
  citizenshipFront: uploadFile("image/*"),
  citizenshipBack: uploadFile("image/*"),
});
export type OwnerValues = z.infer<typeof ownerSchema>;

export const bankFields = [
  { name: "bankId", label: "Bank", type: "select", lookup: "banks", required: true },
  { name: "branchName", label: "Branch name", type: "text", required: true },
  { name: "accountHolder", label: "Account holder name", type: "text", required: true },
  { name: "accountNumber", label: "Account number", type: "text", required: true, pattern: /^\d{8,20}$/, patternMessage: "Account number is 8–20 digits" },
  { name: "chequePhoto", label: "Cheque image", type: "file", accept: "image/jpeg,image/png,image/webp,application/pdf,.jpg,.jpeg,.png,.webp,.pdf" },
  { name: "isCurrent", label: "Mark as current bank", type: "checkbox" },
] as const;
