import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function safeRedirectPath(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/";
  }
  return next;
}

function signOutRedirect(request: NextRequest, redirectPath: string) {
  const response = NextResponse.redirect(new URL(redirectPath, request.url));

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  return { supabase, response };
}

/** Browser navigation logout — clears session cookies on the redirect response. */
export async function GET(request: NextRequest) {
  const redirectPath = safeRedirectPath(request.nextUrl.searchParams.get("next"));
  const { supabase, response } = signOutRedirect(request, redirectPath);
  await supabase.auth.signOut({ scope: "local" });
  return response;
}

export async function POST(request: NextRequest) {
  const redirectPath = safeRedirectPath(request.nextUrl.searchParams.get("next"));
  const { supabase, response } = signOutRedirect(request, redirectPath);
  await supabase.auth.signOut({ scope: "local" });
  return response;
}
