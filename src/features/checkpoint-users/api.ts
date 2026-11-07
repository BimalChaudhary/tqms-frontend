import { apiFetch } from "@/shared/api/client";
import type { ListParams, Paginated, Single } from "@/shared/api/types";
import type { CheckpointUser, CheckpointUserInput } from "./types";

export const checkpointUserApi = {
  list: (params: ListParams) => apiFetch<Paginated<CheckpointUser>>("/checkpoint-users", { params }),
  get: (id: string) => apiFetch<Single<CheckpointUser>>(`/checkpoint-users/${id}`).then((r) => r.data),
  create: (b: CheckpointUserInput) => apiFetch<Single<CheckpointUser>>("/checkpoint-users", { method: "POST", body: { ...b } }),
  update: (id: string, b: Partial<CheckpointUserInput>) => apiFetch<Single<CheckpointUser>>(`/checkpoint-users/${id}`, { method: "PATCH", body: { ...b } }),
  setStatus: (id: string, isActive: boolean) => apiFetch<Single<CheckpointUser>>(`/checkpoint-users/${id}/status`, { method: "PATCH", body: { isActive } }),
  remove: (id: string) => apiFetch<void>(`/checkpoint-users/${id}`, { method: "DELETE" }),
};
