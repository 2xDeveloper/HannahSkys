import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types/database";

export type HeaderAuthState = {
  userId: string;
  profile: Profile | null;
};

/** Read session from cookies on the server — used to seed the header on first paint. */
export async function getHeaderAuthState(): Promise<HeaderAuthState | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return {
    userId: user.id,
    profile: (profile as Profile | null) ?? null,
  };
}
