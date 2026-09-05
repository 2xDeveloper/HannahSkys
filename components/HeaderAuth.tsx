"use client";

import { createClient } from "@/lib/supabase/client";
import type { HeaderAuthState } from "@/lib/auth/header-user";
import type { Profile } from "@/lib/types/database";
import { isApprovedCreator } from "@/lib/types/database";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type HeaderAuthProps = {
  initialAuth?: HeaderAuthState | null;
};

function GuestLinks() {
  return (
    <div className="absolute right-4 flex items-center gap-2">
      <Link
        href="/login"
        className="rounded-full px-3 py-1.5 text-sm text-gray-300 transition-colors hover:bg-bp-chip hover:text-white"
      >
        Log in
      </Link>
      <Link
        href="/signup"
        className="rounded-full bg-bp-gold px-3.5 py-1.5 text-sm font-medium text-white shadow-[0_4px_18px_rgba(255,90,154,0.4)] transition-all hover:bg-bp-gold-dim hover:shadow-[0_6px_22px_rgba(255,90,154,0.5)]"
      >
        Sign up
      </Link>
    </div>
  );
}

function SignedInLinks({ profile }: { profile: Profile | null }) {
  const accountLabel = profile?.display_name?.trim() || "Account";
  const approved = profile ? isApprovedCreator(profile) : false;
  const isAdmin = profile?.role === "admin";

  return (
    <div className="absolute right-2 flex max-w-[min(100%,14rem)] items-center gap-1.5 sm:right-4 sm:max-w-none sm:gap-3">
      {isAdmin && (
        <Link
          href="/admin"
          className="hidden text-sm text-bp-yellow hover:text-white sm:inline"
        >
          Admin panel
        </Link>
      )}
      {approved && (
        <>
          <Link
            href="/account#upload"
            className="hidden items-center gap-1.5 rounded-full bg-bp-gold px-3 py-1.5 text-sm font-semibold text-white shadow-[0_2px_12px_rgba(255,90,154,0.45)] hover:bg-bp-gold-dim sm:inline-flex"
          >
            <span className="text-base leading-none">+</span>
            Upload
          </Link>
          <Link
            href="/messages"
            className="hidden text-sm text-bp-yellow hover:text-white sm:inline"
          >
            Messages
          </Link>
        </>
      )}
      <Link
        href="/library"
        className="rounded-full bg-bp-gold px-2.5 py-1.5 text-xs font-semibold text-white shadow-[0_2px_12px_rgba(255,90,154,0.35)] hover:bg-bp-gold-dim sm:px-3 sm:text-sm"
      >
        Library
      </Link>
      {!approved && (
        <Link
          href="/messages"
          className="hidden text-sm text-bp-yellow hover:text-white sm:inline"
        >
          Messages
        </Link>
      )}
      <Link
        href="/account"
        className="max-w-[96px] truncate text-xs font-medium text-bp-yellow hover:text-white sm:max-w-[160px] sm:text-sm"
        title={accountLabel}
      >
        {accountLabel}
      </Link>
    </div>
  );
}

export function HeaderAuth({ initialAuth = null }: HeaderAuthProps) {
  const pathname = usePathname();
  const [signedIn, setSignedIn] = useState(() => Boolean(initialAuth?.userId));
  const [profile, setProfile] = useState<Profile | null>(() => initialAuth?.profile ?? null);

  const loadProfile = useCallback(async (userId: string) => {
    const supabase = createClient();
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    setProfile((data as Profile | null) ?? null);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    async function syncAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (cancelled) return;

      if (user) {
        setSignedIn(true);
        void loadProfile(user.id);
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (cancelled) return;

      if (session?.user) {
        setSignedIn(true);
        void loadProfile(session.user.id);
        return;
      }

      setSignedIn(false);
      setProfile(null);
    }

    void syncAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;

      if (event === "SIGNED_OUT") {
        setSignedIn(false);
        setProfile(null);
        return;
      }

      if (session?.user) {
        setSignedIn(true);
        void loadProfile(session.user.id);
      }
    });

    const onVisible = () => {
      if (document.visibilityState === "visible") void syncAuth();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      subscription.unsubscribe();
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [loadProfile, pathname]);

  if (!signedIn) {
    return <GuestLinks />;
  }

  return <SignedInLinks profile={profile} />;
}
