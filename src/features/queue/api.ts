import { apiFetch } from "@/shared/api/client";
import type { ListParams, Paginated, Single } from "@/shared/api/types";
import type {
  ApprovePendingInput, CheckInInput, CreateQueueInput, PendingQueue, PendingQueueDetail, QueueDetail, QueueSummary, Receipt,
} from "./types";

export const queueApi = {
  list: (params: ListParams) => apiFetch<Paginated<QueueSummary>>("/queues", { params }),
  get: (id: string) => apiFetch<Single<QueueDetail>>(`/queues/${id}`).then((r) => r.data),
  create: (b: CreateQueueInput) => apiFetch<Single<QueueDetail>>("/queues", { method: "POST", body: { ...b } }),
  checkIn: (id: string, b: CheckInInput) => apiFetch<Single<QueueDetail>>(`/queues/${id}/check-in`, { method: "POST", body: { ...b } }),
  endJourney: (id: string) => apiFetch<Single<QueueDetail>>(`/queues/${id}/end-journey`, { method: "POST" }),
  receipt: (id: string) => apiFetch<Single<Receipt>>(`/queues/${id}/receipt`).then((r) => r.data),

  pending: () => apiFetch<Single<PendingQueue[]>>("/queues/pending").then((r) => r.data),
  pendingGet: (id: string) => apiFetch<Single<PendingQueueDetail>>(`/queues/pending/${id}`).then((r) => r.data),
  pendingApprove: (id: string, b: ApprovePendingInput) => apiFetch<Single<QueueDetail>>(`/queues/pending/${id}/approve`, { method: "POST", body: { ...b } }),
  pendingRemove: (id: string) => apiFetch<void>(`/queues/pending/${id}`, { method: "DELETE" }),
};
