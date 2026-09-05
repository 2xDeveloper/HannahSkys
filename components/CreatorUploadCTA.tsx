"use client";

import { createClient } from "@/lib/supabase/client";
import { isApprovedCreator } from "@/lib/types/database";
import type { Profile } from "@/lib/types/database";
import Link from "next/link";
import { useEffect, useState } from "react";

export function CreatorUploadCTA() {
  const [approved, setApproved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setApproved(false);
        setLoading(false);
        return;
      }
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setApproved(data ? isApprovedCreator(data as Profile) : false);
      setLoading(false);
    }

    load();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => load());
    return () => subscription.unsubscribe();
  }, []);

  if (loading || !approved) {
    return null;
  }

  return (
    <Link
      href="/account#upload"
      className="landing-btn-primary"
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-base leading-none">
        +
      </span>
      Upload
    </Link>
  );
}
