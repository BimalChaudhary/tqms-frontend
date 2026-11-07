import { apiFetch } from "@/shared/api/client";
import type { ListParams, Paginated, Single } from "@/shared/api/types";
import type { AuditLogEntry, SubRecord, VehicleDetail, VehicleFormData, VehicleSummary } from "./types";

type VehiclePayload = Partial<Omit<VehicleFormData, "plateType">> & { plateType: string };

export const vehicleApi = {
  list: (params: ListParams) => apiFetch<Paginated<VehicleSummary>>("/vehicles", { params }),
  get: (id: string) => apiFetch<Single<VehicleDetail>>(`/vehicles/${id}`).then((r) => r.data),
  create: (b: VehiclePayload) => apiFetch<Single<VehicleSummary>>("/vehicles", { method: "POST", body: { ...b } }),
  update: (id: string, b: VehiclePayload) => apiFetch<Single<VehicleSummary>>(`/vehicles/${id}`, { method: "PATCH", body: { ...b } }),
  auditLogs: (id: string) => apiFetch<Single<AuditLogEntry[]>>(`/vehicles/${id}/audit-logs`).then((r) => r.data),

  // Generic per-vehicle sub-resources (documents, insurances, bluebooks …)
  subList: (id: string, resource: string) => apiFetch<Single<SubRecord[]>>(`/vehicles/${id}/${resource}`).then((r) => r.data),
  subCreate: (id: string, resource: string, b: Record<string, unknown>) => apiFetch<Single<SubRecord>>(`/vehicles/${id}/${resource}`, { method: "POST", body: b }),
  subUpdate: (id: string, resource: string, rid: string, b: Record<string, unknown>) => apiFetch<Single<SubRecord>>(`/vehicles/${id}/${resource}/${rid}`, { method: "PATCH", body: b }),
  subRemove: (id: string, resource: string, rid: string) => apiFetch<void>(`/vehicles/${id}/${resource}/${rid}`, { method: "DELETE" }),

  tareWeight: (id: string) => apiFetch<Single<{ tareWeight: number }>>(`/vehicles/${id}/tare-weight`).then((r) => r.data),
  setTareWeight: (id: string, tareWeight: number) => apiFetch<Single<{ tareWeight: number }>>(`/vehicles/${id}/tare-weight`, { method: "PATCH", body: { tareWeight } }),
};
