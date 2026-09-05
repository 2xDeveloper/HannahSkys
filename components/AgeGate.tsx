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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#4a4550]/40 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
    >
      <div className="page-enter app-card relative w-full max-w-lg rounded-3xl p-6 md:p-8">
        <div className="mb-6 text-center">
          <span className="app-chip inline-block rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em]">
            18+ Adults Only
          </span>
          <h1 id="age-gate-title" className="app-heading font-display mt-4 text-3xl font-extrabold">
            Enter HannahSkys
          </h1>
          <p className="app-muted mt-3 text-sm leading-relaxed">
            HannahSkys is a private collection of photos, films, and messages intended exclusively
            for viewers who are at least 18 years of age (or the age of majority in your
            jurisdiction, whichever is higher).
          </p>
        </div>

        <ul className="app-muted space-y-2 rounded-2xl border border-[#fbdce7] bg-[#fff7fa] px-4 py-3 text-xs leading-relaxed">
          <li className="flex gap-2">
            <span className="text-[#f4699f]">♡</span>
            By entering, you confirm you are 18+ and legally permitted to view adult content.
          </li>
          <li className="flex gap-2">
            <span className="text-[#f4699f]">♡</span>
            You agree to our{" "}
            <Link href="/terms" className="app-link underline">
              Terms of Service
            </Link>{" "}
            and acceptable use rules.
          </li>
          <li className="flex gap-2">
            <span className="text-[#f4699f]">♡</span>
            If you are under 18, you must leave this site immediately.
          </li>
        </ul>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={accept} className="landing-btn-primary landing-btn-lg flex-1">
            I am 18 or older — Enter
          </button>
          <button
            type="button"
            onClick={leave}
            className="landing-btn-outline landing-btn-lg flex-1"
          >
            I am under 18 — Leave
          </button>
        </div>

        <p className="app-muted mt-5 text-center text-[10px] leading-relaxed">
          HannahSkys does not knowingly collect information from anyone under 18. Misrepresenting
          your age violates our Terms and may result in account termination.
        </p>
      </div>
    </div>
  );
}
