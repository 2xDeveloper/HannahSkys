import { AppShell } from "@/components/AppShell";
import { ContentMediaThumb } from "@/components/ContentMediaThumb";
import { getContentPublicUrl } from "@/lib/content";
import { getUserLibrary } from "@/lib/purchases";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function LibraryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/library");
  }

  const items = await getUserLibrary(user.id);

  return (
    <AppShell>
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-bp-main">
        <div className="border-b border-bp-border px-4 py-6 md:px-8">
          <h1 className="text-2xl font-bold text-rose-50">My library</h1>
          <p className="mt-1 text-sm text-gray-400">
            Content you purchased — full files unlocked here and on each item page.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
            <p className="max-w-md text-center text-sm text-gray-500">
              No purchases yet. Browse the gallery and unlock paid photos or videos.
            </p>
            <Link
              href="/"
              className="rounded-xl bg-bp-gold px-5 py-2.5 text-sm font-semibold text-white hover:bg-bp-gold-dim"
            >
              Browse gallery
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 md:gap-4 md:p-6">
            {items.map((item) => (
              <ContentMediaThumb
                key={item.id}
                item={item}
                displayUrl={getContentPublicUrl(supabase, item.storage_path)}
                href={`/gallery/${item.id}`}
                badge="Owned"
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
