import { CreatorAvatar } from "@/components/CreatorAvatar";
import { getApprovedCreators } from "@/lib/creators";
import Link from "next/link";
import { Logo } from "./Logo";

export async function Sidebar() {
  const creators = await getApprovedCreators();

  return (
    <aside className="flex w-[220px] shrink-0 flex-col border-r border-bp-border bg-bp-sidebar">
      <div className="border-b border-bp-border px-4 py-4">
        <Logo size="sm" linkToHome />
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-3 py-4">
        <h2 className="mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-rose-300/50">
          Featured Creators
        </h2>
        <nav className="min-h-0 flex-1 overflow-y-auto pr-1">
          {creators.length === 0 ? (
            <p className="px-2 py-3 text-xs leading-relaxed text-gray-500">
              No approved creators yet. Creators appear here after admin approval.
            </p>
          ) : (
            <ul className="space-y-0.5">
              {creators.map((creator) => (
                <li key={creator.id}>
                  <Link
                    href={`/creator/${creator.id}`}
                    className="group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-bp-chip"
                  >
                    <span className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full bg-bp-chip ring-1 ring-bp-border">
                      <CreatorAvatar src={creator.avatarUrl} name={creator.name} />
                    </span>
                    <span className="flex min-w-0 flex-1 items-center gap-2">
                      <span className="truncate text-sm font-medium text-bp-yellow group-hover:text-rose-100">
                        {creator.name}
                      </span>
                      {creator.isNew && (
                        <span className="shrink-0 rounded bg-bp-gold px-1 py-px text-[9px] font-bold uppercase text-white">
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

      <div className="space-y-2 border-t border-bp-border p-3">
        <SidebarAction
          icon="👥"
          label="Community"
          href="https://t.me/fandomvids"
        />
        <SidebarAction icon="❓" label="Support" href="https://t.me/fandomvids" />
      </div>
    </aside>
  );
}

function SidebarAction({
  icon,
  label,
  href,
}: {
  icon: string;
  label: string;
  href?: string;
}) {
  const className =
    "flex w-full items-center gap-2 rounded-lg bg-bp-chip px-3 py-2.5 text-sm text-gray-200 transition-colors hover:bg-bp-chip-hover";

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        <span className="text-base">{icon}</span>
        <span>{label}</span>
      </a>
    );
  }

  return (
    <button type="button" className={className}>
      <span className="text-base">{icon}</span>
      <span>{label}</span>
    </button>
  );
}
