import { AuthCard } from "@/components/AuthCard";
import { AuthForm } from "@/components/AuthForm";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <AuthCard title="Log in" subtitle="Access your account and profile">
      <Suspense fallback={<p className="text-sm text-gray-500">Loading…</p>}>
        <AuthForm mode="login" />
      </Suspense>
    </AuthCard>
  );
}
