import { CreatorAvatar } from "@/components/CreatorAvatar";
import { JoinMembershipButton } from "@/components/landing/JoinMembershipButton";
import { MediaWatermark } from "@/components/MediaWatermark";
import type { LandingContent, LandingMediaItem } from "@/lib/landing-content";
import { membershipPlans, navLinks, trustBadges } from "@/lib/landing-data";
import Link from "next/link";

const HERO_IMAGE = "/images/hannah-hero.png";

function Sparkle({ className = "" }: { className?: string }) {
  return (
    <span className={`landing-sparkle ${className}`} aria-hidden>
      ✦
    </span>
  );
}

function CrownIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M5 16h14l1.5-8-4.5 3L12 5 8 11 3.5 8 5 16zm-1 2h16v2H4v-2z" />
    </svg>
  );
}

function PlayIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M8 5v14l11-7L8 5z" />
    </svg>
  );
}

function TrustIcon({ name, className = "" }: { name: string; className?: string }) {
  const paths: Record<string, string> = {
    lock: "M12 1a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-1V6a5 5 0 0 0-5-5zm-3 8V6a3 3 0 0 1 6 0v3H9z",
    shield:
      "M12 2l8 3v6c0 5-3.4 9.4-8 11-4.6-1.6-8-6-8-11V5l8-3zm0 5.5l-1.2 2.6-2.8.3 2.1 1.9-.6 2.8L12 14.2l2.5 1.4-.6-2.8 2.1-1.9-2.8-.3L12 7.5z",
    diamond: "M12 2l6 6-6 14L6 8l6-6zm0 3.2L8.6 8.6 12 17l3.4-8.4L12 5.2z",
    heart:
      "M12 21s-8-4.7-8-10.2A4.8 4.8 0 0 1 12 7.6 4.8 4.8 0 0 1 20 10.8C20 16.3 12 21 12 21z",
  };

  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d={paths[name] ?? paths.heart} />
    </svg>
  );
}

function ChevronIcon({ dir }: { dir: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
      <path d={dir === "left" ? "M15 5l-7 7 7 7V5z" : "M9 5l7 7-7 7V5z"} />
    </svg>
  );
}

function MediaCard({ item, showPlayBadge }: { item: LandingMediaItem; showPlayBadge?: boolean }) {
  return (
    <Link href={item.href} className="landing-media-card">
      <div className="landing-media-thumb">
        {item.renderAsVideo ? (
          <video
            src={item.displayUrl}
            className={`landing-media-img ${item.locked ? "landing-media-locked" : ""}`}
            muted
            playsInline
            preload="metadata"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.displayUrl}
            alt={item.title}
            className={`landing-media-img ${item.locked ? "landing-media-locked" : ""}`}
            loading="lazy"
          />
        )}
        <MediaWatermark compact />
        <span className="landing-media-scrim" aria-hidden />
        {showPlayBadge && (
          <span className="landing-play-badge">
            <PlayIcon className="h-3.5 w-3.5" />
          </span>
        )}
        {item.locked && <span className="landing-media-lock">Locked</span>}
        <span className="landing-media-label">
          <span className="landing-media-title">{item.title}</span>
          <span className="landing-media-meta">
            {item.creatorName} · {item.priceLabel}
          </span>
        </span>
      </div>
    </Link>
  );
}

function EmptyPanel({ message }: { message: string }) {
  return (
    <div className="landing-empty">
      <Sparkle className="landing-sparkle-sm" />
      <p>{message}</p>
    </div>
  );
}

