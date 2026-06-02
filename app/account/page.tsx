import { AccountStatusBanner } from "@/components/AccountStatusBanner";
import { AccountUploadSection } from "@/components/AccountUploadSection";
import { AppShell } from "@/components/AppShell";
import { CompleteCreatorApplication } from "@/components/CompleteCreatorApplication";
import { CreatorPayouts } from "@/components/CreatorPayouts";
import { ProfileEditor } from "@/components/ProfileEditor";
import { creatorApplicationComplete } from "@/lib/creator-application";
import { getContentPublicUrl, getMyCreatorContent } from "@/lib/content";
import { logDevIssue } from "@/lib/dev-log";
import { ensureUserProfile } from "@/lib/ensure-profile";
import { getCreatorSales } from "@/lib/sales";
import { connectStatusFromProfile, syncConnectAccountFromStripe } from "@/lib/stripe-connect";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types/database";
import { isApprovedCreator } from "@/lib/types/database";
import { getPublicDisplayPath } from "@/lib/types/content";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ published?: string; connect?: string }>;
}) {
  const { published, connect } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/account");
  }

  await ensureUserProfile(supabase, user);

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    logDevIssue("Profile not found on account page", { userId: user.id });
    return (
      <AppShell>
        <div className="p-8 text-center text-gray-400">
          <p>We couldn&apos;t load your profile. Please try again in a moment.</p>
          <Link href="/" className="mt-4 inline-block text-bp-yellow hover:text-white">
            ← Home
          </Link>
        </div>
      </AppShell>
    );
  }

  if (!isApprovedCreator(profile as Profile) && profile.creator_status === "approved" && profile.role !== "creator") {
    logDevIssue("Profile role mismatch (approved but not creator role)", {
      userId: user.id,
      role: profile.role,
      creator_status: profile.creator_status,
    });
  }

  const accountType = (user.user_metadata?.account_type as string) ?? "user";
  const isCreatorIntent =
    profile.role === "creator" ||
    accountType === "creator" ||
    Boolean(user.user_metadata?.instagram_handle);

  const approved = isApprovedCreator(profile as Profile);
  const myContent = approved ? await getMyCreatorContent(user.id) : [];
  const contentWithUrls = myContent.map((item) => ({
    ...item,
    display_url: getContentPublicUrl(supabase, getPublicDisplayPath(item)),
  }));

  let connectStatus = approved
    ? connectStatusFromProfile(profile as Profile)
    : { accountId: null, chargesEnabled: false, payoutsEnabled: false, ready: false };

  if (approved && connectStatus.accountId && (connect === "complete" || connect === "refresh")) {
    try {
      const synced = await syncConnectAccountFromStripe(
        user.id,
        connectStatus.accountId,
        supabase,
      );
      connectStatus = { accountId: connectStatus.accountId, ...synced };
    } catch (err) {
      console.error("Stripe connect sync:", err);
    }
  }

  const creatorSales = approved ? await getCreatorSales(user.id) : { sales: [], summary: { totalSalesCents: 0, platformFeesCents: 0, creatorPayoutsCents: 0, saleCount: 0 } };
  return (
    <AppShell>
      <div className="min-h-0 flex-1 overflow-y-auto p-6 md:p-8">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-2xl font-bold text-rose-50">Your profile</h1>
          <p className="mt-1 text-sm text-gray-500">
            Update your display name and profile photo.
          </p>
          <AccountStatusBanner profile={profile as Profile} />
          {!approved && profile.role === "user" && (
            <div className="mt-4">
              <Link
                href="/account/messages"
                className="inline-flex rounded-lg bg-bp-gold px-4 py-2 text-sm font-medium text-white hover:bg-bp-gold-dim"
              >
                Messages
              </Link>
            </div>
          )}
          {approved && (
            <>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href={`/creator/${user.id}`}
                  className="rounded-lg border border-bp-border bg-bp-panel px-4 py-2 text-sm text-bp-yellow hover:border-bp-gold-dim hover:text-white"
                >
                  View public profile
                </Link>
                <Link
                  href="/account/messages"
                  className="rounded-lg bg-bp-gold px-4 py-2 text-sm font-medium text-white hover:bg-bp-gold-dim"
                >
                  Messages inbox
                </Link>
              </div>
              <div className="mt-6">
                <AccountUploadSection
                  userId={user.id}
                  existingContent={contentWithUrls}
                  showPublishedMessage={published === "1"}
                />
              </div>
              <CreatorPayouts
                initialReady={connectStatus.ready}
                initialChargesEnabled={connectStatus.chargesEnabled}
                initialPayoutsEnabled={connectStatus.payoutsEnabled}
                hasAccount={Boolean(connectStatus.accountId)}
                sales={creatorSales.sales}
                summary={creatorSales.summary}
                connectQuery={connect ?? null}
              />
            </>
          )}
          {isCreatorIntent &&
            profile.creator_status !== "approved" &&
            !creatorApplicationComplete(profile as Profile) && (
              <div className="mt-4">
                <CompleteCreatorApplication
                  profile={profile as Profile}
                  userId={user.id}
                />
              </div>
            )}
          <div className="mt-4 rounded-2xl border border-bp-border bg-bp-panel p-6 md:p-8">
            <ProfileEditor profile={profile as Profile} email={user.email ?? ""} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
