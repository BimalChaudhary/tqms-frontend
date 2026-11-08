import { formatKg, formatMoney, orDash } from "@/shared/lib/format";
import type { Receipt } from "../types";

/** Mirrors the paper receipt (bilingual header) so staff see exactly what will be printed. */
export type ReceiptView = Partial<Receipt> & { vehicleNumber?: string };

export function ReceiptPreview({ data, draft, cutFee = 50, onCutFeeChange }: {
  data: ReceiptView; draft?: boolean; cutFee?: number; onCutFeeChange?: (amount: number) => void;
}) {
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
        {row("रसिद नं:", data.receiptNo ?? "—")}
        {row("मिति:", orDash(data.date))}
        {row("समय:", orDash(data.time))}
        {row("तौलस्थान:", orDash(data.checkpoint))}
        {row("सवारी नं:", orDash(data.vehicleNumber))}
        {row("सामान:", orDash(data.load))}
        {row("विवरण:", orDash(data.narration))}
        {row("चालकको फोन नं:", orDash(data.driverPhone))}
        {row("तौल:", formatKg(data.weight))}
      </dl>
      <table className="w-full border-t border-line">
        <thead><tr className="text-left text-muted"><th className="py-1.5 font-medium">विवरण</th><th className="py-1.5 text-right font-medium">रकम (रु.)</th></tr></thead>
        <tbody>
          {data.charges?.length ? data.charges.map((c) => (
            <tr key={c.label}><td className="py-1">{c.label}</td><td className="py-1 text-right">{formatMoney(c.amount)}</td></tr>
          )) : draft ? <>
            <tr>
              <td className="border-t border-line py-2">काटा शुल्क</td>
              <td className="border-t border-line py-2 text-right">
                <select aria-label="काटा शुल्क रकम" className="control ml-auto w-28 py-1" value={cutFee} disabled={!onCutFeeChange}
                  onChange={(event) => onCutFeeChange?.(Number(event.target.value))}>
                  {[0, 50, 100].map((amount) => <option key={amount} value={amount}>{amount}</option>)}
                </select>
              </td>
            </tr>
            <tr className="font-semibold"><td className="py-2">जम्मा शुल्क</td><td className="py-2 text-right">{formatMoney(cutFee)}</td></tr>
          </> : <tr><td colSpan={2} className="py-1 text-muted">शुल्क उपलब्ध छैन</td></tr>}
        </tbody>
        {data.total !== undefined && <tfoot><tr className="border-t border-line font-semibold"><td className="py-1.5">जम्मा शुल्क</td><td className="py-1.5 text-right">{formatMoney(data.total)}</td></tr></tfoot>}
      </table>
    </article>
  );
}
