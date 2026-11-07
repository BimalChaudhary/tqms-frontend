import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PageMeta } from "@/shared/api/types";
import { Button } from "./button";

export function Pagination({ meta, onPage, onPageSize }: { meta: PageMeta; onPage: (p: number) => void; onPageSize?: (n: number) => void }) {
  if (meta.total === 0) return null;
  const from = (meta.page - 1) * meta.pageSize + 1;
  const to = Math.min(meta.page * meta.pageSize, meta.total);
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3 text-sm text-muted">
      <p>Showing {from}–{to} of {meta.total}</p>
      <div className="flex items-center gap-3">
        {onPageSize && (
          <label className="flex items-center gap-2">
            Rows
            <select className="control !w-auto !py-1" value={meta.pageSize} onChange={(e) => onPageSize(Number(e.target.value))}>
              {[10, 20, 50].map((n) => <option key={n}>{n}</option>)}
            </select>
          </label>
        )}
        <nav aria-label="Pagination" className="flex items-center gap-1">
          <Button variant="secondary" size="sm" onClick={() => onPage(meta.page - 1)} disabled={meta.page <= 1} aria-label="Previous page"><ChevronLeft className="size-4" /></Button>
          <span className="px-2 tabular-nums">Page {meta.page} of {meta.totalPages}</span>
          <Button variant="secondary" size="sm" onClick={() => onPage(meta.page + 1)} disabled={meta.page >= meta.totalPages} aria-label="Next page"><ChevronRight className="size-4" /></Button>
        </nav>
      </div>
    </div>
  );
}
