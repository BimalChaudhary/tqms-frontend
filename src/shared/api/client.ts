import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import type { ApiErrorBody } from "./types";

/** Single HTTP entry point. Feature code never builds URLs or calls Axios directly. */
const client = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api",
  withCredentials: true,
  paramsSerializer: {
    serialize: (params) => {
      const search = new URLSearchParams();
      Object.entries(params as Record<string, unknown>).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          search.set(key, String(value));
        }
      });
      return search.toString();
    },
  },
});

export class ApiError extends Error {
  constructor(public status: number, message: string, public fieldErrors?: Record<string, string>) {
    super(message);
    this.name = "ApiError";
  }
}

type Query = Record<string, string | number | boolean | undefined | null>;
interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  params?: Query;
  /** Plain object. Sent as JSON, or as multipart when it contains a File. */
  body?: Record<string, unknown>;
  signal?: AbortSignal;
}

function encodeBody(body?: Record<string, unknown>): Record<string, unknown> | FormData | undefined {
  if (!body) return undefined;
  const hasFile = Object.values(body).some((value) => typeof File !== "undefined" && value instanceof File);
  if (!hasFile) return body;

  const formData = new FormData();
  Object.entries(body).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (typeof File !== "undefined" && value instanceof File) formData.append(key, value);
    else formData.append(key, String(value));
  });
  return formData;
}

export async function apiFetch<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const config: AxiosRequestConfig = {
    url: path,
    method: opts.method ?? "GET",
    params: opts.params,
    data: encodeBody(opts.body),
    signal: opts.signal,
  };

  try {
    const response = await client.request<T>(config);
    return response.status === 204 ? (undefined as T) : response.data;
  } catch (error) {
    if (axios.isCancel(error)) throw error;
    if (error instanceof AxiosError) {
      const response = error.response;
      const payload = (response?.data ?? {}) as Partial<ApiErrorBody>;
      if (!response) {
        throw new ApiError(0, "Can't reach the server. Check your connection and try again.");
      }
      throw new ApiError(
        response.status,
        payload.message ?? `Request failed (${response.status})`,
        payload.errors,
      );
    }
    throw error;
  }
}

export const errorMessage = (e: unknown) =>
  e instanceof Error ? e.message : "Something went wrong. Please try again.";
