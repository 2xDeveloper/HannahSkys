import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

function safeRedirectPath(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/";
  }
  return next;
}

async function signOutResponse(request: Request, redirectPath: string) {
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "global" });
  return NextResponse.redirect(new URL(redirectPath, request.url));
}

/** Browser navigation logout — clears cookies server-side then redirects. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  return signOutResponse(request, safeRedirectPath(searchParams.get("next")));
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  return signOutResponse(request, safeRedirectPath(searchParams.get("next")));
}
