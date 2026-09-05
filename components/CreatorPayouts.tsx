"use client";

import type { SaleRow, SalesSummary } from "@/lib/sales";
import { formatUsd } from "@/lib/format-money";
import { getPlatformFeePercent } from "@/lib/stripe";
import { useState } from "react";

type CreatorPayoutsProps = {
  initialReady: boolean;
  initialChargesEnabled: boolean;
  initialPayoutsEnabled: boolean;
  hasAccount: boolean;
  sales: SaleRow[];
  summary: SalesSummary;
  connectQuery?: string | null;
};

export function CreatorPayouts({
  initialReady,
  initialChargesEnabled,
  initialPayoutsEnabled,
  hasAccount,
  sales,
  summary,
  connectQuery,
}: CreatorPayoutsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ready = initialReady;

  async function startStripeSetup() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/connect/onboard", { method: "POST" });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? "Could not start Stripe setup.");
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
    <div className="mt-6 space-y-6">
      <section className="app-card rounded-2xl p-5 md:p-6">
        <h2 className="app-heading text-lg font-semibold">Payouts (Stripe)</h2>
        <p className="mt-1 text-sm text-gray-500">
          Connect Stripe to receive your share when fans purchase your content. The platform keeps
          a {getPlatformFeePercent()}% fee; the rest goes to your Stripe account automatically.
        </p>

        {connectQuery === "complete" && ready && (
          <p className="mt-3 rounded-lg border border-emerald-900/50 bg-emerald-950/30 px-3 py-2 text-sm text-emerald-300">
            Stripe connected — you can receive payouts from sales.
          </p>
        )}
        {connectQuery === "refresh" && (
          <p className="mt-3 rounded-lg border border-amber-900/50 bg-amber-950/30 px-3 py-2 text-sm text-amber-200">
            Stripe setup was interrupted. Click below to continue.
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              ready
                ? "bg-emerald-800 text-white"
                : hasAccount
                  ? "bg-amber-900/60 text-amber-100"
                  : "bg-[#ffe6ef] text-[#8a8390]"
            }`}
          >
            {ready
              ? "Payouts active"
              : hasAccount
                ? "Setup incomplete"
                : "Not connected"}
          </span>
          {hasAccount && !ready && (
            <span className="text-xs text-gray-500">
              Charges: {initialChargesEnabled ? "on" : "off"} · Payouts:{" "}
              {initialPayoutsEnabled ? "on" : "off"}
            </span>
          )}
        </div>

        {!ready && (
          <button
            type="button"
            onClick={startStripeSetup}
            disabled={loading}
            className="landing-btn-primary mt-4 disabled:opacity-60"
          >
            {loading
              ? "Redirecting to Stripe…"
              : hasAccount
                ? "Continue Stripe setup"
                : "Connect Stripe for payouts"}
          </button>
        )}

        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

        {!ready && (
          <p className="mt-4 text-xs leading-relaxed text-gray-600">
            Fans cannot purchase your paid content until Stripe is connected. Collect content is
            unaffected.
          </p>
        )}
      </section>

      <section className="app-card rounded-2xl p-5 md:p-6">
        <h2 className="app-heading text-lg font-semibold">Your sales</h2>
        <p className="mt-1 text-sm text-gray-500">Completed purchases of your content.</p>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat label="Total sales" value={formatUsd(summary.totalSalesCents)} />
          <Stat label="Your earnings" value={formatUsd(summary.creatorPayoutsCents)} highlight />
          <Stat label="Platform fee" value={formatUsd(summary.platformFeesCents)} />
        </div>
        <p className="mt-2 text-xs text-gray-600">{summary.saleCount} sale(s)</p>

        {sales.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500">No sales yet.</p>
        ) : (
          <ul className="mt-4 max-h-64 space-y-2 overflow-y-auto">
            {sales.map((sale) => (
              <li
                key={sale.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#fbdce7] bg-[#fff7fa] px-3 py-2 text-xs"
              >
                <div>
                  <p className="app-heading font-medium">{sale.content_title}</p>
                  <p className="text-gray-500">
                    Buyer: {sale.buyer_name ?? "Fan"} ·{" "}
                    {new Date(sale.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-emerald-400">
                    +{formatUsd(sale.creator_payout_cents)}
                  </p>
                  <p className="text-gray-600">of {formatUsd(sale.amount_cents)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-[#fbdce7] bg-[#fff7fa] px-3 py-3">
      <p className="text-[10px] uppercase tracking-wider text-gray-500">{label}</p>
      <p className={`mt-1 text-lg font-bold ${highlight ? "text-emerald-600" : "text-[#3f3a44]"}`}>
        {value}
      </p>
    </div>
  );
}
