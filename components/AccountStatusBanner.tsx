import type { Profile } from "@/lib/types/database";

type AccountStatusBannerProps = {
  profile: Profile;
};

export function AccountStatusBanner({ profile }: AccountStatusBannerProps) {
  if (profile.role === "creator" && profile.creator_status === "pending") {
    return (
      <div className="app-alert-warn mb-6 rounded-xl px-4 py-3 text-sm">
        <strong>Creator application pending.</strong> An admin will review your account. You can
        update your profile while you wait, but you won&apos;t appear as a creator until approved.
      </div>
    );
  }

  if (profile.role === "creator" && profile.creator_status === "approved") {
    return (
      <div className="app-alert-ok mb-6 rounded-xl px-4 py-3 text-sm">
        <strong>Creator account approved.</strong> Use the upload section below to publish photos
        and videos — they appear on the home page and your public profile.
      </div>
    );
  }

  if (profile.creator_status === "rejected") {
    return (
      <div className="app-alert-err mb-6 rounded-xl px-4 py-3 text-sm">
        Your creator application was not approved. You can submit again for review below — your
        photos and Wun.app username may still be on file.
      </div>
    );
  }

  return null;
}
