import { HoverPreviewVideo } from "@/components/HoverPreviewVideo";
import { MediaWatermark } from "@/components/MediaWatermark";
import type { CreatorContent } from "@/lib/types/content";
import {
  COLLECT_LABEL,
  formatContentPrice,
  getPublicDisplayMediaType,
  isFreeContent,
  publicMediaBlurClass,
  shouldBlurPublicMedia,
} from "@/lib/types/content";
import Link from "next/link";

type ContentMediaThumbProps = {
  item: CreatorContent;
  displayUrl: string;
  href?: string;
  /** When set, shows this badge instead of Paid/Preview (e.g. library) */
  badge?: string;
};

export function ContentMediaThumb({
  item,
  displayUrl,
  href,
  badge,
}: ContentMediaThumbProps) {
  const creatorName = item.creator_name ?? "Creator";
  const priceLabel = formatContentPrice(item.price_cents);
  const free = isFreeContent(item);
  const owned = badge === "Owned";
  const lockedBlur = shouldBlurPublicMedia(item, { owned });
  const publicMediaType = getPublicDisplayMediaType(item);
  const fullMediaType = item.media_type;
  const showAsVideo =
    (free || owned ? fullMediaType : publicMediaType) === "video";
  const videoControls = (free || owned) && showAsVideo;
  const linkHref = href ?? `/gallery/${item.id}`;
  const blurClass = publicMediaBlurClass(item, { owned });

  return (
    <article className="app-thumb group overflow-hidden rounded-2xl ring-1 ring-[#fbdce7] transition-all duration-500 hover:-translate-y-1 hover:ring-[#f4699f]/40 hover:shadow-[0_16px_36px_rgba(244,105,159,0.16)]">
      <Link href={linkHref} className="block">
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#ffe6ef]">
          {showAsVideo && !videoControls ? (
            <HoverPreviewVideo src={displayUrl} blurClass={blurClass} />
          ) : showAsVideo ? (
            <>
              <video
                src={displayUrl}
                muted
                playsInline
                preload="metadata"
                controls
                className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${blurClass}`}
              />
              <MediaWatermark compact />
            </>
          ) : (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={displayUrl}
                alt={item.title}
                className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${blurClass} ${
                  !free && !owned && !lockedBlur ? "scale-105" : ""
                }`}
                loading="lazy"
              />
              <MediaWatermark compact />
            </>
          )}
          {!free && !owned && (
            <>
              <div className="pointer-events-none absolute inset-0 bg-black/10" />
              <span className="pointer-events-none absolute left-2 top-2 rounded-full bg-bp-gold px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                {lockedBlur ? "Sneak peek" : "Preview"}
              </span>
            </>
          )}
          <span className="pointer-events-none absolute bottom-2 right-2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
            {showAsVideo && (free || owned)
              ? "Video"
              : showAsVideo
                ? "Video"
                : free || owned
                  ? "Photo"
                  : "Photo"}
          </span>
          {owned && (
            <span className="pointer-events-none absolute left-2 top-2 rounded-full bg-emerald-700 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
              Owned
            </span>
          )}
          {free && !owned && (
            <span className="pointer-events-none absolute left-2 top-2 rounded-full bg-emerald-700 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
              {COLLECT_LABEL}
            </span>
          )}
        </div>
      </Link>
      <div className="px-2 py-2">
        <Link href={linkHref} className="block">
          <p className="app-thumb-title truncate text-xs font-medium">
            {item.title}
          </p>
        </Link>
        <Link
          href={`/creator/${item.creator_id}`}
          className="block truncate text-[10px] text-[#8a8390] hover:text-[#f4699f]"
        >
          {creatorName}
        </Link>
        <p
          className={`mt-0.5 text-[10px] font-medium ${free ? "text-emerald-600" : "text-[#f4699f]"}`}
        >
          {priceLabel}
        </p>
      </div>
    </article>
  );
}
