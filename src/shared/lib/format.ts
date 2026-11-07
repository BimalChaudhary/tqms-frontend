import NepaliDate from "nepali-date-converter";

/** Display helpers. Dates remain ISO (yyyy-mm-dd) in storage and are converted to BS for display when needed. */
export const today = () => new Date().toISOString().slice(0, 10);

/** Convert an ISO Gregorian date to a Bikram Sambat date in YYYY-MM-DD format. */
export function formatBsDate(iso?: string | null) {
  if (!iso) return "—";
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return iso;
  const [, year, month, day] = match;
  const adDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), 6));
  const bs = new NepaliDate(adDate).getBS();
  return `${bs.year}-${String(bs.month + 1).padStart(2, "0")}-${String(bs.date).padStart(2, "0")}`;
}

export function formatDate(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export const formatKg = (n?: number | null) => (n == null ? "—" : `${n.toLocaleString("en-IN")} kg`);
export const formatMoney = (n?: number | null) => (n == null ? "—" : `Rs. ${n.toLocaleString("en-IN")}`);
export const orDash = (v?: string | number | null) => (v === undefined || v === null || v === "" ? "—" : String(v));

/** Builds the CSV text for an "Export Excel" action (opens natively in Excel). */
export function toCsv(headers: string[], rows: (string | number | null | undefined)[][]) {
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [headers, ...rows].map((r) => r.map(esc).join(",")).join("\r\n");
}

export function downloadBlob(content: BlobPart, filename: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = Object.assign(document.createElement("a"), { href: url, download: filename });
  a.click();
  URL.revokeObjectURL(url);
}
