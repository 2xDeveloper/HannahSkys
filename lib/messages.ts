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
