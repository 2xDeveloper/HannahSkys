import { createClient } from "@/lib/supabase/server";
import type { CreatorStatus } from "@/lib/types/database";
import { NextResponse } from "next/server";

type CreatorStatusAction = CreatorStatus;

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const { data: me } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (me?.role !== "admin") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { supabase };
}

/** Admin-only creator approval — uses server session (works on mobile Safari). */
export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth && auth.error) return auth.error;

  const supabase = auth.supabase!;

  let body: { userId?: string; status?: CreatorStatusAction };
  try {
    body = (await request.json()) as { userId?: string; status?: CreatorStatusAction };
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const userId = body.userId?.trim();
  const status = body.status;

  if (!userId || !status || !["approved", "rejected", "pending"].includes(status)) {
    return NextResponse.json({ error: "Invalid userId or status." }, { status: 400 });
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      creator_status: status,
      role: status === "rejected" ? "user" : "creator",
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
