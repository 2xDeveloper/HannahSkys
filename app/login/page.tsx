import { AuthCard } from "@/components/AuthCard";
import { AuthForm } from "@/components/AuthForm";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <AuthCard title="Welcome back" subtitle="Log in to unlock the collection, library, and private messages">
      <Suspense fallback={<p className="text-sm text-gray-500">Loading…</p>}>
        <AuthForm mode="login" />
      </Suspense>
    </AuthCard>
  );
}
