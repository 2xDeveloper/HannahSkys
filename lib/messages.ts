import type { Profile } from "@/lib/types/database";
import { createClient } from "@/lib/supabase/server";

export type Message = {
  id: string;
  sender_id: string | null;
  recipient_id: string;
  sender_name: string | null;
  sender_email: string | null;
  body: string;
  created_at: string;
  read_at: string | null;
};

export async function getCreatorProfile(id: string): Promise<Profile | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .eq("role", "creator")
    .eq("creator_status", "approved")
    .single();

  if (error || !data) return null;
  return data as Profile;
}

export async function getInboxMessages(userId: string): Promise<Message[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("recipient_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as Message[];
}

export async function getSentMessages(userId: string): Promise<Message[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("sender_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as Message[];
}

export async function getUnreadCount(userId: string): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("recipient_id", userId)
    .is("read_at", null);

  if (error) return 0;
  return count ?? 0;
}

/** All messages the user sent or received — for threaded chat UI */
export async function getAllMessagesForUser(userId: string): Promise<Message[]> {
  const supabase = await createClient();

  const [inboxRes, sentRes] = await Promise.all([
    supabase
      .from("messages")
      .select("*")
      .eq("recipient_id", userId)
      .order("created_at", { ascending: true }),
    supabase
      .from("messages")
      .select("*")
      .eq("sender_id", userId)
      .order("created_at", { ascending: true }),
  ]);

  const byId = new Map<string, Message>();
  for (const row of [...(inboxRes.data ?? []), ...(sentRes.data ?? [])]) {
    byId.set(row.id, row as Message);
  }

  return [...byId.values()].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
}

export async function getPartnerProfiles(
  userIds: string[],
): Promise<Record<string, { display_name: string | null; avatar_url: string | null }>> {
  if (userIds.length === 0) return {};

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url")
    .in("id", userIds);

  const map: Record<string, { display_name: string | null; avatar_url: string | null }> = {};
  for (const row of data ?? []) {
    map[row.id] = { display_name: row.display_name, avatar_url: row.avatar_url };
  }
  return map;
}
