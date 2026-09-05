import { getMembershipPlan } from "@/lib/memberships";
import { getSiteOrigin } from "@/lib/site-url";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Log in to join.", loginRequired: true },
      { status: 401 },
    );
  }

  let planId: string;
  try {
    const body = (await request.json()) as { planId?: string };
    planId = body.planId ?? "";
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const plan = getMembershipPlan(planId);
  if (!plan) {
    return NextResponse.json({ error: "Unknown membership plan." }, { status: 404 });
  }

  const origin = getSiteOrigin(request);
  const stripe = getStripe();

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: user.email ?? undefined,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: plan.priceCents,
            recurring: {
              interval: plan.interval,
              interval_count: plan.intervalCount,
            },
            product_data: {
              name: `HannahSkys — ${plan.name}`,
              description: plan.features.join(" · "),
            },
          },
        },
      ],
      metadata: {
        kind: "membership",
        plan_id: plan.id,
        user_id: user.id,
      },
      subscription_data: {
        metadata: {
          kind: "membership",
          plan_id: plan.id,
          user_id: user.id,
        },
      },
      success_url: `${origin}/auth/membership-return?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#membership`,
    });

    if (!session.url) {
      return NextResponse.json({ error: "Could not start checkout." }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("membership checkout:", err);
    return NextResponse.json({ error: "Checkout failed. Try again." }, { status: 500 });
  }
}
