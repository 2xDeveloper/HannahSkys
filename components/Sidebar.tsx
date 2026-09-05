import { CreatorAvatar } from "@/components/CreatorAvatar";
import { getApprovedCreators } from "@/lib/creators";
import Link from "next/link";
import { Logo } from "./Logo";

export async function Sidebar() {
  const creators = await getApprovedCreators();

  return (
    <aside className="flex h-full w-full flex-col bg-transparent">
      <div className="hidden border-b border-bp-border/60 px-4 py-5 md:block">
        <Logo size="sm" linkToHome />
        <p className="mt-2 text-[11px] font-medium text-bp-yellow/70">
          Exclusive world
        </p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-3 py-4">
        <h2 className="mb-3 px-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-bp-yellow/55">
          Featured
        </h2>
        <nav className="min-h-0 flex-1 overflow-y-auto pr-1">
          {creators.length === 0 ? (
            <p className="px-2 py-3 text-xs leading-relaxed text-gray-500">
              New faces appear here after they&apos;re approved.
            </p>
          ) : (
            <ul className="space-y-0.5">
              {creators.map((creator) => (
                <li key={creator.id}>
                  <Link
                    href={`/creator/${creator.id}`}
                    className="group flex w-full items-center gap-2.5 rounded-full px-2 py-1.5 text-left transition-all duration-300 hover:bg-bp-chip hover:shadow-[0_0_20px_rgba(255,90,154,0.12)]"
                  >
                    <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-bp-chip ring-1 ring-bp-gold/30 transition-transform duration-300 group-hover:scale-105">
                      <CreatorAvatar src={creator.avatarUrl} name={creator.name} />
                    </span>
                    <span className="flex min-w-0 flex-1 items-center gap-2">
                      <span className="truncate text-sm font-medium text-bp-yellow group-hover:text-white">
                        {creator.name}
                      </span>
                      {creator.isNew && (
                        <span className="shrink-0 rounded-full bg-bp-gold px-1.5 py-px text-[9px] font-bold uppercase tracking-wide text-white shadow-[0_0_12px_rgba(255,90,154,0.45)]">
                          New
                        </span>
                      )}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </nav>
      </div>

      <div className="space-y-2 border-t border-bp-border/60 p-3">
        <SidebarAction icon="♡" label="Terms" href="/terms" internal />
        <SidebarAction icon="✦" label="Community" href="https://t.me/fandomvids" />
        <SidebarAction icon="?" label="Support" href="https://t.me/fandomvids" />
      </div>
    </aside>
  );
}

function SidebarAction({
  icon,
  label,
  href,
  internal = false,
}: {
  icon: string;
  label: string;
  href?: string;
  internal?: boolean;
}) {
  const className =
    "flex w-full items-center gap-2 rounded-full border border-white/5 bg-bp-chip/80 px-3 py-2.5 text-sm text-gray-200 transition-all duration-300 hover:border-bp-gold/30 hover:bg-bp-chip-hover hover:text-white";

  if (href && internal) {
    return (
      <Link href={href} className={className}>
        <span className="text-base text-bp-gold">{icon}</span>
        <span>{label}</span>
      </Link>
    );
  }

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        <span className="text-base text-bp-gold">{icon}</span>
        <span>{label}</span>
      </a>
    );
  }

  return (
    <button type="button" className={className}>
      <span className="text-base text-bp-gold">{icon}</span>
      <span>{label}</span>
    </button>
  );
}
