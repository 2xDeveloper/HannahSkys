"use client";

import { HeaderAuth } from "@/components/HeaderAuth";
import { Logo } from "@/components/Logo";
import type { HeaderAuthState } from "@/lib/auth/header-user";
import Link from "next/link";

type MessagesShellProps = {
  children: React.ReactNode;
  headerAuth?: HeaderAuthState | null;
};

/** Full-width chat layout without gallery sidebar */
export function MessagesShell({ children, headerAuth = null }: MessagesShellProps) {
  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-bp-black">
      <header className="relative z-30 flex h-14 shrink-0 items-center border-b border-bp-border bg-bp-black/95 px-4 shadow-[0_1px_0_0_rgba(196,30,58,0.12)] backdrop-blur-md">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Link
            href="/"
            className="hidden text-sm text-gray-500 hover:text-white sm:inline"
          >
            ← Gallery
          </Link>
          <Logo linkToHome className="truncate sm:hidden" />
          <div className="hidden h-5 w-px bg-bp-border sm:block" />
          <h1 className="truncate text-sm font-semibold text-rose-50 sm:text-base">
            Messages
          </h1>
        </div>
        <HeaderAuth initialAuth={headerAuth} />
      </header>
      <main className="flex min-h-0 flex-1 flex-col bg-bp-main">{children}</main>
    </div>
  );
}
