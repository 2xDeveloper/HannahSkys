import { HoverPreviewVideo } from "@/components/HoverPreviewVideo";
import { VideoWatermark } from "@/components/VideoWatermark";
import { PurchaseButton } from "@/components/PurchaseButton";
import type { CreatorContent } from "@/lib/types/content";
import {
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
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-bp-main">
      <div className="sticky top-0 z-10 border-b border-bp-border bg-bp-main/95 px-4 py-3 backdrop-blur-sm md:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-medium text-bp-yellow transition-colors hover:bg-bp-chip hover:text-white"
        >
          <span aria-hidden className="text-base">
            ←
          </span>
          Back to gallery
        </Link>
      </div>

      {checkoutError && (
        <div className="border-b border-amber-900/50 bg-amber-950/40 px-4 py-3 text-center text-sm text-amber-200 md:px-6">
          {checkoutError}
        </div>
      )}

      {justPurchased && (
        <div className="border-b border-emerald-900/50 bg-emerald-950/40 px-4 py-3 text-center text-sm text-emerald-200 md:px-6">
          Purchase complete — full {item.media_type} unlocked.{" "}
          <Link href="/library" className="font-semibold text-white underline hover:text-emerald-100">
            Open your library →
          </Link>
        </div>
      )}

      <div className="mx-auto w-full max-w-5xl px-4 py-6 md:px-8 md:py-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,340px)_1fr] lg:gap-10 lg:items-start">
          <div className="mx-auto w-full max-w-[340px] lg:mx-0">
            <div className="overflow-hidden rounded-2xl border border-bp-border bg-bp-panel shadow-xl shadow-black/40">
              <div className="relative aspect-[3/4] w-full max-h-[460px] bg-bp-chip">
                {isVideoDisplay && !unlocked && !lockedBlur ? (
                  <HoverPreviewVideo src={viewUrl} blurClass={blurClass} />
                ) : isVideoDisplay ? (
                  <>
                    <video
                      src={viewUrl}
                      controls={unlocked}
                      muted={!unlocked}
                      playsInline
                      preload="metadata"
                      className={`h-full w-full object-cover ${unlocked ? "" : blurClass}`}
                    />
                    <VideoWatermark />
                  </>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={viewUrl}
                    alt={unlocked ? item.title : `Preview: ${item.title}`}
                    className={`h-full w-full object-cover object-top ${blurClass}`}
                  />
                )}
                {!unlocked && (
                  <>
                    <div
                      className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/30 ${lockedBlur ? "opacity-90" : ""}`}
                    />
                    <span className="absolute left-3 top-3 rounded-md bg-bp-gold px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                      {lockedBlur ? "Locked" : "Preview only"}
                    </span>
                    <span className="absolute bottom-3 left-3 right-3 text-center text-[11px] font-medium text-white/90">
                      Full {item.media_type} unlocks after purchase
                    </span>
                  </>
                )}
                {free && (
                  <span className="absolute left-3 top-3 rounded-md bg-emerald-800 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                    Free
                  </span>
                )}
                {owned && !free && (
                  <span className="absolute left-3 top-3 rounded-md bg-emerald-800 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                    Purchased
                  </span>
                )}
                {isVideoDisplay && unlocked && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-bp-gold/95 text-xl text-white shadow-lg ring-4 ring-black/30">
                      ▶
                    </span>
                  </div>
                )}
              </div>
              <p className="border-t border-bp-border px-4 py-3 text-center text-xs leading-relaxed text-gray-400">
                {unlocked
                  ? free
                    ? "This content is free to view in full."
                    : "You own this content — full file shown above."
                  : "This is the public preview buyers see before paying. The full file stays locked until purchase."}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <header className="space-y-3 border-b border-bp-border pb-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-bp-chip px-3 py-1 text-xs font-semibold text-bp-yellow">
                  {typeLabel}
                </span>
                {free ? (
                  <span className="rounded-full bg-emerald-800 px-3 py-1 text-xs font-bold text-white">
                    Free
                  </span>
                ) : owned ? (
                  <span className="rounded-full bg-emerald-800 px-3 py-1 text-xs font-bold text-white">
                    Owned
                  </span>
                ) : (
                  <span className="rounded-full bg-bp-gold/30 px-3 py-1 text-xs font-bold text-bp-yellow">
                    Paid · preview shown
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-rose-50 md:text-3xl">
                {item.title}
              </h1>
              <p className="text-sm text-gray-400">
                by{" "}
                <Link
                  href={`/creator/${item.creator_id}`}
                  className="font-medium text-bp-yellow hover:text-white"
                >
                  {creatorName}
                </Link>
              </p>
            </header>

            <section className="rounded-2xl border border-bp-border bg-bp-panel p-5 md:p-6">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-rose-300/70">
                {unlocked ? "What you get" : "After purchase"}
              </h2>
              <ul className="mt-4 space-y-2.5 text-sm text-gray-300">
                <li className="flex gap-2">
                  <span className="text-bp-gold">✓</span>
                  {unlocked
                    ? `Full ${item.media_type === "video" ? "video" : "photo"} access now`
                    : `Full ${item.media_type === "video" ? "HD video" : "high-resolution photo"} (not shown publicly)`}
                </li>
                <li className="flex gap-2">
                  <span className="text-bp-gold">✓</span>
                  {unlocked ? "Saved in your library" : "Instant access after checkout"}
                </li>
              </ul>
              <div className="mt-6 flex items-baseline gap-2 border-t border-bp-border pt-5">
                <span className="text-3xl font-bold text-white">
                  {formatContentPrice(item.price_cents)}
                </span>
                {!free && <span className="text-sm text-gray-500">USD</span>}
              </div>
            </section>

            {!free && !owned && (
              <div className="rounded-2xl border border-bp-gold/30 bg-bp-chip/50 p-5">
                <PurchaseButton item={item} />
                <p className="mt-4 text-center text-[11px] text-gray-500">
                  Secure checkout via Stripe
                </p>
              </div>
            )}

            {owned && (
              <div className="rounded-2xl border border-emerald-900/40 bg-emerald-950/20 p-5">
                <PurchaseButton item={item} owned />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
