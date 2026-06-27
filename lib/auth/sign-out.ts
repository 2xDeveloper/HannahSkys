import { createClient } from "@/lib/supabase/client";

/** Clear auth on client and server, then hard-navigate so cookies and RSC stay in sync. */
export async function signOutAndRedirect(redirectTo = "/") {
  try {
    await fetch("/auth/signout", {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
    });
  } catch {
    // Continue — client sign-out below still runs.
  }

  const supabase = createClient();
  await supabase.auth.signOut({ scope: "global" });

  window.location.href = redirectTo;
}
