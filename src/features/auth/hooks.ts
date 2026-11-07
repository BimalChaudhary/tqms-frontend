"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useToast } from "@/shared/ui/toast";
import { authApi } from "./api";

export const SESSION_KEY = ["session"] as const;

export const useSession = () =>
  useQuery({ queryKey: SESSION_KEY, queryFn: authApi.me, retry: false, staleTime: 5 * 60_000 });

export function useLogin() {
  const qc = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (res) => { qc.setQueryData(SESSION_KEY, res.data); router.replace("/dashboard"); },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => { qc.clear(); router.replace("/login"); },
  });
}

export function useChangePassword() {
  const toast = useToast();
  return useMutation({ mutationFn: authApi.changePassword, onSuccess: () => toast.success("Password changed") });
}

export function useForgotPassword() {
  return useMutation({ mutationFn: authApi.forgotPassword });
}
