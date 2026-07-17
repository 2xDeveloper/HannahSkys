import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

export type ProcessingProgress = {
  percent: number;
  message: string;
};

let ffmpegLoadPromise: Promise<FFmpeg> | null = null;
let fontLoaded = false;

export async function loadFfmpeg(onProgress?: (p: ProcessingProgress) => void): Promise<FFmpeg> {
  if (ffmpegLoadPromise) return ffmpegLoadPromise;

  ffmpegLoadPromise = (async () => {
    onProgress?.({ percent: 0, message: "Loading video tools…" });
    const ffmpeg = new FFmpeg();
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
    });
    return ffmpeg;
  })();

  return ffmpegLoadPromise;
}

export async function ensureWatermarkFont(ffmpeg: FFmpeg): Promise<void> {
  if (fontLoaded) return;
  const fontData = await fetchFile(
    "https://cdn.jsdelivr.net/gh/googlefonts/roboto-2@main/src/hinted/Roboto-Bold.ttf",
  );
  await ffmpeg.writeFile("wm.ttf", fontData);
  fontLoaded = true;
}

/** Burned-in video watermark filter chain (requires wm.ttf in ffmpeg FS). */
export function videoWatermarkFilter(extraFilters: string[] = []): string {
  const watermark = [
    "drawtext=fontfile=wm.ttf:text='FindomVids':fontsize='min(h\\,w)/14':fontcolor=white@0.38:x=(w-text_w)/2:y=(h-text_h)/2-12:borderw=1:bordercolor=black@0.35",
    "drawtext=fontfile=wm.ttf:text='findomvids.xyz':fontsize='min(h\\,w)/28':fontcolor=white@0.28:x=(w-text_w)/2:y=(h-text_h)/2+18",
    "drawtext=fontfile=wm.ttf:text='FindomVids':fontsize='min(h\\,w)/32':fontcolor=white@0.55:x=12:y=h-th-12",
  ];
  return [...extraFilters, ...watermark].join(",");
}

export function extFromName(name: string): string {
  const parts = name.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "mp4";
}
