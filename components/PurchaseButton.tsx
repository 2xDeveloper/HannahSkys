"use client";

import type { CreatorContent } from "@/lib/types/content";
import { formatContentPrice } from "@/lib/types/content";
import Link from "next/link";
import { useState } from "react";

type PurchaseButtonProps = {
  item: CreatorContent;
  owned?: boolean;
};

export function PurchaseButton({ item, owned = false }: PurchaseButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const priceLabel = formatContentPrice(item.price_cents);

  const label =
    item.media_type === "video"
      ? `Purchase full video — ${priceLabel}`
      : `Purchase full photo — ${priceLabel}`;

  async function handlePurchase() {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentId: item.id }),
      });

      const data = (await res.json()) as { url?: string; error?: string };

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

  if (owned) {
    return (
      <Link
        href="/library"
        className="block w-full rounded-full bg-emerald-600 px-6 py-4 text-center text-sm font-semibold text-white transition-all hover:bg-emerald-500"
      >
        In your library — view full {item.media_type}
      </Link>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={handlePurchase}
        disabled={loading}
        className="landing-btn-primary landing-btn-lg landing-btn-block mt-0 disabled:cursor-wait disabled:opacity-70"
      >
        {loading ? "Redirecting to checkout…" : label}
      </button>
      {error && <p className="mt-3 text-center text-xs text-red-500">{error}</p>}
    </div>
  );
}
