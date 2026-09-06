import { CreatorAvatar } from "@/components/CreatorAvatar";
import { AppShell } from "@/components/AppShell";
import { ContentGrid } from "@/components/ContentGrid";
import { MessageForm } from "@/components/MessageForm";
import { getCreatorContent } from "@/lib/content";
import { getCreatorProfile } from "@/lib/messages";
import { isPubliclyListedCreator } from "@/lib/public-creators";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CreatorProfilePage({ params }: PageProps) {
  const { id } = await params;
  const creator = await getCreatorProfile(id);

  if (!creator) {
    notFound();
  }

  const content = await getCreatorContent(id);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let viewerProfile = null;
  if (user) {
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    viewerProfile = data;
  }

  const isOwnProfile = user?.id === creator.id;
  if (!isOwnProfile && !isPubliclyListedCreator(creator.display_name)) {
    notFound();
  }
  const joined = new Date(creator.created_at).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  return (
    <AppShell mainClassName="!overflow-y-auto">
      <div className="border-b border-[#fdeaf1] px-4 py-3 md:px-6">
        <Link
          href="/gallery"
          className="app-detail-back inline-flex items-center gap-2 rounded-full px-2 py-1 text-sm"
        >
          ← Back to the collection
        </Link>
      </div>

      <div className="mx-auto max-w-6xl space-y-8 p-6 md:p-8">
        <header className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:gap-6 sm:text-left">
          <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full bg-[#ffe6ef] ring-2 ring-[#fbdce7] shadow-[0_8px_24px_rgba(244,105,159,0.18)]">
            <CreatorAvatar
              src={creator.avatar_url}
              name={creator.display_name ?? "Creator"}
              className="text-3xl"
            />
          </div>
          <div className="mt-4 sm:mt-0">
            <span className="app-chip rounded-full px-3 py-0.5 text-xs font-semibold">
              Creator
            </span>
            <h1 className="app-heading font-display mt-2 text-2xl font-extrabold md:text-3xl">
              {creator.display_name ?? "Creator"}
            </h1>
            <p className="app-muted mt-1 text-sm">Member since {joined}</p>
            {isOwnProfile && (
              <p className="mt-3 text-sm text-[#f4699f]">
                This is your public profile.{" "}
                <Link href="/account" className="app-link underline">
                  Upload content
                </Link>
                {" · "}
                <Link href="/messages" className="app-link underline">
                  Inbox
                </Link>
              </p>
            )}
          </div>
        </header>

        {!isOwnProfile && (
          <MessageForm
            creatorId={creator.id}
            creatorName={creator.display_name ?? "Creator"}
            userId={user?.id}
            userEmail={user?.email}
            userDisplayName={viewerProfile?.display_name}
          />
        )}

        <section>
          <h2 className="app-heading font-display mb-4 text-xl font-extrabold">
            {isOwnProfile ? "Your content" : "Photos & videos"}
          </h2>
          <ContentGrid
            items={content}
            emptyMessage={
              isOwnProfile
                ? "You haven't uploaded anything yet. Go to Account to add photos or videos."
                : "This creator hasn't published any content yet."
            }
          />
        </section>
      </div>
    </AppShell>
  );
}
