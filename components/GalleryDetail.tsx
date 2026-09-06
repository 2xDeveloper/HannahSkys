import { HoverPreviewVideo } from "@/components/HoverPreviewVideo";
import { MediaWatermark } from "@/components/MediaWatermark";
import { PurchaseButton } from "@/components/PurchaseButton";
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

type GalleryDetailProps = {
  item: CreatorContent;
  /** Public teaser only — never the paid full file unless owned */
  previewUrl: string;
  /** Full file URL — free content or purchased paid content */
  fullUrl?: string | null;
  owned?: boolean;
  justPurchased?: boolean;
  checkoutError?: string | null;
};

export function GalleryDetail({
  item,
  previewUrl,
  fullUrl,
  owned = false,
  justPurchased = false,
  checkoutError = null,
}: GalleryDetailProps) {
  const typeLabel = item.media_type === "video" ? "Video" : "Photo";
  const free = isFreeContent(item);
  const unlocked = free || owned;
  const creatorName = item.creator_name ?? "Creator";
  const viewUrl = unlocked && fullUrl ? fullUrl : previewUrl;
  const displayMediaType = unlocked ? item.media_type : getPublicDisplayMediaType(item);
  const isVideoDisplay = displayMediaType === "video";
  const lockedBlur = !unlocked && shouldBlurPublicMedia(item);
  const blurClass = !unlocked ? publicMediaBlurClass(item) : "";

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-transparent">
      <div className="app-detail-bar sticky top-0 z-10 px-4 py-3 backdrop-blur-xl md:px-6">
        <Link
          href="/gallery"
          className="app-detail-back inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors"
        >
          <span aria-hidden className="text-base">
            ←
          </span>
          Back to the collection
        </Link>
      </div>

      {checkoutError && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-800 md:px-6">
          {checkoutError}
        </div>
      )}

      {justPurchased && (
        <div className="border-b border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm text-emerald-800 md:px-6">
          Purchase complete — full {item.media_type} unlocked.{" "}
          <Link href="/library" className="font-semibold text-emerald-900 underline hover:text-emerald-700">
            Open your library →
          </Link>
        </div>
      )}

      <div className="mx-auto w-full max-w-5xl px-4 py-6 md:px-8 md:py-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,340px)_1fr] lg:gap-10 lg:items-start">
          <div className="mx-auto w-full max-w-[340px] lg:mx-0">
            <div className="app-detail-media overflow-hidden rounded-3xl">
              <div className="relative aspect-[3/4] w-full max-h-[460px] bg-[#ffe6ef]">
                {isVideoDisplay && !unlocked ? (
                  <HoverPreviewVideo src={viewUrl} blurClass={blurClass} />
                ) : isVideoDisplay ? (
                  <>
                    <video
                      src={viewUrl}
                      controls
                      playsInline
                      preload="metadata"
                      className="h-full w-full object-cover"
                    />
                    <MediaWatermark />
                  </>
                ) : (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={viewUrl}
                      alt={unlocked ? item.title : `Preview: ${item.title}`}
                      className={`h-full w-full object-cover object-top ${blurClass}`}
                    />
                    <MediaWatermark />
                  </>
                )}
                {!unlocked && (
                  <>
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/55 to-transparent" />
                    <span className="absolute left-3 top-3 rounded-full bg-[#f4699f] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                      {lockedBlur ? "Sneak peek" : "Preview only"}
                    </span>
                    <span className="absolute bottom-3 left-3 right-3 text-center text-[11px] font-medium text-white/90">
                      Full {item.media_type} unlocks after purchase
                    </span>
                  </>
                )}
                {free && (
                  <span className="absolute left-3 top-3 rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                    {COLLECT_LABEL}
                  </span>
                )}
                {owned && !free && (
                  <span className="absolute left-3 top-3 rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                    Purchased
                  </span>
                )}
              </div>
              <p className="app-detail-caption px-4 py-3 text-center text-xs leading-relaxed">
                {unlocked
                  ? free
                    ? "Collect this content — full file shown on the gallery."
                    : "You own this content — full file shown above."
                  : "This is the public preview buyers see before paying. The full file stays locked until purchase."}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <header className="space-y-3 border-b border-[#fdeaf1] pb-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="app-detail-chip rounded-full px-3 py-1 text-xs font-semibold">
                  {typeLabel}
                </span>
                {free ? (
                  <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white">
                    {COLLECT_LABEL}
                  </span>
                ) : owned ? (
                  <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white">
                    Owned
                  </span>
                ) : (
                  <span className="app-detail-chip rounded-full px-3 py-1 text-xs font-bold">
                    Paid · preview shown
                  </span>
                )}
              </div>
              <h1 className="app-detail-title font-display text-2xl font-extrabold md:text-3xl">
                {item.title}
              </h1>
              <p className="text-sm text-[#8a8390]">
                by{" "}
                <Link
                  href={`/creator/${item.creator_id}`}
                  className="font-medium text-[#f4699f] hover:text-[#ef4f8f]"
                >
                  {creatorName}
                </Link>
              </p>
            </header>

            <section className="app-detail-panel rounded-3xl p-5 md:p-6">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#f4699f]">
                {unlocked ? "What you get" : "After purchase"}
              </h2>
              <ul className="mt-4 space-y-2.5 text-sm text-[#55505c]">
                <li className="flex gap-2">
                  <span className="text-[#f4699f]">✓</span>
                  {unlocked
                    ? `Full ${item.media_type === "video" ? "video" : "photo"} access now`
                    : `Full ${item.media_type === "video" ? "HD video" : "high-resolution photo"} (not shown publicly)`}
                </li>
                <li className="flex gap-2">
                  <span className="text-[#f4699f]">✓</span>
                  {unlocked ? "Saved in your library" : "Instant access after checkout"}
                </li>
              </ul>
              <div className="mt-6 flex items-baseline gap-2 border-t border-[#fdeaf1] pt-5">
                <span className="text-3xl font-bold text-[#3f3a44]">
                  {formatContentPrice(item.price_cents)}
                </span>
                {!free && <span className="text-sm text-[#8a8390]">USD</span>}
              </div>
            </section>

            {!free && !owned && (
              <div className="app-detail-buy rounded-3xl p-5">
                <PurchaseButton item={item} />
                <p className="mt-4 text-center text-[11px] text-[#8a8390]">
                  Secure checkout via Stripe
                </p>
              </div>
            )}

            {owned && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <PurchaseButton item={item} owned />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
