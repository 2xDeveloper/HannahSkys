import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { logDevIssue } from "@/lib/dev-log";
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
  creator_payout_cents: number;
  stripe_checkout_session_id: string;
  status: string;
  created_at: string;
};

export type LibraryItem = CreatorContent & {
  purchased_at: string;
  amount_cents: number;
};

function isPaidCheckoutSession(session: Stripe.Checkout.Session): boolean {
  return session.status === "complete" || session.payment_status === "paid";
}

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
    logDevIssue("hasPurchased query failed", error.message);
    return false;
  }

  return Boolean(data);
}

async function insertPurchaseRow(
  client: SupabaseClient,
  row: Record<string, unknown>,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const { error } = await client.from("purchases").insert(row);

  if (!error) {
    return { ok: true };
  }

  if (error.code === "23505") {
    return { ok: true };
  }

  if (error.message.includes("creator_payout_cents")) {
    const { creator_payout_cents: _removed, ...withoutPayout } = row;
    return insertPurchaseRow(client, withoutPayout);
  }

  return { ok: false, reason: error.message };
}

async function insertPurchaseFromSession(
  session: Stripe.Checkout.Session,
  preferredClient?: SupabaseClient,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const buyerId = session.metadata?.buyer_id;
  const contentId = session.metadata?.content_id;
  const creatorId = session.metadata?.creator_id;
  const amountCents = session.amount_total;

  if (!buyerId || !contentId || !creatorId || amountCents == null) {
    return { ok: false, reason: "invalid_session_metadata" };
  }

  if (!isPaidCheckoutSession(session)) {
    return { ok: false, reason: "payment_not_complete" };
  }

  const platformFeeCents = calcPlatformFeeCents(amountCents);
  const creatorPayoutCents = amountCents - platformFeeCents;

  const row = {
    buyer_id: buyerId,
    content_id: contentId,
    creator_id: creatorId,
    amount_cents: amountCents,
    platform_fee_cents: platformFeeCents,
    creator_payout_cents: creatorPayoutCents,
    stripe_checkout_session_id: session.id,
    status: "completed" as const,
  };

  const clients: SupabaseClient[] = [];

  try {
    clients.push(createAdminClient());
  } catch (err) {
    logDevIssue("Admin Supabase client unavailable for purchase insert", err);
  }

  if (preferredClient) {
    clients.push(preferredClient);
  }

  if (clients.length === 0) {
    return { ok: false, reason: "missing_service_role" };
  }

  for (const client of clients) {
    const result = await insertPurchaseRow(client, row);
    if (result.ok) {
      return result;
    }
    logDevIssue("Purchase insert failed", result.reason);
  }

  return { ok: false, reason: "insert_failed" };
}

export async function getUserLibrary(userId: string): Promise<LibraryItem[]> {
  const supabase = await createClient();

  const { data: purchaseRows, error: purchaseError } = await supabase
    .from("purchases")
    .select("content_id, amount_cents, created_at")
    .eq("buyer_id", userId)
    .eq("status", "completed")
    .order("created_at", { ascending: false });

  if (purchaseError || !purchaseRows?.length) {
    if (purchaseError) {
      logDevIssue("getUserLibrary purchases query failed", purchaseError.message);
    }
    return [];
  }

  const contentIds = purchaseRows.map((row) => row.content_id);
  const purchaseByContent = new Map(
    purchaseRows.map((row) => [row.content_id, row] as const),
  );

  const { data: contents, error: contentError } = await supabase
    .from("creator_content")
    .select("*")
    .in("id", contentIds);

  if (contentError || !contents?.length) {
    if (contentError) {
      logDevIssue("getUserLibrary content query failed", contentError.message);
    }
    return [];
  }

  const creatorIds = [...new Set(contents.map((row) => row.creator_id))];
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

  const contentById = new Map(contents.map((row) => [row.id, row as CreatorContent]));

  const items: LibraryItem[] = [];

  for (const contentId of contentIds) {
    const content = contentById.get(contentId);
    const purchase = purchaseByContent.get(contentId);
    if (!content || !purchase) continue;

    items.push({
      ...content,
      preview_storage_path: content.preview_storage_path ?? null,
      creator_name: nameMap.get(content.creator_id) ?? null,
      purchased_at: purchase.created_at,
      amount_cents: purchase.amount_cents,
    });
  }

  return items;
}

/** Fulfill a Stripe checkout session using metadata (no logged-in cookie required). */
export async function fulfillCheckoutSessionFromStripe(sessionId: string): Promise<{
  ok: boolean;
  reason?: string;
  buyerId?: string;
  contentId?: string;
}> {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const buyerId = session.metadata?.buyer_id;
  const contentId = session.metadata?.content_id;

  if (!buyerId || !contentId) {
    return { ok: false, reason: "invalid_session_metadata" };
  }

  const result = await insertPurchaseFromSession(session);

  if (!result.ok) {
    logDevIssue("fulfillCheckoutSessionFromStripe failed", {
      sessionId,
      buyerId,
      contentId,
      reason: result.reason,
    });
    return { ok: false, reason: result.reason, buyerId, contentId };
  }

  return { ok: true, buyerId, contentId };
}

/** Fulfill after Stripe redirect when the buyer is already logged in. */
export async function fulfillCheckoutSession(
  sessionId: string,
  expectedBuyerId: string,
): Promise<{ ok: boolean; reason?: string }> {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.metadata?.buyer_id !== expectedBuyerId) {
    return { ok: false, reason: "buyer_mismatch" };
  }

  const supabase = await createClient();
  const result = await insertPurchaseFromSession(session, supabase);

  if (!result.ok) {
    logDevIssue("fulfillCheckoutSession failed", {
      sessionId,
      buyerId: expectedBuyerId,
      reason: result.reason,
    });
    return { ok: false, reason: result.reason };
  }

  return { ok: true };
}

export async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  return insertPurchaseFromSession(session);
}
