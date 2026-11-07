export interface CheckpointProfile {
  id: string; name: string; sthaniyaSangh: string; email: string; checkpointType: string;
  province: string; district: string; region: string; geoLocation: string | null; status: "active" | "inactive";
}
export interface LoginInput { email: string; password: string; remember: boolean }
export interface ChangePasswordInput { currentPassword: string; newPassword: string; confirmPassword: string }
