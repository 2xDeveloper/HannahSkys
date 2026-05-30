import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/** Server-only Supabase client (bypasses RLS). Used for Stripe webhooks. */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY — add it to .env.local (Supabase → Settings → API → service_role).",
    );
  }

  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
