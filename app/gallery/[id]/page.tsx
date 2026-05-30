import { AppShell } from "@/components/AppShell";
import { GalleryDetail } from "@/components/GalleryDetail";
import { getContentById, getContentPublicUrl } from "@/lib/content";
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
      checkoutError =
        "Payment went through but unlock failed. Re-run supabase/migration-purchases.sql in Supabase, then refresh this page.";
    }
  } else if (query.session_id && !user) {
    checkoutError = "Log in to unlock your purchase.";
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
