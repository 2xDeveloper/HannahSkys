"use client";

import { CreatorUploadCTA } from "@/components/CreatorUploadCTA";
import { filterChips } from "@/lib/mock-data";
import { useState } from "react";

export function FilterBar({ itemCount }: { itemCount: number }) {
  const [active, setActive] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  return (
    <div className="app-filter relative space-y-4 overflow-hidden px-4 py-5 md:px-6 md:py-6">
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#ffc0d8]/40 blur-3xl" />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#f4699f]">
            HannahSkys
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl font-extrabold text-[#3f3a44] md:text-3xl">
              The Collection
            </h1>
            <span className="rounded-full bg-[#ffe6ef] px-2.5 py-0.5 text-xs font-semibold text-[#ef4f8f]">
              {itemCount} pieces
            </span>
          </div>
          <p className="max-w-xl text-sm text-[#8a8390]">
            Exclusive photos, films, and messages — made just for you.
          </p>
        </div>
        <CreatorUploadCTA />
      </div>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative min-w-[200px] max-w-md flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#f4699f]/70">
            ✦
          </span>
          <input
            type="search"
            placeholder="Search the collection"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-[#fbdce7] bg-white py-2.5 pl-9 pr-4 text-sm text-[#4a4550] placeholder:text-[#b6aeba] transition-shadow focus:border-[#f4699f] focus:outline-none focus:ring-2 focus:ring-[#f4699f]/25"
          />
        </div>

        <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible md:pb-0">
          {filterChips.map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={() =>
                setActive(active === chip.label ? null : chip.label)
              }
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-300 ${
                active === chip.label
                  ? "bg-[#f4699f] text-white shadow-[0_4px_14px_rgba(239,79,143,0.3)]"
                  : "bg-white text-[#55505c] ring-1 ring-[#fbdce7] hover:bg-[#fff0f5] hover:text-[#ef4f8f]"
              }`}
            >
              <span>{chip.emoji}</span>
              <span>{chip.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          className="rounded-full bg-[#f4699f] px-4 py-1.5 text-xs font-semibold text-white shadow-[0_4px_14px_rgba(239,79,143,0.25)]"
        >
          Latest
        </button>
        <button
          type="button"
          className="rounded-full bg-white px-4 py-1.5 text-xs font-medium text-[#55505c] ring-1 ring-[#fbdce7] transition-colors hover:bg-[#fff0f5]"
        >
          Tags
        </button>
      </div>
    </div>
  );
}
