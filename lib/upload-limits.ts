/** Match supabase/migration-bucket-video-limit.sql (2GB for long iPhone videos). */
export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024 * 1024;

export function maxUploadLabel(): string {
  return "2 GB";
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function isOverUploadLimit(bytes: number): boolean {
  return bytes > MAX_UPLOAD_BYTES;
}

/** Turn storage/DB errors into short messages fans/creators can act on. */
export function mapUploadErrorMessage(raw: string): string {
  const lower = raw.toLowerCase();

  if (
    lower.includes("maximum") ||
    lower.includes("too large") ||
    lower.includes("payload") ||
    lower.includes("entity too large") ||
    lower.includes("exceeded")
  ) {
    return `File is too large (max ${maxUploadLabel()}). Compress the video or upload a shorter clip.`;
  }

  if (lower.includes("row-level security") || lower.includes("policy")) {
    return "Upload was blocked. Make sure you're logged in as an approved creator.";
  }

  if (lower.includes("mime") || lower.includes("content type")) {
    return "That file type isn't supported. Use MP4, MOV, or a common image format.";
  }

  if (lower.includes("network") || lower.includes("fetch")) {
    return "Upload timed out. Try a smaller file or a stronger connection.";
  }

  if (
    lower.includes("schema cache") ||
    lower.includes("preview_storage_path") ||
    lower.includes("creator_content")
  ) {
    return "Upload is temporarily unavailable. Please try again later.";
  }

  if (raw.startsWith("Upload failed:")) {
    return mapUploadErrorMessage(raw.slice("Upload failed:".length).trim());
  }

  return raw || "Upload failed. Please try again.";
}
