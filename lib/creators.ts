import { createClient } from "@/lib/supabase/server";
import { isPubliclyListedCreator } from "@/lib/public-creators";

export type FeaturedCreator = {
  id: string;
  name: string;
  avatarUrl: string | null;
  isNew: boolean;
};

const NEW_CREATOR_DAYS = 14;

function isRecentlyJoined(createdAt: string): boolean {
  const joined = new Date(createdAt).getTime();
  const cutoff = Date.now() - NEW_CREATOR_DAYS * 24 * 60 * 60 * 1000;
  return joined >= cutoff;
}

/** Approved creators only — shown in sidebar Featured Creators */
export async function getApprovedCreators(): Promise<FeaturedCreator[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, created_at")
    .eq("role", "creator")
    .eq("creator_status", "approved")
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data
    .filter((row) => isPubliclyListedCreator(row.display_name))
    .map((row) => ({
      id: row.id,
      name: row.display_name?.trim() || "Creator",
      avatarUrl: row.avatar_url,
      isNew: isRecentlyJoined(row.created_at),
    }));
}
