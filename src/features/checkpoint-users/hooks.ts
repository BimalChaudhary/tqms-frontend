"use client";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { errorMessage } from "@/shared/api/client";
import type { ListParams, Paginated } from "@/shared/api/types";
import { useToast } from "@/shared/ui/toast";
import { checkpointUserApi as api } from "./api";
import type { CheckpointUser, CheckpointUserInput } from "./types";

const KEY = ["checkpoint-users"] as const;

export const useCheckpointUsers = (params: ListParams) =>
  useQuery({ queryKey: [...KEY, "list", params], queryFn: () => api.list(params), placeholderData: keepPreviousData });

export const useCheckpointUser = (id: string) => useQuery({ queryKey: [...KEY, id], queryFn: () => api.get(id) });

export function useSaveCheckpointUser(id?: string) {
  const qc = useQueryClient();
  const router = useRouter();
  const toast = useToast();
  return useMutation({
    mutationFn: (b: CheckpointUserInput) => (id ? api.update(id, b) : api.create(b)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success(id ? "Staff member updated" : "Staff member added");
      router.push("/checkpoint-users");
    },
  });
}

/** Optimistic toggle: the switch flips instantly and rolls back if the server rejects it. */
export function useToggleUserStatus(params: ListParams) {
  const qc = useQueryClient();
  const toast = useToast();
  const key = [...KEY, "list", params];
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => api.setStatus(id, isActive),
    onMutate: async ({ id, isActive }) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<Paginated<CheckpointUser>>(key);
      qc.setQueryData<Paginated<CheckpointUser>>(key, (old) => old && { ...old, data: old.data.map((u) => (u.id === id ? { ...u, isActive } : u)) });
      return { prev };
    },
    onError: (e, _v, ctx) => { qc.setQueryData(key, ctx?.prev); toast.error(errorMessage(e)); },
    onSuccess: (_r, v) => toast.success(v.isActive ? "Staff member activated" : "Staff member deactivated"),
    onSettled: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteCheckpointUser() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: api.remove,
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEY }); toast.success("Staff member deleted"); },
    onError: (e) => toast.error(errorMessage(e)),
  });
}
