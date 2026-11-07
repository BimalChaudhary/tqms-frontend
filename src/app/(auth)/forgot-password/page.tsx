import type { Metadata } from "next";
import { ForgotForm } from "@/features/auth/components/forgot-form";
export const metadata: Metadata = { title: "Reset password" };
export default function Page() {
  return (<>
    <h1 className="text-lg font-semibold">Reset your password</h1>
    <p className="mb-5 mt-1 text-sm text-muted">Enter your account email and we’ll send a reset link.</p>
    <ForgotForm />
  </>);
}
