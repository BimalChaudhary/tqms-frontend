import { apiFetch } from "@/shared/api/client";
import type { ListParams, Paginated, Single } from "@/shared/api/types";
import type { OwnerBank, OwnerDetail, OwnerSummary, OwnerVehicle } from "./types";

export const ownerApi = {
  list: (params: ListParams) => apiFetch<Paginated<OwnerSummary>>("/vehicle-owners", { params }),
  get: (id: string) => apiFetch<Single<OwnerDetail>>(`/vehicle-owners/${id}`).then((r) => r.data),
  create: (b: Record<string, unknown>) => apiFetch<Single<OwnerSummary>>("/vehicle-owners", { method: "POST", body: b }),
  update: (id: string, b: Record<string, unknown>) => apiFetch<Single<OwnerSummary>>(`/vehicle-owners/${id}`, { method: "PATCH", body: b }),
  banks: (id: string) => apiFetch<Single<OwnerBank[]>>(`/vehicle-owners/${id}/banks`).then((r) => r.data),
  addBank: (id: string, b: Record<string, unknown>) => apiFetch<Single<OwnerBank>>(`/vehicle-owners/${id}/banks`, { method: "POST", body: b }),
  updateBank: (id: string, bankId: string, b: Record<string, unknown>) => apiFetch<Single<OwnerBank>>(`/vehicle-owners/${id}/banks/${bankId}`, { method: "PATCH", body: b }),
  vehicles: (id: string) => apiFetch<Single<OwnerVehicle[]>>(`/vehicle-owners/${id}/vehicles`).then((r) => r.data),
};
