import { normalizeInstagram, uploadCreatorApplicationFiles } from "@/lib/creator-application";
import { createClient } from "@/lib/supabase/client";
import type { Session } from "@supabase/supabase-js";

type SubmitCreatorApplicationOptions = {
  userId?: string;
  session?: Session | null;
};

/** Submit creator application using the browser session. */
export async function submitCreatorApplication(
  instagram: string,
  avatarFile?: File | null,
  idFile?: File | null,
  options?: SubmitCreatorApplicationOptions,
) {
  const supabase = createClient();

  if (options?.session) {
    const { error: sessionError } = await supabase.auth.setSession(options.session);
    if (sessionError) {
      throw new Error(sessionError.message);
    }
  }

  let userId = options?.userId;
  if (!userId) {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error(
        "You must be logged in to upload photos. Log in and try again on your Account page.",
      );
    }
    userId = user.id;
  }

  const ig = normalizeInstagram(instagram);
  if (!ig) {
    throw new Error("Instagram username is required.");
  }

  if (!avatarFile?.size || !idFile?.size) {
    throw new Error("Profile photo and ID photo are both required.");
  }

  const { error: finalizeError } = await supabase.rpc("finalize_creator_signup", {
    p_instagram: ig,
  });

  if (finalizeError) {
    const { error: syncError } = await supabase.rpc("sync_creator_application");
    if (syncError) {
      throw new Error(
        `Could not save application. Run supabase/migration-finalize-creator.sql in Supabase. (${finalizeError.message})`,
      );
    }
  }

  await uploadCreatorApplicationFiles(supabase, userId, avatarFile, idFile, ig);
}
