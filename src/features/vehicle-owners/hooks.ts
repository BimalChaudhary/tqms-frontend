"use client";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type { ListParams } from "@/shared/api/types";
import { useToast } from "@/shared/ui/toast";
import { ownerApi as api } from "./api";

export const OWNER_KEY = ["vehicle-owners"] as const;

export const useOwners = (params: ListParams) =>
  useQuery({ queryKey: [...OWNER_KEY, "list", params], queryFn: () => api.list(params), placeholderData: keepPreviousData });
export const useOwner = (id: string) => useQuery({ queryKey: [...OWNER_KEY, id], queryFn: () => api.get(id) });
export const useOwnerBanks = (id: string) => useQuery({ queryKey: [...OWNER_KEY, id, "banks"], queryFn: () => api.banks(id) });
export const useOwnerVehicles = (id: string) => useQuery({ queryKey: [...OWNER_KEY, id, "vehicles"], queryFn: () => api.vehicles(id) });

export function useSaveOwner(id?: string) {
  const qc = useQueryClient(); const router = useRouter(); const toast = useToast();
  return useMutation({
    mutationFn: (b: Record<string, unknown>) => (id ? api.update(id, b) : api.create(b)),
    onSuccess: (r) => { qc.invalidateQueries({ queryKey: OWNER_KEY }); toast.success(id ? "Owner updated" : "Owner added"); router.push(`/vehicle-owners/${r.data.id}`); },
  });
}

export function useAddBank(id: string) {
  const qc = useQueryClient(); const toast = useToast();
  return useMutation({
    mutationFn: (b: Record<string, unknown>) => api.addBank(id, b),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [...OWNER_KEY, id, "banks"] }); toast.success("Bank account added"); },
  });
}

export function useUpdateBank(id: string) {
  const qc = useQueryClient(); const toast = useToast();
  return useMutation({
    mutationFn: ({ bankId, values }: { bankId: string; values: Record<string, unknown> }) => api.updateBank(id, bankId, values),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [...OWNER_KEY, id, "banks"] }); toast.success("Bank account updated"); },
  });
}
