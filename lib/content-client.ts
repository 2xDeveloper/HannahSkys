import type { SupabaseClient } from "@supabase/supabase-js";
import type { CreatorContent, MediaType } from "@/lib/types/content";
import { mediaTypeFromFile } from "@/lib/types/content";

const BUCKET = "creator-media";

function extFromFile(file: File, fallback: string) {
  const parts = file.name.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : fallback;
}

export async function uploadCreatorContent(
  supabase: SupabaseClient,
  userId: string,
  title: string,
  fullFile: File,
  mediaType: MediaType,
  priceCents: number | null,
  previewFile?: File | null,
) {
  const isPaid = priceCents != null && priceCents > 0;

  if (isPaid) {
    if (!previewFile || !mediaTypeFromFile(previewFile)) {
      throw new Error("Paid content requires a preview photo or video for the gallery.");
    }
  }

  const contentId = crypto.randomUUID();
  const fullExt = extFromFile(fullFile, mediaType === "video" ? "mp4" : "jpg");
  const fullPath = `${userId}/${contentId}/full.${fullExt}`;

  const pathsToUpload: { path: string; file: File }[] = [
    { path: fullPath, file: fullFile },
  ];

  let previewPath: string | null = null;
  if (isPaid && previewFile) {
    const previewKind = mediaTypeFromFile(previewFile);
    const previewExt = extFromFile(previewFile, previewKind === "video" ? "mp4" : "jpg");
    previewPath = `${userId}/${contentId}/preview.${previewExt}`;
    pathsToUpload.unshift({ path: previewPath, file: previewFile });
  }

  for (const { path, file } of pathsToUpload) {
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { upsert: false, contentType: file.type });

    if (uploadError) {
      const uploaded = pathsToUpload.filter((p) => p.path !== path).map((p) => p.path);
      if (uploaded.length) await supabase.storage.from(BUCKET).remove(uploaded);
      throw new Error(`Upload failed: ${uploadError.message}`);
    }
  }

  const { data, error: insertError } = await supabase
    .from("creator_content")
    .insert({
      id: contentId,
      creator_id: userId,
      title: title.trim(),
      media_type: mediaType,
      storage_path: fullPath,
      preview_storage_path: previewPath,
      price_cents: priceCents,
    })
    .select()
    .single();

  if (insertError) {
    await supabase.storage.from(BUCKET).remove(pathsToUpload.map((p) => p.path));
    throw new Error(insertError.message);
  }

  return data as CreatorContent;
}

export async function deleteCreatorContent(
  supabase: SupabaseClient,
  contentId: string,
  storagePath: string,
  previewStoragePath?: string | null,
) {
  const { error: dbError } = await supabase.from("creator_content").delete().eq("id", contentId);

  if (dbError) {
    throw new Error(dbError.message);
  }

  const paths = [storagePath, previewStoragePath].filter(Boolean) as string[];
  if (paths.length) {
    await supabase.storage.from(BUCKET).remove(paths);
  }
}

export function getContentPublicUrlClient(supabase: SupabaseClient, storagePath: string) {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}
