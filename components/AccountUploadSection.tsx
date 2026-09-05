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
      <div className="app-card h-64 animate-pulse rounded-2xl" />
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
        <p className="app-alert-ok mb-4 rounded-lg px-4 py-2.5 text-sm">
          Published successfully! Your content is on the home page and your profile.
        </p>
      )}
      <CreatorUploadForm userId={userId} existingContent={existingContent} />
    </>
  );
}
