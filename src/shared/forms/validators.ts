import { z } from "zod";

/** Form numbers stay strings (so inputs can be empty) and are converted at submit time. */
export const positiveNumber = (label = "a value") =>
  z.string().trim().refine((v) => v !== "" && Number.isFinite(Number(v)) && Number(v) > 0, `Enter ${label} greater than 0`);

export const nepaliMobile = z.string().trim().regex(/^9[678]\d{8}$/, "Enter a 10-digit mobile number starting with 96, 97 or 98");

const vehicleNumberPattern = /^[\p{L}\p{N}]+(?:[ -][\p{L}\p{N}]+)*$/u;
export const isValidVehicleNumber = (value: string) => {
  const normalized = value.trim();
  return normalized.length >= 2 && normalized.length <= 32 && /\d/.test(normalized) && vehicleNumberPattern.test(normalized);
};

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const allowedUploadType = (file: File, accept = "image/*,.pdf") => {
  const types = accept.split(",").map((type) => type.trim().toLowerCase());
  const extension = file.name.toLowerCase().split(".").pop();
  return types.some((type) => {
    if (type === "image/*") {
      const safeImage = ["image/jpeg", "image/png", "image/webp"].includes(file.type.toLowerCase());
      return safeImage || (!file.type && ["jpg", "jpeg", "png", "webp"].includes(extension ?? ""));
    }
    if (type.startsWith(".")) return extension === type.slice(1);
    return file.type.toLowerCase() === type;
  });
};

/** File fields are optional when editing records; validate a selected replacement the same way everywhere. */
export const uploadFile = (accept = "image/*,.pdf") =>
  z.custom<File | undefined>().optional().superRefine((file, ctx) => {
    if (file === undefined) return;
    if (typeof File === "undefined" || !(file instanceof File)) {
      ctx.addIssue({ code: "custom", message: "Choose a valid file" });
      return;
    }
    if (file.size === 0) ctx.addIssue({ code: "custom", message: "The selected file is empty" });
    if (file.size > MAX_UPLOAD_BYTES) ctx.addIssue({ code: "custom", message: "File must be 5 MB or smaller" });
    if (!allowedUploadType(file, accept)) ctx.addIssue({ code: "custom", message: "Choose a supported image or PDF file" });
  });
