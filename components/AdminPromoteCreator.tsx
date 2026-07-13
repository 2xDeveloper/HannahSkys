"use client";

import type { Profile } from "@/lib/types/database";
import { useRouter } from "next/navigation";
import { useState } from "react";

async function setCreatorStatus(userId: string, status: "pending") {
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

type AdminPromoteCreatorProps = {
  profile: Profile;
};

export function AdminPromoteCreator({ profile }: AdminPromoteCreatorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function promote() {
    setLoading(true);
    setError(null);

    try {
      await setCreatorStatus(profile.id, "pending");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        disabled={loading}
        onClick={promote}
        className="min-h-[44px] w-full touch-manipulation rounded-xl bg-amber-700 px-4 py-3 text-sm font-semibold text-white hover:bg-amber-600 active:bg-amber-800 disabled:opacity-60 sm:w-auto"
      >
        {loading ? "Moving…" : "Move to pending creators"}
      </button>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}
