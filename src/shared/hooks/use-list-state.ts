import { useCallback, useMemo, useState } from "react";
import type { ListParams, SortOrder } from "@/shared/api/types";

/** Owns search / filters / sort / pagination for any list screen. Pure UI state, no fetching. */
export function useListState<F extends Record<string, string>>(initialFilters: F, pageSize = 10) {
  const [state, set] = useState({
    page: 1, pageSize, q: "", sort: undefined as string | undefined, order: "asc" as SortOrder, filters: initialFilters,
  });

  const params = useMemo<ListParams>(
    () => ({ page: state.page, pageSize: state.pageSize, q: state.q, sort: state.sort, order: state.sort ? state.order : undefined, ...state.filters }),
    [state],
  );

  const setPage = useCallback((page: number) => set((s) => ({ ...s, page })), []);
  const setPageSize = useCallback((ps: number) => set((s) => ({ ...s, pageSize: ps, page: 1 })), []);
  const setQ = useCallback((q: string) => set((s) => (s.q === q ? s : { ...s, q, page: 1 })), []);
  const setFilter = useCallback(<K extends keyof F>(k: K, v: F[K]) =>
    set((s) => ({ ...s, filters: { ...s.filters, [k]: v }, page: 1 })), []);
  const toggleSort = useCallback((key: string) =>
    set((s) => ({ ...s, sort: key, order: s.sort === key && s.order === "asc" ? "desc" : "asc", page: 1 })), []);
  const reset = useCallback(() => set((s) => ({ ...s, q: "", page: 1, filters: initialFilters, sort: undefined })), [initialFilters]);

  return { state, params, setPage, setPageSize, setQ, setFilter, toggleSort, reset };
}
