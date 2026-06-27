import { fulfillCheckoutSessionFromStripe } from "@/lib/purchases";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Stripe success redirect — saves purchase server-side, then sends user to gallery or login. */
export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id")?.trim();
  const contentId = request.nextUrl.searchParams.get("content_id")?.trim();

  if (!sessionId || !contentId) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const galleryPath = `/gallery/${contentId}`;
  const galleryUrl = new URL(galleryPath, request.url);

  let fulfill;
  try {
    fulfill = await fulfillCheckoutSessionFromStripe(sessionId);
  } catch (err) {
    console.error("checkout-return fulfill:", err);
    galleryUrl.searchParams.set("checkout_error", "1");
    return NextResponse.redirect(galleryUrl);
  }

  if (!fulfill.ok || fulfill.contentId !== contentId) {
    galleryUrl.searchParams.set("checkout_error", "1");
    return NextResponse.redirect(galleryUrl);
  }

  galleryUrl.searchParams.set("purchased", "1");

  let response = NextResponse.redirect(galleryUrl);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          response = NextResponse.redirect(galleryUrl);
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user && user.id === fulfill.buyerId) {
    return response;
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", `${galleryPath}?purchased=1`);
  loginUrl.searchParams.set("purchase", "1");
  return NextResponse.redirect(loginUrl);
}
