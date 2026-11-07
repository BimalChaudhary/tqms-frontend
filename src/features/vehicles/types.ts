export type PlateType = "embossed" | "provincial" | "zonal";

export interface VehicleSummary { id: string; plateNo: string; lotNo: string | null; vehicleNumber: string; vehicleType: string }

export interface VehicleFormData {
  sanghId: string; ownerId: string; vehicleTypeId: string; plateColorId: string; engineNumber: string; chassisNumber: string;
  companyName: string; modelNo: string; plateType: PlateType | ""; zonalCodeId: string; provinceId: string; symbolId: string;
  lotNo: string; vehicleNumber: string; embossedNumber: string;
}

export interface VehicleGeneral {
  engineNumber: string | null; chassisNumber: string | null; registrationDate: string | null; modelNo: string | null; plateType: string | null;
  companyName: string | null; tyres: number | null; ownerName: string | null; plateNo: string;
  category: string | null; vehicleType: string | null; capacityTons: number | null; insuranceCompany: string | null;
  policyType: string | null; policyNumber: string | null; policyExpiry: string | null;
}

export interface VehicleDetail {
  id: string; plateNo: string; sanghName: string | null; mobile: string | null; email: string | null;
  general: VehicleGeneral; form: VehicleFormData; labels: { sangh: string; owner: string };
}

/** Rows of the per-vehicle sub-resources. File fields come back as `<field>Url` and `<field>Name`. */
export type SubRecord = { id: string } & Record<string, string | number | boolean | null | undefined>;
export interface AuditLogEntry { id: string; at: string; user: string; action: string; detail: string }
