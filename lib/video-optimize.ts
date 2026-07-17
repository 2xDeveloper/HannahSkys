import { fetchFile } from "@ffmpeg/util";
import {
  ensureWatermarkFont,
  extFromName,
  loadFfmpeg,
  type ProcessingProgress,
  videoWatermarkFilter,
} from "@/lib/ffmpeg-client";
import { isVideoFile } from "@/lib/types/content";
import { formatFileSize, isOverUploadLimit } from "@/lib/upload-limits";

export type OptimizeProgress = ProcessingProgress;
export const MAX_FULL_VIDEO_SECONDS = 10 * 60;
export const MAX_PREVIEW_SECONDS = 10;
export const OPTIMIZE_SUGGEST_BYTES = 80 * 1024 * 1024;

export type VideoMetadata = {
  durationSeconds: number;
  width: number;
  height: number;
};

export type OptimizeKind = "full" | "preview";

function extFromNameLocal(name: string): string {
  return extFromName(name);
}
export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0:00";
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function maxDurationForKind(kind: OptimizeKind): number {
  return kind === "preview" ? MAX_PREVIEW_SECONDS : MAX_FULL_VIDEO_SECONDS;
}

export function videoNeedsOptimization(
  file: File,
  durationSeconds: number | undefined,
  kind: OptimizeKind,
): boolean {
  if (!isVideoFile(file)) return false;
  if (isOverUploadLimit(file.size)) return true;
  if (file.size >= OPTIMIZE_SUGGEST_BYTES) return true;
  if (durationSeconds != null && durationSeconds > maxDurationForKind(kind)) return true;
  return false;
}

export function optimizationSummary(
  file: File,
  metadata: VideoMetadata | null,
  kind: OptimizeKind,
): string {
  const parts: string[] = [];
  const maxDur = maxDurationForKind(kind);

  if (metadata && metadata.durationSeconds > maxDur) {
    parts.push(`trim to ${formatDuration(maxDur)}`);
  }
  parts.push("720p");
  parts.push("smaller file size (still good quality)");

  return parts.join(", ");
}

export function getVideoMetadata(file: File): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      resolve({
        durationSeconds: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
      });
      URL.revokeObjectURL(url);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read video metadata."));
    };
    video.src = url;
  });
}

export async function optimizeVideoForUpload(
  file: File,
  kind: OptimizeKind,
  onProgress?: (p: OptimizeProgress) => void,
): Promise<File> {
  if (!isVideoFile(file)) {
    return file;
  }

  const metadata = await getVideoMetadata(file).catch(() => null);
  if (!videoNeedsOptimization(file, metadata?.durationSeconds, kind)) {
    return file;
  }

  onProgress?.({ percent: 2, message: "Loading video encoder…" });
  const ffmpeg = await loadFfmpeg(onProgress);
  await ensureWatermarkFont(ffmpeg);

  ffmpeg.on("progress", ({ progress }) => {
    const pct = Math.min(95, Math.round(5 + progress * 90));
    onProgress?.({ percent: pct, message: "Compressing video…" });
  });

  const inputName = `input.${extFromNameLocal(file.name)}`;
  const outputName = "output.mp4";
  const maxDuration = maxDurationForKind(kind);

  onProgress?.({ percent: 4, message: "Preparing your video…" });
  await ffmpeg.writeFile(inputName, await fetchFile(file));

  const args = [
    "-i",
    inputName,
    "-t",
    String(maxDuration),
    "-vf",
    videoWatermarkFilter(["scale=-2:720"]),
    "-c:v",
    "libx264",
    "-crf",
    "27",
    "-preset",
    "fast",
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    "-movflags",
    "+faststart",
    outputName,
  ];

  onProgress?.({ percent: 8, message: "Compressing video…" });
  await ffmpeg.exec(args);

  onProgress?.({ percent: 96, message: "Finishing…" });
  const data = await ffmpeg.readFile(outputName);
  const bytes =
    data instanceof Uint8Array ? data : new TextEncoder().encode(String(data));
  const blob = new Blob([new Uint8Array(bytes)], { type: "video/mp4" });

  await ffmpeg.deleteFile(inputName).catch(() => undefined);
  await ffmpeg.deleteFile(outputName).catch(() => undefined);

  const baseName = file.name.replace(/\.[^.]+$/, "") || "video";
  const optimized = new File([blob], `${baseName}-optimized.mp4`, {
    type: "video/mp4",
  });

  onProgress?.({
    percent: 100,
    message: `Done — ${formatFileSize(file.size)} → ${formatFileSize(optimized.size)}`,
  });

  return optimized;
}
