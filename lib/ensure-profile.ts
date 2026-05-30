import type { SupabaseClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";
import { normalizeInstagram } from "@/lib/creator-application";

/** Ensure profile exists and creator signups are marked pending for admin review. */
export async function ensureUserProfile(supabase: SupabaseClient, user: User) {
  const accountType = (user.user_metadata?.account_type as string) ?? "user";
  const displayName =
    (user.user_metadata?.display_name as string) ??
    user.email?.split("@")[0] ??
    "User";
  const instagram = user.user_metadata?.instagram_handle
    ? normalizeInstagram(String(user.user_metadata.instagram_handle))
    : null;

  const { data: existing } = await supabase
    .from("profiles")
    .select("id, role, creator_status")
    .eq("id", user.id)
    .maybeSingle();

  if (!existing) {
    const { error } = await supabase.from("profiles").insert({
      id: user.id,
      display_name: displayName,
      role: accountType === "creator" ? "creator" : "user",
      creator_status: accountType === "creator" ? "pending" : "approved",
      instagram_handle: accountType === "creator" ? instagram : null,
    });
    if (error) console.error("Profile insert error:", error.message);
  }

  const isCreatorIntent = accountType === "creator" || Boolean(instagram);

  if (isCreatorIntent) {
    const { error: finalizeError } = await supabase.rpc("finalize_creator_signup", {
      p_instagram: instagram ?? "",
    });

    if (finalizeError) {
      const { error: syncError } = await supabase.rpc("sync_creator_application");
      if (syncError) {
        console.error(
          "Creator profile sync failed. Run supabase/migration-finalize-creator.sql:",
          finalizeError.message,
          syncError.message,
        );
      }
    }
  }
}
