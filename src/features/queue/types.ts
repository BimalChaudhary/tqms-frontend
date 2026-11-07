export type QueueStatus = "in_job" | "in_queue" | "unregistered" | "payment_pending";
export type VehicleKind = "registered" | "unregistered" | "indian";

export interface QueueSummary {
  id: string; queueNumber: string; vehicleNumber: string; vehicleType: string; cardType: string | null;
  lastCheckpoint: string | null; status: QueueStatus;
}

/** An unregistered vehicle that entered through the QR flow and awaits staff approval. */
export interface PendingQueue { id: string; vehicleNumber: string; route: string; entryDate: string }
export interface PendingQueueDetail extends PendingQueue { material: string | null; remarks: string | null; driverPhone: string | null }

export interface QueueEntry {
  id: string; entryDate: string; from: string; to: string;
  weights: { cp1: number | null; cp2: number | null; cp3: number | null }; billNo: string | null;
}

export interface QueueDetail {
  id: string; queueNumber: string; vehicleNumber: string; status: QueueStatus; cardNumber: string | null; cardType: string | null;
  vehicleType: string; owner: string | null; isRegistered: boolean; sangh: string | null; lastCheckpoint: string | null;
  route: string | null; transportCompany: string | null; loadDetails: string | null; checkpointWeight: number | null;
  entryDate: string; entries: QueueEntry[];
}

export interface CreateQueueInput {
  kind: VehicleKind; vehicleId?: string; vehicleNumber?: string; vehicleTypeId?: string; from: string; to: string;
  grossWeight: number; transportCompany?: string; loadDetails: string; narration?: string;
}
export interface CheckInInput { grossWeight: number }
export interface ApprovePendingInput {
  matchedVehicleId?: string; from: string; to: string; entryPosition: string; grossWeight: number;
  material: string; remarks?: string; driverPhone?: string;
}

export interface Receipt {
  receiptNo: string; date: string; time: string; sangh: string; checkpoint: string; vehicleNumber: string;
  load: string | null; narration: string | null; weight: number | null; charges: { label: string; amount: number }[]; total: number;
}

export interface QueueFilters { status: "all" | QueueStatus; vehicleId?: string; cardType?: string; vehicleType?: string }
