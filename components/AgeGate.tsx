"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "hannahskys-age-verified-v1";

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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-bp-gold/20 blur-3xl" />
      </div>
      <div className="page-enter relative w-full max-w-lg rounded-3xl border border-bp-gold/25 bg-bp-panel/90 p-6 shadow-[0_30px_80px_rgba(255,90,154,0.18)] backdrop-blur-xl md:p-8">
        <div className="mb-6 text-center">
          <span className="inline-block rounded-full bg-bp-gold/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-bp-yellow ring-1 ring-bp-gold/40">
            18+ Adults Only
          </span>
          <h1
            id="age-gate-title"
            className="font-display mt-4 text-3xl font-extrabold text-white"
          >
            Enter HannahSkys
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-gray-400">
            HannahSkys is a private collection of photos, films, and messages intended exclusively
            for viewers who are at least 18 years of age (or the age of majority in your
            jurisdiction, whichever is higher).
          </p>
        </div>

        <ul className="space-y-2 rounded-2xl border border-bp-border/80 bg-bp-main/60 px-4 py-3 text-xs leading-relaxed text-gray-400">
          <li className="flex gap-2">
            <span className="text-bp-gold">♡</span>
            By entering, you confirm you are 18+ and legally permitted to view adult content.
          </li>
          <li className="flex gap-2">
            <span className="text-bp-gold">♡</span>
            You agree to our{" "}
            <Link href="/terms" className="text-bp-yellow underline hover:text-white">
              Terms of Service
            </Link>{" "}
            and acceptable use rules.
          </li>
          <li className="flex gap-2">
            <span className="text-bp-gold">♡</span>
            If you are under 18, you must leave this site immediately.
          </li>
        </ul>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={accept}
            className="btn-glow flex-1 rounded-full bg-bp-gold px-5 py-3.5 text-sm font-semibold text-white hover:bg-bp-gold-dim"
          >
            I am 18 or older — Enter
          </button>
          <button
            type="button"
            onClick={leave}
            className="flex-1 rounded-full border border-bp-border bg-bp-chip px-5 py-3.5 text-sm font-medium text-gray-300 transition-colors hover:bg-bp-chip-hover hover:text-white"
          >
            I am under 18 — Leave
          </button>
        </div>

        <p className="mt-5 text-center text-[10px] leading-relaxed text-gray-600">
          HannahSkys does not knowingly collect information from anyone under 18. Misrepresenting
          your age violates our Terms and may result in account termination.
        </p>
      </div>
    </div>
  );
}
