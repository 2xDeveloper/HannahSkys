"use client";

import type { CreatorContent } from "@/lib/types/content";
import dynamic from "next/dynamic";

type ContentWithUrl = CreatorContent & { display_url: string };

const CreatorUploadForm = dynamic(
  () =>
    import("@/components/CreatorUploadForm").then((mod) => mod.CreatorUploadForm),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 animate-pulse rounded-2xl border border-bp-border bg-bp-panel" />
    ),
  },
);

type AccountUploadSectionProps = {
  userId: string;
  existingContent: ContentWithUrl[];
  showPublishedMessage?: boolean;
};

export function AccountUploadSection({
  userId,
  existingContent,
  showPublishedMessage,
}: AccountUploadSectionProps) {
  return (
    <>
      {showPublishedMessage && (
        <p className="mb-4 rounded-lg border border-emerald-900/50 bg-emerald-950/30 px-4 py-2.5 text-sm text-emerald-300">
          Published successfully! Your content is on the home page and your profile.
        </p>
      )}
      <CreatorUploadForm userId={userId} existingContent={existingContent} />
    </>
  );
}
