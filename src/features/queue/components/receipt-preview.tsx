import { formatKg, formatMoney, orDash } from "@/shared/lib/format";
import type { Receipt } from "../types";

/** Mirrors the paper receipt (bilingual header) so staff see exactly what will be printed. */
export type ReceiptView = Partial<Receipt> & { vehicleNumber?: string };

export function ReceiptPreview({ data, draft }: { data: ReceiptView; draft?: boolean }) {
  const row = (k: string, v: React.ReactNode) => (
    <div className="flex justify-between gap-3 py-1"><dt className="text-muted">{k}</dt><dd className="text-right font-medium">{v}</dd></div>
  );
  return (
    <article aria-label="Receipt preview" className="rounded-lg border border-dashed border-stone-300 bg-white p-4 text-xs print:border-0">
      <header className="border-b border-line pb-3 text-center">
        <p lang="ne" className="text-sm font-semibold">नेपाल ट्रक यातायात व्यवसायी महासंघ</p>
        <p className="mt-0.5 text-muted">{orDash(data.sangh)}</p>
        {draft && <p className="mt-1 text-[11px] text-warn">Preview — receipt number is assigned when you save</p>}
      </header>
      <dl className="py-2">
        {row("Receipt no.", data.receiptNo ?? "—")}
        {row("Date", orDash(data.date))}
        {row("Time", orDash(data.time))}
        {row("Checkpoint", orDash(data.checkpoint))}
        {row("Vehicle no.", orDash(data.vehicleNumber))}
        {row("Load", orDash(data.load))}
        {row("Narration", orDash(data.narration))}
        {row("Weight", formatKg(data.weight))}
      </dl>
      <table className="w-full border-t border-line">
        <thead><tr className="text-left text-muted"><th className="py-1.5 font-medium">Description</th><th className="py-1.5 text-right font-medium">Amount</th></tr></thead>
        <tbody>
          {data.charges?.length ? data.charges.map((c) => (
            <tr key={c.label}><td className="py-1">{c.label}</td><td className="py-1 text-right">{formatMoney(c.amount)}</td></tr>
          )) : <tr><td colSpan={2} className="py-1 text-muted">Charges are calculated on save</td></tr>}
        </tbody>
        {data.total !== undefined && <tfoot><tr className="border-t border-line font-semibold"><td className="py-1.5">Total</td><td className="py-1.5 text-right">{formatMoney(data.total)}</td></tr></tfoot>}
      </table>
    </article>
  );
}
