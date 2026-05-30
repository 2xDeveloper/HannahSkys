import { CreatorAvatar } from "@/components/CreatorAvatar";
import { AppShell } from "@/components/AppShell";
import { ContentGrid } from "@/components/ContentGrid";
import { MessageForm } from "@/components/MessageForm";
import { getCreatorContent } from "@/lib/content";
import { getCreatorProfile } from "@/lib/messages";
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
  const joined = new Date(creator.created_at).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  return (
    <AppShell mainClassName="!overflow-y-auto">
      <div className="border-b border-bp-border px-4 py-3 md:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-bp-yellow hover:text-white"
        >
          ← Back to gallery
        </Link>
      </div>

      <div className="mx-auto max-w-6xl space-y-8 p-6 md:p-8">
        <header className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:gap-6 sm:text-left">
          <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full bg-bp-chip ring-2 ring-bp-border">
            <CreatorAvatar
              src={creator.avatar_url}
              name={creator.display_name ?? "Creator"}
              className="text-3xl"
            />
          </div>
          <div className="mt-4 sm:mt-0">
            <span className="rounded-full bg-bp-gold/20 px-3 py-0.5 text-xs font-semibold text-bp-yellow">
              Creator
            </span>
            <h1 className="mt-2 text-2xl font-bold text-rose-50 md:text-3xl">
              {creator.display_name ?? "Creator"}
            </h1>
            <p className="mt-1 text-sm text-gray-500">Member since {joined}</p>
            {isOwnProfile && (
              <p className="mt-3 text-sm text-bp-yellow">
                This is your public profile.{" "}
                <Link href="/account" className="underline hover:text-white">
                  Upload content
                </Link>
                {" · "}
                <Link href="/account/messages" className="underline hover:text-white">
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
          <h2 className="mb-4 text-lg font-semibold text-rose-50">
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
