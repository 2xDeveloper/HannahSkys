"use client";

import { CreatorUploadCTA } from "@/components/CreatorUploadCTA";
import { filterChips } from "@/lib/mock-data";
import { useState } from "react";

export function FilterBar({ itemCount }: { itemCount: number }) {
  const [active, setActive] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-3 border-b border-bp-border bg-bp-main px-4 py-4 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-lg font-bold text-rose-50 md:text-xl">Gallery</h1>
          <span className="rounded-full bg-bp-gold-dim px-2.5 py-0.5 text-xs font-semibold text-white ring-1 ring-bp-gold/40">
            {itemCount} items
          </span>
        </div>
        <CreatorUploadCTA />
      </div>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative min-w-[200px] flex-1 max-w-md">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            🔍
          </span>
          <input
            type="search"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-bp-border bg-bp-panel py-2 pl-9 pr-4 text-sm text-white placeholder:text-gray-500 focus:border-bp-gold-dim focus:outline-none focus:ring-1 focus:ring-bp-gold-dim"
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
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                active === chip.label
                  ? "bg-bp-gold text-white shadow-[0_0_12px_rgba(196,30,58,0.35)]"
                  : "bg-bp-chip text-gray-200 hover:bg-bp-chip-hover"
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
          className="rounded-full bg-bp-chip px-4 py-1.5 text-xs font-medium text-gray-200 hover:bg-bp-chip-hover"
        >
          Latest
        </button>
        <button
          type="button"
          className="rounded-full bg-bp-chip px-4 py-1.5 text-xs font-medium text-gray-200 hover:bg-bp-chip-hover"
        >
          Tags
        </button>
      </div>
    </div>
  );
}
