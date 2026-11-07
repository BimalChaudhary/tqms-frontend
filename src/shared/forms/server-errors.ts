import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { ApiError } from "@/shared/api/client";

/** Maps a 422 `{ errors: { field: message } }` response onto the form fields. Returns true if handled. */
export function applyServerErrors<T extends FieldValues>(error: unknown, setError: UseFormSetError<T>): boolean {
  if (!(error instanceof ApiError) || !error.fieldErrors) return false;
  Object.entries(error.fieldErrors).forEach(([name, message]) => setError(name as Path<T>, { type: "server", message }));
  return true;
}
