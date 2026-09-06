import type { SupabaseClient } from "@supabase/supabase-js";

function extFromFile(file: File) {
  const parts = file.name.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "jpg";
}

export function normalizeInstagram(handle: string) {
  return handle.trim().replace(/^@+/, "").replace(/\s/g, "");
}

/** Same storage as instagram_handle — creators enter their wun.app username. */
export const normalizeWunUsername = normalizeInstagram;

export function formatWunUsername(handle: string | null | undefined): string | null {
  if (!handle) return null;
  const cleaned = handle.trim().replace(/^@+/, "");
  return cleaned || null;
}

export function wunAppProfileUrl(handle: string | null | undefined): string | null {
  const username = formatWunUsername(handle);
  return username ? `https://wun.app/${username}` : null;
}

export async function uploadCreatorApplicationFiles(
  supabase: SupabaseClient,
  userId: string,
  avatarFile: File | null,
  idFile: File | null,
  instagramHandle: string,
) {
  const update: {
    instagram_handle: string | null;
    updated_at: string;
    avatar_url?: string;
    id_document_path?: string;
  } = {
    instagram_handle: normalizeInstagram(instagramHandle) || null,
    updated_at: new Date().toISOString(),
  };

  if (avatarFile?.size) {
    const avatarPath = `${userId}/avatar.${extFromFile(avatarFile)}`;
    const { error: avatarError } = await supabase.storage
      .from("avatars")
      .upload(avatarPath, avatarFile, { upsert: true, contentType: avatarFile.type });

    if (avatarError) throw new Error(`Profile photo: ${avatarError.message}`);

    const { data: avatarUrlData } = supabase.storage.from("avatars").getPublicUrl(avatarPath);
    update.avatar_url = `${avatarUrlData.publicUrl}?t=${Date.now()}`;
  }

  if (idFile?.size) {
    const idPath = `${userId}/id.${extFromFile(idFile)}`;
    const { error: idError } = await supabase.storage
      .from("id-documents")
      .upload(idPath, idFile, { upsert: true, contentType: idFile.type });

    if (idError) throw new Error(`ID photo: ${idError.message}`);
    update.id_document_path = idPath;
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update(update)
    .eq("id", userId);

  if (profileError) throw new Error(profileError.message);

  return { avatarUrl: update.avatar_url ?? null, idPath: update.id_document_path ?? null };
}

export function creatorApplicationComplete(profile: {
  avatar_url: string | null;
  instagram_handle: string | null;
}) {
  return Boolean(profile.avatar_url && profile.instagram_handle);
}
