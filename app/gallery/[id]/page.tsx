import { AppShell } from "@/components/AppShell";
import { GalleryDetail } from "@/components/GalleryDetail";
import { getContentById, getContentPublicUrl } from "@/lib/content";
import { logDevIssue } from "@/lib/dev-log";
import { fulfillCheckoutSession, hasPurchased } from "@/lib/purchases";
import { createClient } from "@/lib/supabase/server";
import { getPublicDisplayPath, isFreeContent } from "@/lib/types/content";
import { notFound, redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ session_id?: string; purchased?: string }>;
};

export default async function GalleryDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const query = await searchParams;
  const item = await getContentById(id);

  if (!item) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let checkoutError: string | null = null;

  if (query.session_id && user) {
    let fulfilled = false;
    try {
      fulfilled = await fulfillCheckoutSession(query.session_id, user.id);
    } catch (err) {
      console.error("fulfillCheckoutSession:", err);
      checkoutError = "Could not confirm purchase. Refresh this page or contact support.";
    }

    if (fulfilled) {
      redirect(`/gallery/${id}?purchased=1`);
    } else if (!checkoutError) {
      logDevIssue("Purchase unlock failed after checkout", { sessionId: query.session_id, userId: user.id });
      checkoutError = "Payment received but content could not be unlocked. Refresh this page or contact support.";
    }
  } else if (query.session_id && !user) {
    redirect(`/login?next=${encodeURIComponent(`/gallery/${id}?session_id=${query.session_id}`)}`);
  }

  const owned = user ? await hasPurchased(user.id, id) : false;
  const justPurchased = query.purchased === "1" && owned;

  const previewUrl = getContentPublicUrl(supabase, getPublicDisplayPath(item));
  const fullUrl =
    isFreeContent(item) || owned
      ? getContentPublicUrl(supabase, item.storage_path)
      : null;

  return (
    <AppShell>
      <GalleryDetail
        item={item}
        previewUrl={previewUrl}
        fullUrl={fullUrl}
        owned={owned}
        justPurchased={justPurchased}
        checkoutError={checkoutError}
      />
    </AppShell>
  );
}
