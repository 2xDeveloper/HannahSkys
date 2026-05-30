import { getContentPublicUrl } from "@/lib/content";
import { createClient } from "@/lib/supabase/server";
import type { CreatorContent } from "@/lib/types/content";
import { getPublicDisplayPath } from "@/lib/types/content";
import { ContentMediaThumb } from "./ContentMediaThumb";
type ContentGridProps = {
  items: CreatorContent[];
  emptyMessage?: string;
};

export async function ContentGrid({
  items,
  emptyMessage = "No content yet. Approved creators can upload photos and videos from their Account page.",
}: ContentGridProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="max-w-md text-center text-sm text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  const supabase = await createClient();

  return (
    <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 md:gap-4 md:p-6">
      {items.map((item) => (
        <ContentMediaThumb
          key={item.id}
          item={item}
          displayUrl={getContentPublicUrl(supabase, getPublicDisplayPath(item))}
        />
      ))}    </div>
  );
}
