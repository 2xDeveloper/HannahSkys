"use client";

import type { Profile, CreatorStatus } from "@/lib/types/database";
import { useRouter } from "next/navigation";
import { useState } from "react";

async function setCreatorStatus(userId: string, status: CreatorStatus) {
  const res = await fetch("/api/admin/creator-status", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, status }),
  });

  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) {
    throw new Error(data.error ?? "Could not update creator status.");
  }
}

type AdminCreatorActionsProps = {
  profile: Profile;
};

export function AdminCreatorActions({ profile }: AdminCreatorActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function updateStatus(status: "approved" | "rejected") {
    setLoading(status === "approved" ? "approve" : "reject");
    setError(null);
    setSuccess(null);

    try {
      await setCreatorStatus(profile.id, status);
      setSuccess(status === "approved" ? "Approved" : "Rejected");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setLoading(null);
    }
  }

  if (profile.creator_status !== "pending") {
    return <span className="text-xs text-gray-500">—</span>;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          disabled={loading !== null}
          onClick={() => updateStatus("approved")}
          className="min-h-[44px] flex-1 touch-manipulation rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-600 active:bg-emerald-800 disabled:opacity-60"
        >
          {loading === "approve" ? "Approving…" : "Approve creator"}
        </button>
        <button
          type="button"
          disabled={loading !== null}
          onClick={() => updateStatus("rejected")}
          className="min-h-[44px] flex-1 touch-manipulation rounded-xl border border-red-900/60 px-4 py-3 text-sm font-semibold text-red-300 hover:bg-red-950/40 active:bg-red-950/60 disabled:opacity-60"
        >
          {loading === "reject" ? "Rejecting…" : "Reject"}
        </button>
      </div>
      {success && <span className="text-xs font-medium text-emerald-400">{success}</span>}
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}
