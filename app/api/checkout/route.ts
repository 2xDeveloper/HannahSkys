import { getContentById } from "@/lib/content";
import { getSiteOrigin } from "@/lib/site-url";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { hasPurchased } from "@/lib/purchases";
import { isFreeContent } from "@/lib/types/content";
import { NextResponse } from "next/server";

const MIN_CHECKOUT_CENTS = 50;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Log in to purchase." }, { status: 401 });
  }

  let contentId: string;
  try {
    const body = (await request.json()) as { contentId?: string };
    contentId = body.contentId ?? "";
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!contentId) {
    return NextResponse.json({ error: "Content ID required." }, { status: 400 });
  }

  const item = await getContentById(contentId);
  if (!item || isFreeContent(item)) {
    return NextResponse.json({ error: "Content not available for purchase." }, { status: 404 });
  }

  const priceCents = item.price_cents ?? 0;
  if (priceCents < MIN_CHECKOUT_CENTS) {
    return NextResponse.json(
      { error: "Minimum purchase price is $0.50 (Stripe requirement)." },
      { status: 400 },
    );
  }

  if (item.creator_id === user.id) {
    return NextResponse.json({ error: "You cannot buy your own content." }, { status: 400 });
  }

  if (await hasPurchased(user.id, contentId)) {
    return NextResponse.json({ error: "You already own this content." }, { status: 400 });
  }

  const origin = getSiteOrigin(request);
  const stripe = getStripe();

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: priceCents,
            product_data: {
              name: item.title,
              description: `Full ${item.media_type} by ${item.creator_name ?? "creator"}`,
            },
          },
        },
      ],
      metadata: {
        content_id: contentId,
        buyer_id: user.id,
        creator_id: item.creator_id,
      },
      success_url: `${origin}/gallery/${contentId}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/gallery/${contentId}`,
    });

    if (!session.url) {
      return NextResponse.json({ error: "Could not start checkout." }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("checkout:", err);
    return NextResponse.json({ error: "Checkout failed. Try again." }, { status: 500 });
  }
}
