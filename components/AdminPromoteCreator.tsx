"use client";

import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types/database";
import { useRouter } from "next/navigation";
import { useState } from "react";

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

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        role: "creator",
        creator_status: "pending",
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        disabled={loading}
        onClick={promote}
        className="rounded-lg bg-amber-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-600 disabled:opacity-60"
      >
        {loading ? "…" : "Move to pending creators"}
      </button>
      {error && <span className="text-[10px] text-red-400">{error}</span>}
    </div>
  );
}
