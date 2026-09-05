import { AppShell } from "@/components/AppShell";
import { ContentGrid } from "@/components/ContentGrid";
import { FilterBar } from "@/components/FilterBar";
import { getAllCreatorContent } from "@/lib/content";

export const metadata = {
  title: "The Collection — HannahSkys",
  description: "Browse exclusive photos and videos from HannahSkys",
};

export default async function GalleryPage() {
  const items = await getAllCreatorContent();

  return (
    <AppShell>
      <FilterBar itemCount={items.length} />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <ContentGrid items={items} />
      </div>
    </AppShell>
  );
}
