import { usePathname, useRouter, useSearchParams } from "next/navigation";

/** Keeps the active tab in the URL (?tab=…) so reload, back and shared links land on the same tab. */
export function useTabParam(valid: string[], fallback: string, param = "tab") {
  const router = useRouter(); const path = usePathname(); const sp = useSearchParams();
  const raw = sp.get(param);
  const value = raw && valid.includes(raw) ? raw : fallback;
  const set = (id: string) => {
    const next = new URLSearchParams(sp.toString());
    if (id === fallback) next.delete(param); else next.set(param, id);
    const qs = next.toString();
    router.replace(qs ? `${path}?${qs}` : path, { scroll: false });
  };
  return [value, set] as const;
}
