"use client";

import { useRef, useState } from "react";

type HoverPreviewVideoProps = {
  src: string;
  className?: string;
  blurClass?: string;
};

/** Gallery preview: show first frame, play on hover with play button overlay. */
export function HoverPreviewVideo({ src, className = "", blurClass = "" }: HoverPreviewVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hovering, setHovering] = useState(false);
  const [playing, setPlaying] = useState(false);

  function handleEnter() {
    setHovering(true);
    const el = videoRef.current;
    if (!el) return;
    void el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }

  function handleLeave() {
    setHovering(false);
    setPlaying(false);
    const el = videoRef.current;
    if (!el) return;
    el.pause();
    el.currentTime = 0;
  }

  return (
    <div
      className="relative h-full w-full"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <video
        ref={videoRef}
        src={src}
        muted
        playsInline
        loop
        preload="metadata"
        className={`h-full w-full object-cover ${className} ${blurClass}`}
        onLoadedData={() => {
          const el = videoRef.current;
          if (el && !hovering) el.currentTime = 0.1;
        }}
      />
      {(!hovering || !playing) && (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/25">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/70 text-sm text-white shadow-lg ring-2 ring-white/30">
            ▶
          </span>
        </span>
      )}
      <span className="pointer-events-none absolute left-2 top-2 rounded bg-black/75 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
        Video
      </span>
    </div>
  );
}
