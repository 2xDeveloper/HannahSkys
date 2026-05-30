import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: me } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (me?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id_document_path")
    .eq("id", userId)
    .single();

  if (!profile?.id_document_path) {
    return NextResponse.json({ error: "No ID on file" }, { status: 404 });
  }

  const { data, error } = await supabase.storage
    .from("id-documents")
    .createSignedUrl(profile.id_document_path, 300);

  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: "Could not load ID" }, { status: 500 });
  }

  return NextResponse.redirect(data.signedUrl);
}
