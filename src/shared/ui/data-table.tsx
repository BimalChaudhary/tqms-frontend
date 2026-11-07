"use client";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import type { ReactNode } from "react";
import type { PageMeta, SortOrder } from "@/shared/api/types";
import { cn } from "@/shared/lib/cn";
import { Pagination } from "./pagination";
import { Skeleton } from "./skeleton";
import { EmptyState, ErrorState } from "./states";

export interface Column<T> {
  key: string; header: ReactNode; cell: (row: T, rowNumber: number) => ReactNode;
  sortable?: boolean; className?: string; srOnlyHeader?: boolean;
}

interface Props<T> {
  columns: Column<T>[]; rows?: T[]; rowKey: (row: T) => string; caption: string;
  loading?: boolean; error?: unknown; onRetry?: () => void;
  empty?: { title: string; hint?: string; action?: ReactNode };
  sort?: { key?: string; order: SortOrder }; onSort?: (key: string) => void;
  meta?: PageMeta; onPage?: (p: number) => void; onPageSize?: (n: number) => void;
  /** Dims rows while a background refetch (new page / filter) is running. */
  refreshing?: boolean;
}

/** Presentational table that owns all list states: loading skeleton, error + retry, empty, data. */
export function DataTable<T>({ columns, rows, rowKey, caption, loading, error, onRetry, empty, sort, onSort, meta, onPage, onPageSize, refreshing }: Props<T>) {
  const offset = meta ? (meta.page - 1) * meta.pageSize : 0;
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse">
          <caption className="sr-only">{caption}</caption>
          <thead className="border-b border-line bg-stone-50/70">
            <tr>
              {columns.map((c) => {
                const active = sort?.key === c.key;
                return (
                  <th key={c.key} scope="col" className={cn("th", c.className)}
                    aria-sort={c.sortable ? (active ? (sort!.order === "asc" ? "ascending" : "descending") : "none") : undefined}>
                    {c.sortable && onSort ? (
                      <button onClick={() => onSort(c.key)} className="inline-flex items-center gap-1 hover:text-ink">
                        {c.header}
                        {active ? (sort!.order === "asc" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />) : <ChevronsUpDown className="size-3 opacity-50" />}
                      </button>
                    ) : c.srOnlyHeader ? <span className="sr-only">{c.header}</span> : c.header}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className={cn("divide-y divide-line transition-opacity", refreshing && "opacity-60")}>
            {loading && Array.from({ length: 6 }).map((_, i) => (
              <tr key={i}>{columns.map((c) => <td key={c.key} className="td"><Skeleton className="h-4 w-full max-w-[160px]" /></td>)}</tr>
            ))}
            {!loading && !error && rows?.map((row, i) => (
              <tr key={rowKey(row)} className="hover:bg-stone-50/60">
                {columns.map((c) => <td key={c.key} className={cn("td", c.className)}>{c.cell(row, offset + i + 1)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!!error && <ErrorState error={error} onRetry={onRetry} />}
      {!loading && !error && rows?.length === 0 && <EmptyState title={empty?.title ?? "Nothing here yet"} hint={empty?.hint} action={empty?.action} />}
      {meta && onPage && !loading && !error && <div className="no-print"><Pagination meta={meta} onPage={onPage} onPageSize={onPageSize} /></div>}
    </div>
  );
}
