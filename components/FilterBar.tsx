"use client";

import { CreatorUploadCTA } from "@/components/CreatorUploadCTA";
import { filterChips } from "@/lib/mock-data";
import { useState } from "react";

export function FilterBar({ itemCount }: { itemCount: number }) {
  const [active, setActive] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  return (
    <div className="relative space-y-4 overflow-hidden border-b border-bp-border/70 bg-gradient-to-b from-bp-gold/8 to-transparent px-4 py-5 md:px-6 md:py-6">
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-bp-gold/10 blur-3xl" />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-bp-gold">
            HannahSkys
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl font-extrabold text-white md:text-3xl">
              The Collection
            </h1>
            <span className="rounded-full bg-bp-gold/20 px-2.5 py-0.5 text-xs font-semibold text-bp-yellow ring-1 ring-bp-gold/40">
              {itemCount} pieces
            </span>
          </div>
          <p className="max-w-xl text-sm text-gray-400">
            Private photos, films, and messages — a darker, softer world.
          </p>
        </div>
        <CreatorUploadCTA />
      </div>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative min-w-[200px] max-w-md flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-bp-yellow/60">
            ✦
          </span>
          <input
            type="search"
            placeholder="Search the collection"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-bp-border/80 bg-bp-panel/80 py-2.5 pl-9 pr-4 text-sm text-white placeholder:text-gray-500 backdrop-blur-sm transition-shadow focus:border-bp-gold focus:outline-none focus:ring-2 focus:ring-bp-gold/30"
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
                  ? "bg-bp-gold text-white shadow-[0_0_18px_rgba(255,90,154,0.45)]"
                  : "bg-bp-chip/90 text-gray-200 hover:bg-bp-chip-hover hover:text-white"
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
          className="rounded-full bg-bp-gold px-4 py-1.5 text-xs font-semibold text-white shadow-[0_0_16px_rgba(255,90,154,0.3)]"
        >
          Latest
        </button>
        <button
          type="button"
          className="rounded-full bg-bp-chip px-4 py-1.5 text-xs font-medium text-gray-200 transition-colors hover:bg-bp-chip-hover"
        >
          Tags
        </button>
      </div>
    </div>
  );
}
