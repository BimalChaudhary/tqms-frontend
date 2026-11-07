export interface OwnerSummary {
  id: string; name: string; email: string | null; address: string; phone: string; linkedOwner: string | null;
  isAssigned: boolean; isVerified: boolean;
}
export interface OwnerFormData {
  name: string; provinceId: string; districtId: string; localLevel: string; streetAddress: string; email: string; panNumber: string;
  phone: string; isIndividual: boolean; contactName: string; contactEmail: string; contactNumber: string; registrationNumber: string; citizenshipNumber: string;
}
export interface OwnerDetail extends Omit<OwnerSummary, "address"> {
  form: OwnerFormData; province: string; district: string; address: string;
  /** File names currently stored (shown as "Current file" when editing). */
  files: { logo?: string; registrationDocument?: string; citizenshipFront?: string; citizenshipBack?: string };
}
export interface OwnerBank { id: string; bankId: string; bank: string; branch: string; accountHolder: string; accountNumber: string; chequeUrl: string | null; isCurrent: boolean }
export interface OwnerVehicle { id: string; vehicleId: string; name: string; type: string; plateNo: string }
