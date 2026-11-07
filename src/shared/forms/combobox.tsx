"use client";
import { useMemo, useState } from "react";
import Select from "react-select";
import { useLookup, type LookupType } from "@/shared/api/lookup";
import type { Option } from "@/shared/api/types";
import { useDebounce } from "@/shared/hooks/use-debounce";
import { selectStyles } from "./select-styles";

/** Searchable dropdown backed by the cached lookup query. */
export function Combobox({ id, value, onChange, lookup, minChars = 2, placeholder = "Search…", initialLabel = "", invalid, describedBy, disabled }: {
  id: string; value: string; onChange: (value: string, option?: Option) => void; lookup: LookupType; minChars?: number;
  placeholder?: string; initialLabel?: string; invalid?: boolean; describedBy?: string; disabled?: boolean;
}) {
  const [input, setInput] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [picked, setPicked] = useState<Option | null>(null);
  const query = useDebounce(input.trim(), 250);
  const ready = query.length >= minChars;
  const { data = [], isFetching, isError } = useLookup(lookup, { q: query, enabled: menuOpen && ready });
  const selected = useMemo(
    () => data.find((option) => option.value === value)
      ?? (picked?.value === value ? picked : null)
      ?? (value && initialLabel ? { value, label: initialLabel } : null),
    [data, value, initialLabel, picked],
  );

  return (
    <Select<Option, false>
      inputId={id}
      value={selected}
      options={ready ? data : []}
      inputValue={input}
      onInputChange={(next, action) => {
        if (action.action === "input-change") setInput(next);
        return next;
      }}
      onChange={(option) => {
        setInput("");
        setPicked(option);
        onChange(option?.value ?? "", option ?? undefined);
      }}
      onMenuOpen={() => setMenuOpen(true)}
      onMenuClose={() => setMenuOpen(false)}
      onBlur={() => setMenuOpen(false)}
      onFocus={() => setMenuOpen(true)}
      isDisabled={disabled}
      isSearchable
      isClearable
      isLoading={isFetching}
      filterOption={null}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      placeholder={selected ? "" : placeholder}
      noOptionsMessage={() => isError ? "Search failed. Keep typing to retry." : ready ? "No matches" : `Type ${minChars} or more characters to search`}
      loadingMessage={() => "Searching…"}
      classNamePrefix="react-select"
      styles={selectStyles}
    />
  );
}
