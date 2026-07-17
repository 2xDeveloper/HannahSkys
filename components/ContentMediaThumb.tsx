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
  const isPreviewVideo = showAsVideo && !free && !owned && !lockedBlur;
  const videoControls = (free || owned) && showAsVideo;
  const linkHref = href ?? `/gallery/${item.id}`;
  const blurClass = publicMediaBlurClass(item, { owned });

  return (
    <article className="group overflow-hidden rounded-lg bg-bp-panel ring-1 ring-bp-border transition-transform hover:scale-[1.02] hover:ring-bp-gold-dim">
      <Link href={linkHref} className="block">
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-bp-chip">
          {isPreviewVideo ? (
            <HoverPreviewVideo src={displayUrl} blurClass={blurClass} />
          ) : showAsVideo ? (
            <>
              <video
                src={displayUrl}
                muted
                playsInline
                preload="metadata"
                controls={videoControls}
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
              <div className={`absolute inset-0 pointer-events-none ${lockedBlur ? "bg-black/40" : "bg-black/20"}`} />
              <span className="pointer-events-none absolute left-2 top-2 rounded bg-bp-gold px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
                Paid
              </span>
              {!isPreviewVideo && (
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <span className="rounded-full bg-black/60 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
                    {lockedBlur ? "Locked" : publicMediaType === "video" ? "Video preview" : "Preview"}
                  </span>
                </span>
              )}
            </>
          )}
          <span className="pointer-events-none absolute bottom-2 right-2 rounded bg-black/75 px-1.5 py-0.5 text-[10px] font-medium text-white">
            {showAsVideo && (free || owned)
              ? "Video"
              : showAsVideo
                ? "Video"
                : free || owned
                  ? "Photo"
                  : lockedBlur
                    ? "Unlock"
                    : "Photo"}
          </span>
          {owned && (
            <span className="pointer-events-none absolute left-2 top-2 rounded bg-emerald-700 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
              Owned
            </span>
          )}
          {free && !owned && (
            <span className="pointer-events-none absolute left-2 top-2 rounded bg-emerald-700 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
              {COLLECT_LABEL}
            </span>
          )}
        </div>
      </Link>
      <div className="px-2 py-2">
        <Link href={linkHref} className="block">
          <p className="truncate text-xs font-medium text-white hover:text-bp-yellow">
            {item.title}
          </p>
        </Link>
        <Link
          href={`/creator/${item.creator_id}`}
          className="block truncate text-[10px] text-gray-500 hover:text-bp-yellow"
        >
          {creatorName}
        </Link>
        <p
          className={`mt-0.5 text-[10px] font-medium ${free ? "text-emerald-400" : "text-bp-yellow"}`}
        >
          {priceLabel}
        </p>
      </div>
    </article>
  );
}
