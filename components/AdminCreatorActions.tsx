"use client";

import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types/database";
import { useRouter } from "next/navigation";
import { useState } from "react";

type AdminCreatorActionsProps = {
  profile: Profile;
};

export function AdminCreatorActions({ profile }: AdminCreatorActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function updateStatus(status: "approved" | "rejected") {
    setLoading(status === "approved" ? "approve" : "reject");
    setError(null);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        creator_status: status,
        role: status === "rejected" ? "user" : "creator",
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    setLoading(null);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.refresh();
  }

  if (profile.creator_status !== "pending") {
    return <span className="text-xs text-gray-500">—</span>;
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-2">
        <button
          type="button"
          disabled={loading !== null}
          onClick={() => updateStatus("approved")}
          className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600 disabled:opacity-60"
        >
          {loading === "approve" ? "…" : "Approve"}
        </button>
        <button
          type="button"
          disabled={loading !== null}
          onClick={() => updateStatus("rejected")}
          className="rounded-lg border border-red-900/60 px-3 py-1.5 text-xs font-medium text-red-300 hover:bg-red-950/40 disabled:opacity-60"
        >
          {loading === "reject" ? "…" : "Reject"}
        </button>
      </div>
      {error && <span className="text-[10px] text-red-400">{error}</span>}
    </div>
  );
}
