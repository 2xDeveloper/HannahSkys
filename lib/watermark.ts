import { fetchFile } from "@ffmpeg/util";
import {
  ensureWatermarkFont,
  extFromName,
  loadFfmpeg,
  type ProcessingProgress,
  videoWatermarkFilter,
} from "@/lib/ffmpeg-client";
import { isVideoFile, mediaTypeFromFile } from "@/lib/types/content";
import { formatFileSize } from "@/lib/upload-limits";
import {
  optimizeVideoForUpload,
  type OptimizeKind,
  type VideoMetadata,
  videoNeedsOptimization,
} from "@/lib/video-optimize";

export const WATERMARK_BRAND = "FindomVids";
export const WATERMARK_SITE = "findomvids.xyz";

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load image."));
    img.src = url;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Could not encode image."))),
      type,
      quality,
    );
  });
}

function drawImageWatermark(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const short = Math.min(width, height);
  const mainSize = Math.max(14, Math.round(short / 14));
  const subSize = Math.max(9, Math.round(short / 28));
  const cornerSize = Math.max(8, Math.round(short / 32));

  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.rotate((-22 * Math.PI) / 180);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `bold ${mainSize}px system-ui, -apple-system, sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.strokeStyle = "rgba(0,0,0,0.45)";
  ctx.lineWidth = Math.max(1, mainSize / 14);
  ctx.strokeText(WATERMARK_BRAND.toUpperCase(), 0, -subSize * 0.6);
  ctx.fillText(WATERMARK_BRAND.toUpperCase(), 0, -subSize * 0.6);
  ctx.font = `600 ${subSize}px system-ui, -apple-system, sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.fillText(WATERMARK_SITE, 0, subSize * 0.9);
  ctx.restore();

  const pad = Math.max(8, short / 40);
  const badgeW = cornerSize * 5.8;
  const badgeH = cornerSize + pad;
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(pad, height - badgeH - pad, badgeW, badgeH);
  ctx.font = `bold ${cornerSize}px system-ui, -apple-system, sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(WATERMARK_BRAND.toUpperCase(), pad + 4, height - badgeH - pad + 4);
}

export async function watermarkImageFile(file: File): Promise<File> {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not prepare image watermark.");

    ctx.drawImage(img, 0, 0);
    drawImageWatermark(ctx, canvas.width, canvas.height);

    const outputType =
      file.type === "image/png" || file.type === "image/webp" ? file.type : "image/jpeg";
    const quality = outputType === "image/jpeg" ? 0.92 : 0.95;
    const blob = await canvasToBlob(canvas, outputType, quality);
    const ext = outputType === "image/png" ? "png" : outputType === "image/webp" ? "webp" : "jpg";
    const baseName = file.name.replace(/\.[^.]+$/, "") || "photo";

    return new File([blob], `${baseName}-wm.${ext}`, { type: outputType });
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function readFfmpegOutput(data: Uint8Array | string): Promise<Blob> {
  const bytes = data instanceof Uint8Array ? data : new TextEncoder().encode(String(data));
  return new Blob([new Uint8Array(bytes)], { type: "video/mp4" });
}

export async function watermarkVideoFile(
  file: File,
  onProgress?: (p: ProcessingProgress) => void,
): Promise<File> {
  onProgress?.({ percent: 2, message: "Applying video watermark…" });
  const ffmpeg = await loadFfmpeg(onProgress);
  await ensureWatermarkFont(ffmpeg);

  ffmpeg.on("progress", ({ progress }) => {
    const pct = Math.min(95, Math.round(10 + progress * 85));
    onProgress?.({ percent: pct, message: "Burning watermark into video…" });
  });

  const inputName = `input.${extFromName(file.name)}`;
  const outputName = "output-wm.mp4";

  await ffmpeg.writeFile(inputName, await fetchFile(file));

  await ffmpeg.exec([
    "-i",
    inputName,
    "-vf",
    videoWatermarkFilter(),
    "-c:v",
    "libx264",
    "-crf",
    "23",
    "-preset",
    "fast",
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    "-movflags",
    "+faststart",
    outputName,
  ]);

  const data = await ffmpeg.readFile(outputName);
  const blob = await readFfmpegOutput(
    data instanceof Uint8Array ? data : new TextEncoder().encode(String(data)),
  );

  await ffmpeg.deleteFile(inputName).catch(() => undefined);
  await ffmpeg.deleteFile(outputName).catch(() => undefined);

  const baseName = file.name.replace(/\.[^.]+$/, "") || "video";
  const watermarked = new File([blob], `${baseName}-wm.mp4`, { type: "video/mp4" });

  onProgress?.({
    percent: 100,
    message: `Watermarked — ${formatFileSize(watermarked.size)}`,
  });

  return watermarked;
}

/** Bake watermark into uploaded media so it persists on save/download. */
export async function applyWatermarkToFile(
  file: File,
  onProgress?: (p: ProcessingProgress) => void,
): Promise<File> {
  const mediaType = mediaTypeFromFile(file);
  if (mediaType === "photo") {
    onProgress?.({ percent: 50, message: "Applying photo watermark…" });
    const result = await watermarkImageFile(file);
    onProgress?.({ percent: 100, message: "Watermark applied" });
    return result;
  }
  if (isVideoFile(file)) {
    return watermarkVideoFile(file, onProgress);
  }
  return file;
}

/** Shorten/compress when needed, always bake watermark into stored files. */
export async function prepareMediaForUpload(
  file: File,
  kind: OptimizeKind,
  options: {
    autoOptimize: boolean;
    metadata: VideoMetadata | null;
    wasOptimized: boolean;
  },
  onProgress?: (p: ProcessingProgress) => void,
): Promise<File> {
  if (isVideoFile(file)) {
    const needsOptimize = videoNeedsOptimization(
      file,
      options.metadata?.durationSeconds,
      kind,
    );
    if (options.autoOptimize && needsOptimize && !options.wasOptimized) {
      return optimizeVideoForUpload(file, kind, onProgress);
    }
    if (options.wasOptimized) {
      return file;
    }
    return watermarkVideoFile(file, onProgress);
  }

  if (mediaTypeFromFile(file) === "photo") {
    return watermarkImageFile(file);
  }

  return file;
}
