import { apiFetch } from "@/shared/api/client";
import type { Single } from "@/shared/api/types";
import type { ChangePasswordInput, CheckpointProfile, LoginInput } from "./types";

export const authApi = {
  login: (b: LoginInput) => apiFetch<Single<CheckpointProfile>>("/auth/login", { method: "POST", body: { ...b } }),
  logout: () => apiFetch<void>("/auth/logout", { method: "POST" }),
  me: () => apiFetch<Single<CheckpointProfile>>("/auth/me").then((r) => r.data),
  changePassword: (b: ChangePasswordInput) => apiFetch<void>("/auth/change-password", { method: "POST", body: { ...b } }),
  forgotPassword: (email: string) => apiFetch<void>("/auth/forgot-password", { method: "POST", body: { email } }),
};
