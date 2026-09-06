"use client";

import {
  creatorApplicationComplete,
  normalizeWunUsername,
} from "@/lib/creator-application";
import { ReapplyCreatorReview } from "@/components/ReapplyCreatorReview";
import { submitCreatorApplication } from "@/lib/submit-creator-application";
import type { Profile } from "@/lib/types/database";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

type CompleteCreatorApplicationProps = {
  profile: Profile;
  userId: string;
};

export function CompleteCreatorApplication({
  profile,
}: CompleteCreatorApplicationProps) {
  const router = useRouter();
  const avatarRef = useRef<HTMLInputElement>(null);

  const [wunUsername, setWunUsername] = useState(profile.instagram_handle ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (creatorApplicationComplete(profile)) {
    if (profile.creator_status === "rejected") {
      return <ReapplyCreatorReview />;
    }

    return (
      <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/20 px-4 py-3 text-sm text-emerald-200">
        Your creator application is complete and pending admin review.
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const avatarFile = avatarRef.current?.files?.[0];
    const username = normalizeWunUsername(wunUsername);

    if (!username) {
      setError("Wun.app username is required.");
      return;
    }
    if (!avatarFile && !profile.avatar_url) {
      setError("Profile photo is required.");
      return;
    }

    setLoading(true);

    try {
      await submitCreatorApplication(username, avatarFile ?? null, null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-amber-900/50 bg-amber-950/20 p-6 space-y-4"
    >
      <div>
        <h2 className="text-lg font-semibold text-amber-100">Complete creator application</h2>
        <p className="mt-1 text-sm text-gray-400">
          Upload your profile photo and Wun.app username so an admin can review your account.
        </p>
      </div>

      <div>
        <label htmlFor="wun-username" className="mb-1.5 block text-xs font-medium text-gray-400">
          Wun.app username
        </label>
        <div className="flex items-center rounded-lg border border-[#fbdce7] bg-white">
          <span className="pl-3 text-sm text-gray-500">wun.app/</span>
          <input
            id="wun-username"
            required
            value={wunUsername}
            onChange={(e) => setWunUsername(e.target.value)}
            className="w-full bg-transparent px-2 py-2.5 text-sm text-[#4a4550] focus:outline-none"
            placeholder="yourname"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-gray-400">
          Profile photo
        </label>
        <input
          ref={avatarRef}
          type="file"
          accept="image/*"
          required={!profile.avatar_url}
          className="app-muted w-full text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-[#ffe6ef] file:px-3 file:py-2 file:text-sm file:text-[#ef4f8f]"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="landing-btn-primary disabled:opacity-60"
      >
        {loading ? "Uploading…" : "Submit application"}
      </button>
    </form>
  );
}
