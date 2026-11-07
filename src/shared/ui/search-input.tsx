"use client";
import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useDebounce } from "@/shared/hooks/use-debounce";

/** Debounced search box. Emits the trimmed value after the user pauses typing. */
export function SearchInput({ value, onChange, placeholder = "Search…", label = "Search" }: {
  value: string; onChange: (v: string) => void; placeholder?: string; label?: string;
}) {
  const [local, setLocal] = useState(value);
  const debounced = useDebounce(local, 350);
  useEffect(() => { onChange(debounced.trim()); }, [debounced]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { setLocal(value); }, [value]);
  return (
    <div className="relative w-full sm:w-72">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-400" aria-hidden />
      <input type="search" aria-label={label} className="control !pl-9 !pr-8" placeholder={placeholder} value={local} onChange={(e) => setLocal(e.target.value)} />
      {local && (
        <button type="button" aria-label="Clear search" onClick={() => setLocal("")} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-stone-400 hover:text-ink">
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}
