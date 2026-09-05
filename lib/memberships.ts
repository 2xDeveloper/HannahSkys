import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { logDevIssue } from "@/lib/dev-log";
import type { SupabaseClient } from "@supabase/supabase-js";
import type Stripe from "stripe";

export type MembershipPlanId = "monthly" | "quarterly" | "yearly";

export type MembershipPlan = {
  id: MembershipPlanId;
  name: string;
  /** Authoritative amount charged by Stripe — never taken from the browser. */
  priceCents: number;
  priceLabel: string;
  periodLabel: string;
  interval: "month" | "year";
  intervalCount: number;
  features: string[];
  popular: boolean;
};

export const MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    id: "monthly",
    name: "VIP Monthly",
    priceCents: 1499,
    priceLabel: "$14.99",
    periodLabel: "/month",
    interval: "month",
    intervalCount: 1,
    features: [
      "Full photo access",
      "All video previews",
      "New content weekly",
      "Cancel anytime",
    ],
    popular: false,
  },
  {
    id: "quarterly",
    name: "VIP 3 Months",
    priceCents: 3999,
    priceLabel: "$39.99",
    periodLabel: "/3 months",
    interval: "month",
    intervalCount: 3,
    features: [
      "Everything in Monthly",
      "Exclusive member sets",
      "Priority updates",
      "Best value",
    ],
    popular: true,
  },
  {
    id: "yearly",
    name: "VIP Yearly",
    priceCents: 12999,
    priceLabel: "$129.99",
    periodLabel: "/year",
    interval: "year",
    intervalCount: 1,
    features: [
      "Everything in 3 Months",
      "2 months FREE",
      "VIP badge",
      "Thank you gift",
    ],
    popular: false,
  },
];

export function getMembershipPlan(id: string): MembershipPlan | null {
  return MEMBERSHIP_PLANS.find((plan) => plan.id === id) ?? null;
}

async function insertMembershipRow(
  client: SupabaseClient,
  row: Record<string, unknown>,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const { error } = await client.from("memberships").insert(row);

  if (!error) {
    return { ok: true };
  }

  // Already recorded by the webhook or the success redirect.
  if (error.code === "23505") {
    return { ok: true };
  }

  return { ok: false, reason: error.message };
}

function membershipRowFromSession(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id;
  const planId = session.metadata?.plan_id;

  if (!userId || !planId || !getMembershipPlan(planId)) {
    return null;
  }

  const paid = session.status === "complete" || session.payment_status === "paid";
  if (!paid) {
    return null;
  }

  return {
    user_id: userId,
    plan_id: planId,
    amount_cents: session.amount_total ?? getMembershipPlan(planId)!.priceCents,
    status: "active" as const,
    stripe_checkout_session_id: session.id,
    stripe_subscription_id:
      typeof session.subscription === "string" ? session.subscription : null,
    stripe_customer_id: typeof session.customer === "string" ? session.customer : null,
  };
}

/** Save a completed membership checkout. Safe to call more than once per session. */
export async function recordMembershipFromSession(
  session: Stripe.Checkout.Session,
  preferredClient?: SupabaseClient,
): Promise<{ ok: boolean; reason?: string; userId?: string }> {
  const row = membershipRowFromSession(session);

  if (!row) {
    return { ok: false, reason: "invalid_session_metadata" };
  }

  const clients: SupabaseClient[] = [];

  try {
    clients.push(createAdminClient());
  } catch (err) {
    logDevIssue("Admin Supabase client unavailable for membership insert", err);
  }

  if (preferredClient) {
    clients.push(preferredClient);
  }

  if (clients.length === 0) {
    return { ok: false, reason: "missing_service_role", userId: row.user_id };
  }

  for (const client of clients) {
    const result = await insertMembershipRow(client, row);
    if (result.ok) {
      return { ok: true, userId: row.user_id };
    }
    logDevIssue("Membership insert failed", result.reason);
  }

  return { ok: false, reason: "insert_failed", userId: row.user_id };
}

export async function hasActiveMembership(userId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("memberships")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (error) {
    logDevIssue("hasActiveMembership query failed", error.message);
    return false;
  }

  return Boolean(data);
}
