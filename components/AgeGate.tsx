"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "findomvids-age-verified-v1";

export function AgeGate() {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const verified = localStorage.getItem(STORAGE_KEY) === "true";
      setVisible(!verified);
    } catch {
      setVisible(true);
    }
  }, []);

  function accept() {
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  function leave() {
    window.location.href = "https://www.google.com";
  }

  if (!mounted || !visible) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
    >
      <div className="w-full max-w-lg rounded-2xl border border-bp-border bg-bp-panel p-6 shadow-2xl shadow-black/60 md:p-8">
        <div className="mb-6 text-center">
          <span className="inline-block rounded-full bg-bp-gold/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-bp-yellow ring-1 ring-bp-gold/40">
            18+ Adults Only
          </span>
          <h1
            id="age-gate-title"
            className="mt-4 text-2xl font-bold tracking-tight text-rose-50"
          >
            Age verification required
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-gray-400">
            FindomVids.xyz contains adult-oriented creator content intended exclusively for
            viewers who are at least 18 years of age (or the age of majority in your jurisdiction,
            whichever is higher).
          </p>
        </div>

        <ul className="space-y-2 rounded-xl border border-bp-border bg-bp-main/60 px-4 py-3 text-xs leading-relaxed text-gray-400">
          <li className="flex gap-2">
            <span className="text-bp-gold">•</span>
            By entering, you confirm you are 18+ and legally permitted to view adult content.
          </li>
          <li className="flex gap-2">
            <span className="text-bp-gold">•</span>
            You agree to our{" "}
            <Link href="/terms" className="text-bp-yellow underline hover:text-white">
              Terms of Service
            </Link>{" "}
            and acceptable use rules.
          </li>
          <li className="flex gap-2">
            <span className="text-bp-gold">•</span>
            If you are under 18, you must leave this site immediately.
          </li>
        </ul>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={accept}
            className="flex-1 rounded-xl bg-bp-gold px-5 py-3.5 text-sm font-semibold text-white shadow-[0_4px_24px_rgba(196,30,58,0.45)] transition-all hover:bg-bp-gold-dim"
          >
            I am 18 or older — Enter
          </button>
          <button
            type="button"
            onClick={leave}
            className="flex-1 rounded-xl border border-bp-border bg-bp-chip px-5 py-3.5 text-sm font-medium text-gray-300 transition-colors hover:bg-bp-chip-hover hover:text-white"
          >
            I am under 18 — Leave
          </button>
        </div>

        <p className="mt-5 text-center text-[10px] leading-relaxed text-gray-600">
          FindomVids.xyz does not knowingly collect information from anyone under 18. Misrepresenting
          your age violates our Terms and may result in account termination.
        </p>
      </div>
    </div>
  );
}
