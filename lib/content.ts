import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { CreatorContent } from "@/lib/types/content";
import { getPublicDisplayPath } from "@/lib/types/content";

const BUCKET = "creator-media";

export function getContentPublicUrl(supabase: SupabaseClient, storagePath: string) {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

function mapRow(
  row: CreatorContent,
  creatorName: string | null,
): CreatorContent {
  return { ...row, creator_name: creatorName };
}

async function approvedCreatorMap(supabase: SupabaseClient) {
  const { data } = await supabase
    .from("profiles")
    .select("id, display_name")
    .eq("role", "creator")
    .eq("creator_status", "approved");

  const map = new Map<string, string | null>();
  for (const row of data ?? []) {
    map.set(row.id, row.display_name);
  }
  return map;
}

/** All content from approved creators — home page feed */
export async function getAllCreatorContent(): Promise<CreatorContent[]> {
  const supabase = await createClient();
  const creators = await approvedCreatorMap(supabase);
  const ids = [...creators.keys()];

  if (ids.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("creator_content")
    .select("*")
    .in("creator_id", ids)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("getAllCreatorContent:", error?.message);
    return [];
  }

  return data.map((row) =>
    mapRow(row as CreatorContent, creators.get(row.creator_id) ?? null),
  );
}

/** Content for one creator profile */
export async function getCreatorContent(creatorId: string): Promise<CreatorContent[]> {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, role, creator_status")
    .eq("id", creatorId)
    .single();

  if (profile?.role !== "creator" || profile?.creator_status !== "approved") {
    return [];
  }

  const { data, error } = await supabase
    .from("creator_content")
    .select("*")
    .eq("creator_id", creatorId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data.map((row) => mapRow(row as CreatorContent, profile.display_name));
}

/** Own content for account page (includes pending approval state check on upload only) */
export async function getMyCreatorContent(userId: string): Promise<CreatorContent[]> {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", userId)
    .single();

  const { data, error } = await supabase
    .from("creator_content")
    .select("*")
    .eq("creator_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data.map((row) => mapRow(row as CreatorContent, profile?.display_name ?? null));
}

export async function getContentById(id: string): Promise<CreatorContent | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("creator_content")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, role, creator_status")
    .eq("id", data.creator_id)
    .single();

  if (profile?.role !== "creator" || profile?.creator_status !== "approved") {
    return null;
  }

  return mapRow(data as CreatorContent, profile.display_name);
}
