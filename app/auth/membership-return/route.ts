import { recordMembershipFromSession } from "@/lib/memberships";
import { getStripe } from "@/lib/stripe";
import { NextResponse, type NextRequest } from "next/server";

/** Stripe success redirect for memberships — saves the membership, then sends the fan to their account. */
export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id")?.trim();

  if (!sessionId) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const accountUrl = new URL("/account", request.url);

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const result = await recordMembershipFromSession(session);

    if (!result.ok) {
      accountUrl.searchParams.set("membership_error", "1");
      return NextResponse.redirect(accountUrl);
    }
  } catch (err) {
    console.error("membership-return:", err);
    accountUrl.searchParams.set("membership_error", "1");
    return NextResponse.redirect(accountUrl);
  }

  accountUrl.searchParams.set("membership", "1");
  return NextResponse.redirect(accountUrl);
}
