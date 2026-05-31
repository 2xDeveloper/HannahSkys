import { createAdminClient } from "@/lib/supabase/admin";
import { getSiteOrigin } from "@/lib/site-url";
import { getStripe } from "@/lib/stripe";

export type ConnectStatus = {
  accountId: string | null;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  ready: boolean;
};

export async function getCreatorConnectStatus(userId: string): Promise<ConnectStatus> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("stripe_connect_account_id, stripe_connect_charges_enabled, stripe_connect_payouts_enabled")
    .eq("id", userId)
    .single();

  const accountId = data?.stripe_connect_account_id ?? null;
  const chargesEnabled = data?.stripe_connect_charges_enabled ?? false;
  const payoutsEnabled = data?.stripe_connect_payouts_enabled ?? false;

  return {
    accountId,
    chargesEnabled,
    payoutsEnabled,
    ready: Boolean(accountId && chargesEnabled && payoutsEnabled),
  };
}

export async function syncConnectAccountFromStripe(userId: string, accountId: string) {
  const stripe = getStripe();
  const account = await stripe.accounts.retrieve(accountId);

  const admin = createAdminClient();
  await admin
    .from("profiles")
    .update({
      stripe_connect_charges_enabled: account.charges_enabled ?? false,
      stripe_connect_payouts_enabled: account.payouts_enabled ?? false,
    })
    .eq("id", userId);

  return {
    chargesEnabled: account.charges_enabled ?? false,
    payoutsEnabled: account.payouts_enabled ?? false,
    ready: Boolean(account.charges_enabled && account.payouts_enabled),
  };
}

export async function createConnectOnboardingLink(
  userId: string,
  email: string,
  request: Request,
): Promise<string> {
  const stripe = getStripe();
  const admin = createAdminClient();
  const origin = getSiteOrigin(request);

  const { data: profile } = await admin
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

    await admin
      .from("profiles")
      .update({ stripe_connect_account_id: accountId })
      .eq("id", userId);
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
