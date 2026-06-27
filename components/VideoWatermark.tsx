export const VIDEO_WATERMARK_TEXT = "FindomVids";

type VideoWatermarkProps = {
  compact?: boolean;
};

/** Overlay shown on every in-app video player (previews and full playback). */
export function VideoWatermark({ compact = false }: VideoWatermarkProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-[2] overflow-hidden" aria-hidden>
      <div
        className={`absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 rotate-[-22deg] select-none flex-col items-center gap-1 ${
          compact ? "scale-[0.65]" : "scale-100"
        }`}
      >
        <span className="whitespace-nowrap text-base font-bold uppercase tracking-[0.18em] text-white/35 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] md:text-xl">
          {VIDEO_WATERMARK_TEXT}
        </span>
        <span className="whitespace-nowrap text-[9px] font-semibold uppercase tracking-[0.25em] text-white/25 md:text-[10px]">
          findomvids.xyz
        </span>
      </div>
      <span
        className={`absolute rounded bg-black/55 font-bold uppercase tracking-wide text-white/75 ${
          compact ? "bottom-1 left-1 px-1 py-px text-[7px]" : "bottom-2 left-2 px-1.5 py-0.5 text-[9px]"
        }`}
      >
        {VIDEO_WATERMARK_TEXT}
      </span>
    </div>
  );
}
