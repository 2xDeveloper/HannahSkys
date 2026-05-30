import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { calcPlatformFeeCents, getStripe } from "@/lib/stripe";
import type { CreatorContent } from "@/lib/types/content";
import type { SupabaseClient } from "@supabase/supabase-js";
import type Stripe from "stripe";

export type Purchase = {
  id: string;
  buyer_id: string;
  content_id: string;
  creator_id: string;
  amount_cents: number;
  platform_fee_cents: number;
  stripe_checkout_session_id: string;
  status: string;
  created_at: string;
};

export type LibraryItem = CreatorContent & {
  purchased_at: string;
  amount_cents: number;
};

export async function hasPurchased(userId: string, contentId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("purchases")
    .select("id")
    .eq("buyer_id", userId)
    .eq("content_id", contentId)
    .eq("status", "completed")
    .maybeSingle();

  if (error) {
    console.error("hasPurchased:", error.message);
    return false;
  }

  return Boolean(data);
}

function contentFromJoin(row: unknown): CreatorContent | null {
  const joined = (row as { creator_content?: CreatorContent | CreatorContent[] | null })
    .creator_content;
  if (!joined) return null;
  if (Array.isArray(joined)) return joined[0] ?? null;
  return joined;
}

export async function getUserLibrary(userId: string): Promise<LibraryItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("purchases")
    .select(
      `
      amount_cents,
      created_at,
      creator_content (
        id,
        creator_id,
        title,
        media_type,
        storage_path,
        price_cents,
        created_at,
        updated_at
      )
    `,
    )
    .eq("buyer_id", userId)
    .eq("status", "completed")
    .order("created_at", { ascending: false });

  if (error || !data) {
    if (error) {
      console.error("getUserLibrary:", error.message);
    }
    return [];
  }

  const creatorIds = [
    ...new Set(
      data
        .map((row) => contentFromJoin(row)?.creator_id)
        .filter(Boolean) as string[],
    ),
  ];

  const nameMap = new Map<string, string | null>();
  if (creatorIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name")
      .in("id", creatorIds);

    for (const profile of profiles ?? []) {
      nameMap.set(profile.id, profile.display_name);
    }
  }

  const items: LibraryItem[] = [];

  for (const row of data) {
    const content = contentFromJoin(row);
    if (!content) continue;

    items.push({
      ...content,
      preview_storage_path: content.preview_storage_path ?? null,
      creator_name: nameMap.get(content.creator_id) ?? null,
      purchased_at: row.created_at,
      amount_cents: row.amount_cents,
    });
  }

  return items;
}

async function insertPurchaseFromSession(
  session: Stripe.Checkout.Session,
  supabase?: SupabaseClient,
) {
  const buyerId = session.metadata?.buyer_id;
  const contentId = session.metadata?.content_id;
  const creatorId = session.metadata?.creator_id;
  const amountCents = session.amount_total;

  if (
    !buyerId ||
    !contentId ||
    !creatorId ||
    amountCents == null ||
    session.payment_status !== "paid"
  ) {
    return { ok: false as const, reason: "invalid_session" };
  }

  let client = supabase;
  if (!client) {
    try {
      client = createAdminClient();
    } catch (err) {
      console.error("insertPurchaseFromSession:", err);
      return { ok: false as const, reason: "missing_service_role" };
    }
  }

  const platformFeeCents = calcPlatformFeeCents(amountCents);

  const { error } = await client.from("purchases").upsert(
    {
      buyer_id: buyerId,
      content_id: contentId,
      creator_id: creatorId,
      amount_cents: amountCents,
      platform_fee_cents: platformFeeCents,
      stripe_checkout_session_id: session.id,
      status: "completed",
    },
    { onConflict: "stripe_checkout_session_id", ignoreDuplicates: true },
  );

  if (error) {
    console.error("insertPurchaseFromSession:", error.message);
    return { ok: false as const, reason: error.message };
  }

  return { ok: true as const };
}

/** Fulfill after redirect — works locally without Stripe CLI webhook. */
export async function fulfillCheckoutSession(
  sessionId: string,
  expectedBuyerId: string,
): Promise<boolean> {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.metadata?.buyer_id !== expectedBuyerId) {
    return false;
  }

  const supabase = await createClient();
  const result = await insertPurchaseFromSession(session, supabase);
  return result.ok;
}

export async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  return insertPurchaseFromSession(session);
}
