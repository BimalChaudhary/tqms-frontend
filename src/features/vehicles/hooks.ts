"use client";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { errorMessage } from "@/shared/api/client";
import type { ListParams } from "@/shared/api/types";
import { useToast } from "@/shared/ui/toast";
import { vehicleApi as api } from "./api";

export const VEHICLE_KEY = ["vehicles"] as const;

export const useVehicles = (params: ListParams) =>
  useQuery({ queryKey: [...VEHICLE_KEY, "list", params], queryFn: () => api.list(params), placeholderData: keepPreviousData });
export const useVehicle = (id: string) => useQuery({ queryKey: [...VEHICLE_KEY, id], queryFn: () => api.get(id) });
export const useAuditLogs = (id: string, enabled: boolean) => useQuery({ queryKey: [...VEHICLE_KEY, id, "audit"], queryFn: () => api.auditLogs(id), enabled });

export function useSaveVehicle(id?: string) {
  const qc = useQueryClient(); const router = useRouter(); const toast = useToast();
  return useMutation({
    mutationFn: (b: Parameters<typeof api.create>[0]) => (id ? api.update(id, b) : api.create(b)),
    onSuccess: (r) => { qc.invalidateQueries({ queryKey: VEHICLE_KEY }); toast.success(id ? "Vehicle updated" : "Vehicle added"); router.push(`/vehicles/${r.data.id}`); },
  });
}

/** Generic CRUD for any /vehicles/:id/:resource sub-list. */
export function useSubRecords(vehicleId: string, resource: string) {
  return useQuery({ queryKey: [...VEHICLE_KEY, vehicleId, resource], queryFn: () => api.subList(vehicleId, resource) });
}
export function useSubRecordMutations(vehicleId: string, resource: string, noun: string) {
  const qc = useQueryClient(); const toast = useToast();
  const done = (msg: string) => { qc.invalidateQueries({ queryKey: [...VEHICLE_KEY, vehicleId] }); toast.success(msg); };
  return {
    save: useMutation({
      mutationFn: ({ rid, values }: { rid?: string; values: Record<string, unknown> }) =>
        rid ? api.subUpdate(vehicleId, resource, rid, values) : api.subCreate(vehicleId, resource, values),
      onSuccess: (_r, v) => done(v.rid ? `${noun} updated` : `${noun} added`),
    }),
    remove: useMutation({
      mutationFn: (rid: string) => api.subRemove(vehicleId, resource, rid),
      onSuccess: () => done(`${noun} deleted`), onError: (e) => toast.error(errorMessage(e)),
    }),
  };
}

export function useTareWeight(id: string) {
  const qc = useQueryClient(); const toast = useToast();
  const query = useQuery({ queryKey: [...VEHICLE_KEY, id, "tare"], queryFn: () => api.tareWeight(id) });
  const save = useMutation({
    mutationFn: (w: number) => api.setTareWeight(id, w),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [...VEHICLE_KEY, id] }); toast.success("Tare weight saved"); },
  });
  return { query, save };
}
