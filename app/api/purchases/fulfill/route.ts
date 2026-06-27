import { fulfillCheckoutSession } from "@/lib/purchases";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/** Retry purchase unlock after Stripe redirect (client fallback). */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Log in required." }, { status: 401 });
  }

  let sessionId = "";
  try {
    const body = (await request.json()) as { sessionId?: string };
    sessionId = body.sessionId?.trim() ?? "";
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!sessionId) {
    return NextResponse.json({ error: "Session ID required." }, { status: 400 });
  }

  const result = await fulfillCheckoutSession(sessionId, user.id);

  if (!result.ok) {
    return NextResponse.json(
      { error: "Could not unlock purchase.", reason: result.reason },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true });
}
