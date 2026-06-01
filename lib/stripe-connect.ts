import { getSiteOrigin } from "@/lib/site-url";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import type { Profile } from "@/lib/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";

export type ConnectStatus = {
  accountId: string | null;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  ready: boolean;
};

const emptyConnectStatus: ConnectStatus = {
  accountId: null,
  chargesEnabled: false,
  payoutsEnabled: false,
  ready: false,
};

type ConnectProfileFields = Pick<
  Profile,
  | "stripe_connect_account_id"
  | "stripe_connect_charges_enabled"
  | "stripe_connect_payouts_enabled"
>;

export function connectStatusFromProfile(profile: ConnectProfileFields): ConnectStatus {
  const accountId = profile.stripe_connect_account_id ?? null;
  const chargesEnabled = profile.stripe_connect_charges_enabled ?? false;
  const payoutsEnabled = profile.stripe_connect_payouts_enabled ?? false;

  return {
    accountId,
    chargesEnabled,
    payoutsEnabled,
    ready: Boolean(accountId && chargesEnabled && payoutsEnabled),
  };
}

export async function getCreatorConnectStatus(creatorId: string): Promise<ConnectStatus> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "stripe_connect_account_id, stripe_connect_charges_enabled, stripe_connect_payouts_enabled",
    )
    .eq("id", creatorId)
    .single();

  if (error || !data) {
    if (error) {
      console.error("getCreatorConnectStatus:", error.message);
    }
    return emptyConnectStatus;
  }

  return connectStatusFromProfile(data as ConnectProfileFields);
}

export async function syncConnectAccountFromStripe(
  userId: string,
  accountId: string,
  supabase?: SupabaseClient,
) {
  const stripe = getStripe();
  const account = await stripe.accounts.retrieve(accountId);

  const updates = {
    stripe_connect_charges_enabled: account.charges_enabled ?? false,
    stripe_connect_payouts_enabled: account.payouts_enabled ?? false,
  };

  const client = supabase ?? (await createClient());
  const { error } = await client.from("profiles").update(updates).eq("id", userId);

  if (error) {
    console.error("syncConnectAccountFromStripe:", error.message);
  }

  return {
    chargesEnabled: updates.stripe_connect_charges_enabled,
    payoutsEnabled: updates.stripe_connect_payouts_enabled,
    ready: Boolean(updates.stripe_connect_charges_enabled && updates.stripe_connect_payouts_enabled),
  };
}

export async function createConnectOnboardingLink(
  userId: string,
  email: string,
  request: Request,
  supabase: SupabaseClient,
): Promise<string> {
  const stripe = getStripe();
  const origin = getSiteOrigin(request);

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_connect_account_id")
    .eq("id", userId)
    .single();

  let accountId = profile?.stripe_connect_account_id ?? null;

  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
      country: "US",
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      metadata: {
        platform_user_id: userId,
      },
    });
    accountId = account.id;

    const { error } = await supabase
      .from("profiles")
      .update({ stripe_connect_account_id: accountId })
      .eq("id", userId);

    if (error) {
      throw new Error(`Could not save Stripe account: ${error.message}`);
    }
  }

  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${origin}/account?connect=refresh`,
    return_url: `${origin}/account?connect=complete`,
    type: "account_onboarding",
  });

  if (!link.url) {
    throw new Error("Could not create Stripe onboarding link.");
  }

  return link.url;
}

export async function getConnectAccountIdForCreator(creatorId: string): Promise<string | null> {
  const status = await getCreatorConnectStatus(creatorId);
  if (!status.ready || !status.accountId) {
    return null;
  }
  return status.accountId;
}
