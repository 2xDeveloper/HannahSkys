import {
  createConnectOnboardingLink,
  getCreatorConnectStatus,
  syncConnectAccountFromStripe,
} from "@/lib/stripe-connect";
import { createClient } from "@/lib/supabase/server";
import { isApprovedCreator } from "@/lib/types/database";
import type { Profile } from "@/lib/types/database";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Log in required." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || !isApprovedCreator(profile as Profile)) {
    return NextResponse.json({ error: "Approved creators only." }, { status: 403 });
  }

  let status = await getCreatorConnectStatus(user.id);

  if (status.accountId) {
    const synced = await syncConnectAccountFromStripe(user.id, status.accountId);
    status = {
      accountId: status.accountId,
      chargesEnabled: synced.chargesEnabled,
      payoutsEnabled: synced.payoutsEnabled,
      ready: synced.ready,
    };
  }

  return NextResponse.json(status);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Log in required." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || !isApprovedCreator(profile as Profile)) {
    return NextResponse.json({ error: "Approved creators only." }, { status: 403 });
  }

  try {
    const url = await createConnectOnboardingLink(
      user.id,
      user.email ?? "",
      request,
    );
    return NextResponse.json({ url });
  } catch (err) {
    console.error("connect onboard:", err);
    const message =
      err instanceof Error && err.message.includes("Connect")
        ? "Enable Stripe Connect in your Stripe Dashboard first (Settings → Connect)."
        : "Could not start Stripe setup. Try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
