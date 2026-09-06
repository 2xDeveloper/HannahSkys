"use client";

import { HeaderAuth } from "@/components/HeaderAuth";
import { Logo } from "@/components/Logo";
import type { HeaderAuthState } from "@/lib/auth/header-user";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type ShellLayoutProps = {
  sidebar: React.ReactNode;
  children: React.ReactNode;
  mainClassName?: string;
  headerAuth?: HeaderAuthState | null;
};

export function ShellLayout({ sidebar, children, mainClassName, headerAuth = null }: ShellLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  return (
    <div className="app-light flex h-[100dvh] flex-col overflow-hidden">
      <header className="app-header relative z-30 flex h-16 shrink-0 items-center justify-center px-14 backdrop-blur-xl md:px-4">
        <div className="app-header-rule pointer-events-none absolute inset-x-0 bottom-0 h-px" />
        <button
          type="button"
          onClick={() => setSidebarOpen((open) => !open)}
          className="app-menu-btn absolute left-3 flex h-10 w-10 items-center justify-center rounded-full transition-colors md:hidden"
          aria-label={sidebarOpen ? "Close menu" : "Open menu"}
          aria-expanded={sidebarOpen}
        >
          <span className="text-xl leading-none">{sidebarOpen ? "✕" : "☰"}</span>
        </button>
        <nav className="absolute left-14 flex items-center gap-2 md:left-4 md:pl-[230px] lg:gap-4">
          <Link
            href="/videos"
            className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-colors md:text-sm ${
              pathname.startsWith("/videos")
                ? "bg-[#f4699f] text-white"
                : "bg-[#fff0f5] text-[#f4699f] hover:bg-[#f4699f] hover:text-white"
            }`}
          >
            Categories
          </Link>
          <Link
            href="/gallery"
            className={`hidden text-sm font-medium transition-colors sm:inline ${
              pathname.startsWith("/gallery") ? "text-[#f4699f]" : "text-[#55505c] hover:text-[#f4699f]"
            }`}
          >
            Photos
          </Link>
        </nav>
        <Logo tone="light" linkToHome className="max-w-[calc(100%-8rem)] truncate text-center" />
        <HeaderAuth initialAuth={headerAuth} />
      </header>

      <div className="relative flex min-h-0 flex-1">
        {sidebarOpen && (
          <button
            type="button"
            className="app-overlay fixed inset-0 top-16 z-40 backdrop-blur-sm md:hidden"
            aria-label="Close menu"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div
          className={`app-sidebar-wrap fixed bottom-0 left-0 top-16 z-50 w-[min(280px,88vw)] transform transition-transform duration-300 ease-out md:static md:top-auto md:z-auto md:w-[230px] md:shrink-0 md:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col overflow-hidden">{sidebar}</div>
        </div>

        <main
          className={`app-main flex min-w-0 flex-1 flex-col overflow-hidden ${mainClassName ?? ""}`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
