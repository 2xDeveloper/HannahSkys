"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ReapplyCreatorReview() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function reapply() {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("reapply_creator_review");

    setLoading(false);

    if (rpcError) {
      setError(rpcError.message);
      return;
    }

    router.refresh();
  }

  return (
    <div className="rounded-xl border border-amber-900/50 bg-amber-950/20 px-4 py-3 text-sm text-amber-200">
      <p>
        Your previous application was not approved. You can submit again for admin review — your
        uploaded photos and Wun.app username are still on file.
      </p>
      <button
        type="button"
        disabled={loading}
        onClick={reapply}
        className="mt-3 rounded-lg bg-bp-gold px-4 py-2 text-xs font-semibold text-white hover:bg-bp-gold-dim disabled:opacity-60"
      >
        {loading ? "Submitting…" : "Submit for review again"}
      </button>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}
