import type { SupabaseClient } from "@supabase/supabase-js";

function extFromFile(file: File) {
  const parts = file.name.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "jpg";
}

export function normalizeInstagram(handle: string) {
  return handle.trim().replace(/^@+/, "").replace(/\s/g, "");
}

export async function uploadCreatorApplicationFiles(
  supabase: SupabaseClient,
  userId: string,
  avatarFile: File,
  idFile: File,
  instagramHandle: string,
) {
  const avatarExt = extFromFile(avatarFile);
  const idExt = extFromFile(idFile);
  const avatarPath = `${userId}/avatar.${avatarExt}`;
  const idPath = `${userId}/id.${idExt}`;

  const { error: avatarError } = await supabase.storage
    .from("avatars")
    .upload(avatarPath, avatarFile, { upsert: true, contentType: avatarFile.type });

  if (avatarError) throw new Error(`Profile photo: ${avatarError.message}`);

  const { error: idError } = await supabase.storage
    .from("id-documents")
    .upload(idPath, idFile, { upsert: true, contentType: idFile.type });

  if (idError) throw new Error(`ID photo: ${idError.message}`);

  const { data: avatarUrlData } = supabase.storage.from("avatars").getPublicUrl(avatarPath);
  const avatarUrl = `${avatarUrlData.publicUrl}?t=${Date.now()}`;

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      avatar_url: avatarUrl,
      id_document_path: idPath,
      instagram_handle: normalizeInstagram(instagramHandle),
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (profileError) throw new Error(profileError.message);

  return { avatarUrl, idPath };
}

export function creatorApplicationComplete(profile: {
  avatar_url: string | null;
  id_document_path: string | null;
  instagram_handle: string | null;
}) {
  return Boolean(
    profile.avatar_url && profile.id_document_path && profile.instagram_handle,
  );
}
