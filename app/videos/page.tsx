import { AppShell } from "@/components/AppShell";
import { PremadeVideosBrowser } from "@/components/PremadeVideosBrowser";
import { getAllCreatorContent, getContentPublicUrl } from "@/lib/content";
import { createClient } from "@/lib/supabase/server";
import { getPublicDisplayPath } from "@/lib/types/content";

export const metadata = {
  title: "Premade Videos — HannahSkys",
  description: "Browse premade videos by category",
};

export default async function PremadeVideosPage() {
  const items = await getAllCreatorContent();
  const supabase = await createClient();
  const videos = items
    .filter((item) => item.media_type === "video")
    .map((item) => ({
      item,
      displayUrl: getContentPublicUrl(supabase, getPublicDisplayPath(item)),
    }));

  return (
    <AppShell>
      <PremadeVideosBrowser items={videos} />
    </AppShell>
  );
}
