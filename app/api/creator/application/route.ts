import { normalizeInstagram, uploadCreatorApplicationFiles } from "@/lib/creator-application";
import { logDevIssue } from "@/lib/dev-log";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
  }

  const formData = await request.formData();
  const usernameRaw = formData.get("wunUsername") ?? formData.get("instagram");
  const avatar = formData.get("avatar");
  const idDoc = formData.get("id");

  const username =
    typeof usernameRaw === "string" ? normalizeInstagram(usernameRaw) : "";

  if (!username) {
    return NextResponse.json({ error: "Wun.app username is required." }, { status: 400 });
  }

  const { error: finalizeError } = await supabase.rpc("finalize_creator_signup", {
    p_instagram: username,
  });

  if (finalizeError) {
    logDevIssue("finalize_creator_signup failed", finalizeError.message);
    return NextResponse.json(
      { error: "Could not save application. Please try again." },
      { status: 500 },
    );
  }

  if (!(avatar instanceof File && avatar.size > 0 && idDoc instanceof File && idDoc.size > 0)) {
    return NextResponse.json(
      { error: "Profile photo and ID photo are both required." },
      { status: 400 },
    );
  }

  try {
    await uploadCreatorApplicationFiles(supabase, user.id, avatar, idDoc, username);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
