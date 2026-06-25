"use client";

import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types/database";
import { isApprovedCreator } from "@/lib/types/database";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

function GuestLinks() {
  return (
    <div className="absolute right-4 flex items-center gap-2">
      <Link
        href="/login"
        className="rounded-lg px-3 py-1.5 text-sm text-gray-300 hover:bg-bp-chip hover:text-white"
      >
        Log in
      </Link>
      <Link
        href="/signup"
        className="rounded-lg bg-bp-gold px-3 py-1.5 text-sm font-medium text-white hover:bg-bp-gold-dim"
      >
        Sign up
      </Link>
    </div>
  );
}

function SignedInLinks({ profile }: { profile: Profile | null }) {
  if (!profile) {
    return (
      <div className="absolute right-2 flex items-center gap-2 sm:right-4">
        <Link
          href="/library"
          className="rounded-lg bg-bp-gold px-2 py-1.5 text-xs font-semibold text-white hover:bg-bp-gold-dim sm:px-3 sm:text-sm"
        >
          Library
        </Link>
        <Link
          href="/account"
          className="text-xs text-bp-yellow hover:text-white sm:text-sm"
        >
          Account
        </Link>
      </div>
    );
  }

  return (
    <div className="absolute right-2 flex items-center gap-1.5 sm:right-4 sm:gap-3">
      {profile.role === "admin" && (
        <Link
          href="/admin"
          className="hidden text-sm text-bp-yellow hover:text-white sm:inline"
        >
          Admin panel
        </Link>
      )}
      {isApprovedCreator(profile) && (
        <>
          <Link
            href="/account#upload"
            className="hidden items-center gap-1.5 rounded-full bg-bp-gold px-3 py-1.5 text-sm font-semibold text-white shadow-[0_2px_12px_rgba(196,30,58,0.4)] hover:bg-bp-gold-dim sm:inline-flex"
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
      {profile.role === "user" ? (
        <Link
          href="/library"
          className="rounded-lg bg-bp-gold px-2 py-1.5 text-xs font-semibold text-white hover:bg-bp-gold-dim sm:px-3 sm:text-sm"
        >
          Library
        </Link>
      ) : (
        <Link
          href="/library"
          className="hidden text-sm text-bp-yellow hover:text-white sm:inline"
        >
          Library
        </Link>
      )}
      <Link
        href="/messages"
        className="hidden text-sm text-bp-yellow hover:text-white sm:inline"
      >
        Messages
      </Link>
      <Link
        href="/account"
        className="max-w-[88px] truncate text-xs text-bp-yellow hover:text-white sm:max-w-[140px] sm:text-sm"
      >
        Account
      </Link>
    </div>
  );
}

export function HeaderAuth() {
  const [signedIn, setSignedIn] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

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
        data: { session },
      } = await supabase.auth.getSession();

      if (cancelled) return;

      if (session?.user) {
        setSignedIn(true);
        void loadProfile(session.user.id);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (cancelled) return;

      if (user) {
        setSignedIn(true);
        void loadProfile(user.id);
        return;
      }

      setSignedIn(false);
      setProfile(null);
    }

    void syncAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return;

      if (!session?.user) {
        setSignedIn(false);
        setProfile(null);
        return;
      }

      setSignedIn(true);
      void loadProfile(session.user.id);
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
  }, [loadProfile]);

  if (!signedIn) {
    return <GuestLinks />;
  }

  return <SignedInLinks profile={profile} />;
}