export function HannahSkysLanding({ content }: { content: LandingContent }) {
  const { photos, videos, models, photoCount, videoCount } = content;

  return (
    <div id="top" className="landing-page">
      <header className="landing-header">
        <Link href="/" className="landing-brand">
          <span className="landing-brand-script">
            HannahSkys<span className="landing-brand-star">✦</span>
          </span>
          <span className="landing-brand-sub">Exclusive Content</span>
        </Link>

        <nav className="landing-nav" aria-label="Main">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={
                link.href === "#top"
                  ? "landing-nav-link landing-nav-link-active"
                  : "landing-nav-link"
              }
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="landing-header-actions">
          <Link href="/login" className="landing-profile-btn" aria-label="Log in">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </Link>
          <Link href="/signup" className="landing-btn-primary">
            Join Now
            <CrownIcon className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="landing-hero">
        <div className="landing-hero-inner">
          <div className="landing-hero-copy">
            <p className="landing-eyebrow">
              Exclusive Photos &amp; Videos
              <span className="landing-eyebrow-line" aria-hidden />
              <span className="landing-eyebrow-heart" aria-hidden>
                ♡
              </span>
            </p>
            <h1 className="landing-hero-title">
              HannahSkys
              <Sparkle className="landing-hero-title-sparkle" />
            </h1>
            <p className="landing-hero-script">
              Real moments. Beautifully yours.
              <span className="landing-hero-script-heart" aria-hidden>
                ♡
              </span>
            </p>
            <p className="landing-hero-desc">
              Exclusive content you won&apos;t find anywhere else.
              <br />
              High quality photos and videos, created just for you.
            </p>
            <div className="landing-hero-ctas">
              <Link href="/signup" className="landing-btn-primary landing-btn-lg">
                Join Now
                <CrownIcon className="h-4 w-4" />
              </Link>
              <Link href="/gallery" className="landing-btn-outline landing-btn-lg">
                View Content
                <PlayIcon className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="landing-trust-row">
              {trustBadges.map((item) => (
                <div key={item.label} className="landing-trust-item">
                  <TrustIcon name={item.icon} className="landing-trust-icon" />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="landing-hero-visual">
            <p className="landing-hero-note">
              Thank you for supporting my journey!
            </p>
            <div className="landing-hero-photo-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={HERO_IMAGE}
                alt="HannahSkys"
                className="landing-hero-photo"
                width={620}
                height={800}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Content sections */}
      <section className="landing-body">
        <div className="landing-section-title">
          <Sparkle />
          <h2 className="landing-heading-serif">Explore My Exclusive Content</h2>
          <Sparkle />
        </div>

        <div className="landing-panel-row">
          <div id="photos" className="landing-panel">
            <div className="landing-panel-head">
              <h3 className="landing-panel-title">
                Featured Photos
                {photoCount > 0 && <span className="landing-panel-count">{photoCount}</span>}
              </h3>
              <Link href="/gallery" className="landing-panel-link">
                View All Photos →
              </Link>
            </div>
            <div className="landing-panel-body">
              {photos.length > 0 ? (
                <>
                  <span className="landing-arrow landing-arrow-left" aria-hidden>
                    <ChevronIcon dir="left" />
                  </span>
                  <div className="landing-card-grid">
                    {photos.map((item) => (
                      <MediaCard key={item.id} item={item} />
                    ))}
                  </div>
                  <span className="landing-arrow landing-arrow-right" aria-hidden>
                    <ChevronIcon dir="right" />
                  </span>
                </>
              ) : (
                <EmptyPanel message="New photo sets are being uploaded. Check back very soon!" />
              )}
            </div>
          </div>

          <div id="videos" className="landing-panel">
            <div className="landing-panel-head">
              <h3 className="landing-panel-title">
                Premium Videos
                {videoCount > 0 && <span className="landing-panel-count">{videoCount}</span>}
              </h3>
              <Link href="/gallery" className="landing-panel-link">
                View All Videos →
              </Link>
            </div>
            <div className="landing-panel-body">
              {videos.length > 0 ? (
                <>
                  <div className="landing-card-grid">
                    {videos.map((item) => (
                      <MediaCard key={item.id} item={item} showPlayBadge />
                    ))}
                  </div>
                  <span className="landing-arrow landing-arrow-right" aria-hidden>
                    <ChevronIcon dir="right" />
                  </span>
                </>
              ) : (
                <EmptyPanel message="New videos are on the way. Check back very soon!" />
              )}
            </div>
          </div>
        </div>

        <div className="landing-panel-row">
          <div id="membership" className="landing-panel">
            <div className="landing-panel-head landing-panel-head-center">
              <Sparkle className="landing-sparkle-sm" />
              <h3 className="landing-panel-title">Membership Plans</h3>
              <Sparkle className="landing-sparkle-sm" />
            </div>
            <div className="landing-plans">
              {membershipPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`landing-plan ${plan.popular ? "landing-plan-popular" : ""}`}
                >
                  {plan.popular && (
                    <span className="landing-plan-badge">
                      Most Popular <CrownIcon className="h-3 w-3" />
                    </span>
                  )}
                  <h4 className="landing-plan-name">{plan.name}</h4>
                  <p className="landing-plan-price">
                    {plan.priceLabel}
                    <span className="landing-plan-period">{plan.periodLabel}</span>
                  </p>
                  <ul className="landing-plan-features">
                    {plan.features.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                  <JoinMembershipButton planId={plan.id} />
                </div>
              ))}
            </div>
          </div>

          <div id="models" className="landing-panel">
            <div className="landing-panel-head">
              <div className="landing-panel-head-center landing-panel-head-grow">
                <Sparkle className="landing-sparkle-sm" />
                <h3 className="landing-panel-title">Meet the Models</h3>
                <Sparkle className="landing-sparkle-sm" />
              </div>
              <Link href="/gallery" className="landing-panel-link">
                Browse Everything →
              </Link>
            </div>
            {models.length > 0 ? (
              <div className="landing-models">
                {models.map((model) => (
                  <Link key={model.id} href={model.href} className="landing-model">
                    <span className="landing-model-avatar">
                      <CreatorAvatar src={model.avatarUrl} name={model.name} />
                    </span>
                    <span className="landing-model-info">
                      <span className="landing-model-name">
                        {model.name}
                        {model.isNew && <span className="landing-model-new">New</span>}
                      </span>
                      <span className="landing-model-meta">
                        {model.photoCount} photos · {model.videoCount} videos
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyPanel message="Models are being approved right now — they'll appear here shortly." />
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="landing-footer">
        <div className="landing-footer-main">
          <div className="landing-newsletter">
            <span className="landing-mail-icon" aria-hidden>
              ✉
            </span>
            <div>
              <h3 className="landing-footer-heading">Stay connected</h3>
              <p className="landing-footer-text">
                Get updates on new content, special offers, and more!
              </p>
            </div>
            <form className="landing-newsletter-form" action="#" method="post">
              <input
                type="email"
                placeholder="Enter your email"
                className="landing-input"
                aria-label="Email address"
              />
              <button type="submit" className="landing-btn-primary">
                Subscribe
              </button>
            </form>
          </div>

          <div className="landing-social">
            <h3 className="landing-footer-heading">Let&apos;s connect</h3>
            <p className="landing-footer-text">Follow me on social media</p>
            <div className="landing-social-icons">
              {["Instagram", "X", "TikTok", "Reddit", "More"].map((label) => (
                <a
                  key={label}
                  href="https://t.me/fandomvids"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="landing-social-btn"
                  aria-label={label}
                >
                  {label[0]}
                </a>
              ))}
            </div>
          </div>

          <div className="landing-thanks">
            <p className="landing-thanks-script">Thank you for being here! ♡</p>
            <div className="landing-thanks-avatar-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={HERO_IMAGE} alt="HannahSkys" className="landing-thanks-avatar" />
            </div>
          </div>
        </div>

        <div className="landing-footer-bar">
          <p>© {new Date().getFullYear()} HannahSkys. All rights reserved.</p>
          <div className="landing-footer-links">
            <Link href="/terms">Terms of Service</Link>
            <Link href="/terms">Privacy Policy</Link>
            <Link href="/terms">Refund Policy</Link>
          </div>
          <p>Made with ♡ for my VIPs</p>
        </div>
      </footer>
    </div>
  );
}
