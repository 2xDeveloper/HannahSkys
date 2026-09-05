"use client";

import { HeaderAuth } from "@/components/HeaderAuth";
import { Logo } from "@/components/Logo";
import type { HeaderAuthState } from "@/lib/auth/header-user";
import Link from "next/link";

type MessagesShellProps = {
  children: React.ReactNode;
  headerAuth?: HeaderAuthState | null;
};

/** Full-height Telegram-style chat shell */
export function MessagesShell({ children, headerAuth = null }: MessagesShellProps) {
  return (
    <div className="app-light flex h-[100dvh] flex-col overflow-hidden">
      <header className="app-header relative z-30 flex h-16 shrink-0 items-center px-3 backdrop-blur-xl sm:px-4">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <Link
            href="/gallery"
            className="app-link hidden rounded-full px-2.5 py-1 text-sm sm:inline"
          >
            ← Gallery
          </Link>
          <Logo tone="light" linkToHome className="truncate sm:hidden" />
          <div className="hidden h-4 w-px bg-[#fbdce7] sm:block" />
          <h1 className="app-heading truncate text-[15px] font-semibold tracking-tight">
            Messages
          </h1>
        </div>
        <HeaderAuth initialAuth={headerAuth} />
      </header>
      <main className="flex min-h-0 flex-1 flex-col">{children}</main>
    </div>
  );
}
