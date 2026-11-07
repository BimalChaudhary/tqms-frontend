import type { Metadata } from "next";
import { LoginForm } from "@/features/auth/components/login-form";
export const metadata: Metadata = { title: "Log in" };
export default function Page() {
  return (<>
    <h1 className="text-lg font-semibold">Log in</h1>
    <p className="mb-5 mt-1 text-sm text-muted">Use your checkpoint username and password.</p>
    <LoginForm />
  </>);
}
