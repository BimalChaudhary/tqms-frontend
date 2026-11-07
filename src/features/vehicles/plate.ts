import type { Option } from "@/shared/api/types";
import type { VehicleValues } from "./schemas";

/** Lookup labels carry their short code in brackets, e.g. "Bagmati (BA)" or "(JHA) Light vehicles". */
const code = (opts: Option[] | undefined, id: string) => {
  const label = opts?.find((o) => o.value === id)?.label ?? "";
  return label.match(/^\(([^)]+)\)/)?.[1] ?? label.match(/\(([^)]+)\)$/)?.[1] ?? label;
};

/** Live preview only — the backend returns the authoritative formatted plate number. */
export function previewPlate(v: Partial<VehicleValues>, lookups: { zonal?: Option[]; symbols?: Option[]; provinces?: Option[] }) {
  if (v.plateType === "embossed") return v.embossedNumber ?? "";
  const symbol = code(lookups.symbols, v.symbolId ?? "");
  if (v.plateType === "zonal") return [code(lookups.zonal, v.zonalCodeId ?? ""), v.lotNo, symbol, v.vehicleNumber].filter(Boolean).join("-");
  if (v.plateType === "provincial") {
    const n = code(lookups.provinces, v.provinceId ?? "").replace(/\D/g, "");
    return [n && `Province-${n}`, v.lotNo, symbol, v.vehicleNumber].filter(Boolean).join("-");
  }
  return "";
}
