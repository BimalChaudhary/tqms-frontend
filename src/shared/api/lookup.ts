import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "./client";
import type { Option, Single } from "./types";

/** GET /lookup/:type — every dropdown in the app is served by this one endpoint. */
export type LookupType =
  | "provinces" | "districts" | "vehicle-types" | "plate-colors" | "plate-types" | "zonal-codes"
  | "symbols" | "stations" | "card-types" | "banks" | "insurance-companies" | "policy-types"
  | "goods" | "bill-numbers" | "vehicles" | "vehicle-owners" | "sanghs" | "entry-positions"
  | "other-vehicle-kinds" | "document-types" | "vehicle-numbers";

interface LookupOpts { parentId?: string; q?: string; enabled?: boolean }

export const fetchLookup = (type: LookupType, o: Omit<LookupOpts, "enabled"> = {}) =>
  apiFetch<Single<Option[]>>(`/lookup/${type}`, { params: { parentId: o.parentId, q: o.q } }).then((r) => r.data);

export function useLookup(type: LookupType | undefined, o: LookupOpts = {}) {
  return useQuery({
    queryKey: ["lookup", type, o.parentId ?? "", o.q ?? ""],
    queryFn: () => fetchLookup(type!, o),
    enabled: !!type && (o.enabled ?? true),
    staleTime: 5 * 60_000,
  });
}
