export type MediaType = "photo" | "video";

export type CreatorContent = {
  id: string;
  creator_id: string;
  title: string;
  media_type: MediaType;
  storage_path: string;
  preview_storage_path: string | null;
  price_cents: number | null;
  created_at: string;
  updated_at: string;
  creator_name?: string | null;
};

export function isFreeContent(item: Pick<CreatorContent, "price_cents">): boolean {
  return item.price_cents == null || item.price_cents === 0;
}

/** User-facing label for zero-price gallery content (replaces "Free"). */
export const COLLECT_LABEL = "Collect";

/** Creator uploaded a separate public teaser for paid content */
export function hasDedicatedPreview(
  item: Pick<CreatorContent, "price_cents" | "preview_storage_path">,
): boolean {
  if (isFreeContent(item)) return false;
  return Boolean(item.preview_storage_path?.trim());
}

/** Blur on gallery/profile when paid but no preview file was uploaded */
export function shouldBlurPublicMedia(
  item: Pick<CreatorContent, "price_cents" | "preview_storage_path">,
  options?: { owned?: boolean },
): boolean {
  if (isFreeContent(item)) return false;
  if (options?.owned) return false;
  return !hasDedicatedPreview(item);
}

/** Path used on home page, profiles, and purchase preview — never the paid full file */
export function getPublicDisplayPath(item: CreatorContent): string {
  if (isFreeContent(item)) {
    return item.storage_path;
  }
  return item.preview_storage_path ?? item.storage_path;
}

const VIDEO_EXTENSIONS = new Set(["mp4", "webm", "mov", "m4v", "ogg", "ogv"]);

/** Infer photo vs video from a storage path extension */
export function mediaTypeFromStoragePath(path: string): MediaType {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  return VIDEO_EXTENSIONS.has(ext) ? "video" : "photo";
}

/** What to render on gallery/profile before purchase */
export function getPublicDisplayMediaType(item: CreatorContent): MediaType {
  if (isFreeContent(item)) {
    return item.media_type;
  }
  if (hasDedicatedPreview(item) && item.preview_storage_path) {
    return mediaTypeFromStoragePath(item.preview_storage_path);
  }
  return item.media_type;
}

/** Tailwind classes to hide paid full media on public surfaces */
export function publicMediaBlurClass(
  item: Pick<CreatorContent, "price_cents" | "preview_storage_path">,
  options?: { owned?: boolean },
): string {
  return shouldBlurPublicMedia(item, options)
    ? "scale-110 blur-2xl brightness-75 saturate-50"
    : "";
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

export function formatContentPrice(priceCents: number | null): string {
  if (isFreeContent({ price_cents: priceCents })) {
    return COLLECT_LABEL;
  }
  return `$${(priceCents! / 100).toFixed(2)}`;
}

export function priceToCents(dollars: string): number | null {
  const trimmed = dollars.trim();
  if (!trimmed) return null;
  const value = parseFloat(trimmed);
  if (Number.isNaN(value) || value < 0) return null;
  if (value === 0) return 0;
  return Math.round(value * 100);
}

export function mediaTypeFromFile(file: File): MediaType | null {
  if (file.type.startsWith("image/")) return "photo";
  if (file.type.startsWith("video/")) return "video";
  return null;
}
