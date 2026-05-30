import { CreatorAvatar } from "@/components/CreatorAvatar";
import { AdminCreatorActions } from "@/components/AdminCreatorActions";
import type { Profile } from "@/lib/types/database";
import Link from "next/link";

type PendingCreatorCardProps = {
  profile: Profile;
  hideAdminActions?: boolean;
};

export function PendingCreatorCard({ profile, hideAdminActions }: PendingCreatorCardProps) {
  const ig = profile.instagram_handle?.replace(/^@/, "");
  const instagramUrl = ig ? `https://instagram.com/${ig}` : null;
  const hasId = Boolean(profile.id_document_path);
  const hasPhoto = Boolean(profile.avatar_url);

  return (
    <article className="rounded-xl border border-bp-border bg-bp-panel p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-bp-chip ring-2 ring-bp-border">
          <CreatorAvatar
            src={profile.avatar_url}
            name={profile.display_name ?? "Creator"}
          />
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <h3 className="text-lg font-semibold text-white">
            {profile.display_name ?? "Unnamed creator"}
          </h3>
          <p className="text-xs text-gray-500">
            Applied {new Date(profile.created_at).toLocaleString()}
          </p>

          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-gray-500">Instagram</dt>
              <dd className="text-bp-yellow">
                {instagramUrl ? (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white"
                  >
                    @{ig}
                  </a>
                ) : (
                  <span className="text-red-400">Not provided</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Profile photo</dt>
              <dd className={hasPhoto ? "text-emerald-400" : "text-red-400"}>
                {hasPhoto ? "Uploaded" : "Missing"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">ID verification</dt>
              <dd>
                {hasId ? (
                  <a
                    href={`/api/admin/id-document?userId=${profile.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-bp-yellow hover:text-white"
                  >
                    View ID photo →
                  </a>
                ) : (
                  <span className="text-red-400">Missing</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Public profile</dt>
              <dd>
                <Link
                  href={`/creator/${profile.id}`}
                  className="text-bp-yellow hover:text-white"
                >
                  Preview →
                </Link>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {!hideAdminActions && (
        <div className="mt-4 border-t border-bp-border pt-4">
          <AdminCreatorActions profile={profile} />
        </div>
      )}
    </article>
  );
}
