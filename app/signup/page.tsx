import { AuthCard } from "@/components/AuthCard";
import { AuthForm } from "@/components/AuthForm";
import { Suspense } from "react";

export default function SignupPage() {
  return (
    <AuthCard title="Join HannahSkys" subtitle="Fans collect photos & films. Creators need a quick approval.">
      <Suspense fallback={<p className="text-sm text-gray-500">Loading…</p>}>
        <AuthForm mode="signup" />
      </Suspense>
    </AuthCard>
  );
}
