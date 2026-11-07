export interface CheckpointUser {
  id: string; name: string; address: string | null; contact: string; email: string;
  provinceId: string; districtId: string; isActive: boolean;
}
export interface CheckpointUserInput {
  name: string; provinceId: string; districtId: string; address?: string; contact: string; email: string; isActive?: boolean;
}
