"use client";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { errorMessage } from "@/shared/api/client";
import type { ListParams } from "@/shared/api/types";
import { useToast } from "@/shared/ui/toast";
import { queueApi as api } from "./api";

export const QUEUE_KEY = ["queues"] as const;

export const useQueues = (params: ListParams) =>
  useQuery({ queryKey: [...QUEUE_KEY, "list", params], queryFn: () => api.list(params), placeholderData: keepPreviousData });
export const useQueue = (id: string) => useQuery({ queryKey: [...QUEUE_KEY, id], queryFn: () => api.get(id) });
export const useReceipt = (id: string, enabled = true) => useQuery({ queryKey: [...QUEUE_KEY, id, "receipt"], queryFn: () => api.receipt(id), enabled });
export const usePendingQueues = () => useQuery({ queryKey: [...QUEUE_KEY, "pending"], queryFn: api.pending });
export const usePendingQueue = (id: string) => useQuery({ queryKey: [...QUEUE_KEY, "pending", id], queryFn: () => api.pendingGet(id) });

function useInvalidate() {
  const qc = useQueryClient();
  return () => { qc.invalidateQueries({ queryKey: QUEUE_KEY }); qc.invalidateQueries({ queryKey: ["dashboard"] }); };
}

export function useCreateQueue() {
  const router = useRouter(); const toast = useToast(); const invalidate = useInvalidate();
  return useMutation({
    mutationFn: api.create,
    onSuccess: (r) => { invalidate(); toast.success(`Queue ${r.data.queueNumber} created`); router.push(`/queue/${r.data.id}`); },
  });
}

export function useCheckIn(id: string) {
  const router = useRouter(); const toast = useToast(); const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (b: Parameters<typeof api.checkIn>[1]) => api.checkIn(id, b),
    onSuccess: () => { invalidate(); toast.success("Vehicle checked in"); router.push(`/queue/${id}`); },
  });
}

export function useEndJourney() {
  const toast = useToast(); const invalidate = useInvalidate();
  return useMutation({
    mutationFn: api.endJourney,
    onSuccess: () => { invalidate(); toast.success("Journey ended"); },
    onError: (e) => toast.error(errorMessage(e)),
  });
}

export function useApprovePending(id: string) {
  const router = useRouter(); const toast = useToast(); const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (b: Parameters<typeof api.pendingApprove>[1]) => api.pendingApprove(id, b),
    onSuccess: () => { invalidate(); toast.success("Queue approved"); router.push("/queue"); },
  });
}

export function useRemovePending() {
  const toast = useToast(); const invalidate = useInvalidate();
  return useMutation({
    mutationFn: api.pendingRemove,
    onSuccess: () => { invalidate(); toast.success("Pending queue deleted"); },
    onError: (e) => toast.error(errorMessage(e)),
  });
}
