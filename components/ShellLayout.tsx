"use client";

import { HeaderAuth } from "@/components/HeaderAuth";
import { Logo } from "@/components/Logo";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type ShellLayoutProps = {
  sidebar: React.ReactNode;
  children: React.ReactNode;
  mainClassName?: string;
};

export function ShellLayout({ sidebar, children, mainClassName }: ShellLayoutProps) {
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
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-bp-black">
      <header className="relative z-30 flex h-14 shrink-0 items-center justify-center border-b border-bp-border bg-bp-black px-14 shadow-[0_1px_0_0_rgba(196,30,58,0.15)] md:px-4">
        <button
          type="button"
          onClick={() => setSidebarOpen((open) => !open)}
          className="absolute left-3 flex h-9 w-9 items-center justify-center rounded-lg text-bp-yellow hover:bg-bp-chip md:hidden"
          aria-label={sidebarOpen ? "Close menu" : "Open menu"}
          aria-expanded={sidebarOpen}
        >
          <span className="text-xl leading-none">{sidebarOpen ? "✕" : "☰"}</span>
        </button>
        <Logo linkToHome className="max-w-[calc(100%-8rem)] truncate text-center" />
        <HeaderAuth />
      </header>

      <div className="relative flex min-h-0 flex-1">
        {sidebarOpen && (
          <button
            type="button"
            className="fixed inset-0 top-14 z-40 bg-black/70 md:hidden"
            aria-label="Close menu"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div
          className={`fixed bottom-0 left-0 top-14 z-50 w-[min(280px,88vw)] transform border-r border-bp-border bg-bp-sidebar transition-transform duration-200 ease-out md:static md:top-auto md:z-auto md:w-[220px] md:shrink-0 md:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col overflow-hidden">{sidebar}</div>
        </div>

        <main
          className={`flex min-w-0 flex-1 flex-col overflow-hidden bg-bp-main ${mainClassName ?? ""}`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
