"use client";

import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types/database";
import { isApprovedCreator } from "@/lib/types/database";
import Link from "next/link";
import { useEffect, useState } from "react";

export function HeaderAuth() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(data as Profile | null);
      setLoading(false);
    }

    load();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      load();
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="absolute right-4 h-8 w-20 animate-pulse rounded-lg bg-bp-chip" />;
  }

  if (!profile) {
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
            href="/account/messages"
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
        href="/account/messages"
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
