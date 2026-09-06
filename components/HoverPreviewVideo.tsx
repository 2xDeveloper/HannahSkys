"use client";

import { MediaWatermark } from "@/components/MediaWatermark";
import { useEffect, useRef } from "react";

type HoverPreviewVideoProps = {
  src: string;
  className?: string;
  blurClass?: string;
  poster?: string;
  watermark?: boolean;
};

/** Public video teaser — always autoplays, muted, no play button. */
export function HoverPreviewVideo({
  src,
  className = "",
  blurClass = "",
  poster,
  watermark = true,
}: HoverPreviewVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    el.muted = true;
    el.defaultMuted = true;
    el.volume = 0;
    el.playsInline = true;
    el.setAttribute("playsinline", "");
    el.setAttribute("webkit-playsinline", "");
    el.setAttribute("muted", "");

    const play = () => {
      el.muted = true;
      void el.play().catch(() => {
        /* iOS may block until the next user gesture; retry after load / tap. */
      });
    };

    play();
    const timers = [80, 300, 900].map((ms) => window.setTimeout(play, ms));
    el.addEventListener("loadeddata", play);
    el.addEventListener("canplay", play);
    el.addEventListener("canplaythrough", play);
    document.addEventListener("touchstart", play, { passive: true });
    document.addEventListener("click", play);

    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      el.removeEventListener("loadeddata", play);
      el.removeEventListener("canplay", play);
      el.removeEventListener("canplaythrough", play);
      document.removeEventListener("touchstart", play);
      document.removeEventListener("click", play);
    };
  }, [src]);

  return (
    <div className="absolute inset-0">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        muted
        autoPlay
        loop
        playsInline
        preload="auto"
        controls={false}
        disablePictureInPicture
        disableRemotePlayback
        className={`preview-autoplay h-full w-full object-cover ${className} ${blurClass}`}
      />
      {watermark ? <MediaWatermark /> : null}
    </div>
  );
}
