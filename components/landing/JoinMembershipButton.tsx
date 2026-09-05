"use client";

import type { MembershipPlanId } from "@/lib/memberships";
import { useState } from "react";

type JoinMembershipButtonProps = {
  planId: MembershipPlanId;
  label?: string;
  className?: string;
};

export function JoinMembershipButton({
  planId,
  label = "Join Now",
  className = "landing-btn-primary landing-btn-block",
}: JoinMembershipButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout() {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/checkout/membership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });

      const data = (await res.json()) as {
        url?: string;
        error?: string;
        loginRequired?: boolean;
      };

      if (data.loginRequired) {
        window.location.assign(`/login?next=${encodeURIComponent("/#membership")}`);
        return;
      }

      if (!res.ok || !data.url) {
        setError(data.error ?? "Checkout failed.");
        setLoading(false);
        return;
      }

      window.location.assign(data.url);
    } catch {
      setError("Network error. Try again.");
      setLoading(false);
    }
  }

  return (
    <>
      <button type="button" onClick={startCheckout} disabled={loading} className={className}>
        {loading ? "Redirecting…" : label}
      </button>
      {error && <p className="landing-plan-error">{error}</p>}
    </>
  );
}
