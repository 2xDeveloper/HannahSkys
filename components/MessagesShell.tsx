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
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-transparent">
      <header className="relative z-30 flex h-16 shrink-0 items-center border-b border-bp-border/70 bg-bp-black/55 px-3 shadow-[0_1px_0_0_rgba(255,90,154,0.22)] backdrop-blur-xl sm:px-4">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <Link
            href="/"
            className="hidden rounded-full px-2.5 py-1 text-sm text-gray-400 transition-colors hover:bg-white/5 hover:text-white sm:inline"
          >
            ← Gallery
          </Link>
          <Logo linkToHome className="truncate sm:hidden" />
          <div className="hidden h-4 w-px bg-white/10 sm:block" />
          <h1 className="truncate text-[15px] font-semibold tracking-tight text-rose-50">
            Messages
          </h1>
        </div>
        <HeaderAuth initialAuth={headerAuth} />
      </header>
      <main className="flex min-h-0 flex-1 flex-col">{children}</main>
    </div>
  );
}
