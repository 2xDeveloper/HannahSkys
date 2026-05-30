import type { Profile } from "@/lib/types/database";

type AccountStatusBannerProps = {
  profile: Profile;
};

export function AccountStatusBanner({ profile }: AccountStatusBannerProps) {
  if (profile.role === "creator" && profile.creator_status === "pending") {
    return (
      <div className="mb-6 rounded-xl border border-amber-900/50 bg-amber-950/30 px-4 py-3 text-sm text-amber-200">
        <strong>Creator application pending.</strong> An admin will review your account. You can
        update your profile while you wait, but you won&apos;t appear as a creator until approved.
      </div>
    );
  }

  if (profile.role === "creator" && profile.creator_status === "approved") {
    return (
      <div className="mb-6 rounded-xl border border-emerald-900/40 bg-emerald-950/20 px-4 py-3 text-sm text-emerald-200">
        <strong>Creator account approved.</strong> Use the upload section below to publish photos
        and videos — they appear on the home page and your public profile.
      </div>
    );
  }

  if (profile.creator_status === "rejected") {
    return (
      <div className="mb-6 rounded-xl border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-200">
        Your creator application was not approved. You can still browse and purchase as a regular
        user.
      </div>
    );
  }

  return null;
}
