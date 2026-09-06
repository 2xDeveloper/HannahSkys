"use client";

import { ContentMediaThumb } from "@/components/ContentMediaThumb";
import type { CreatorContent } from "@/lib/types/content";
import { VIDEO_CATEGORIES } from "@/lib/video-categories";
import { useMemo, useState } from "react";

type PremadeVideoItem = {
  item: CreatorContent;
  displayUrl: string;
};

export function PremadeVideosBrowser({ items }: { items: PremadeVideoItem[] }) {
  const [category, setCategory] = useState("all");

  const filtered = useMemo(() => {
    if (category === "all") return items;
    return items.filter((row) => row.item.category === category);
  }, [category, items]);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="app-filter relative space-y-4 overflow-hidden px-4 py-5 md:px-6 md:py-6">
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#ffc0d8]/40 blur-3xl" />
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#f4699f]">
            HannahSkys
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl font-extrabold text-[#3f3a44] md:text-3xl">
              Premade Videos
            </h1>
            <span className="rounded-full bg-[#ffe6ef] px-2.5 py-0.5 text-xs font-semibold text-[#ef4f8f]">
              {filtered.length} {filtered.length === 1 ? "video" : "videos"}
            </span>
          </div>
          <p className="max-w-xl text-sm text-[#8a8390]">
            Ready-to-watch clips. Pick a category to browse.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setCategory("all")}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-300 ${
              category === "all"
                ? "bg-[#f4699f] text-white shadow-[0_4px_14px_rgba(239,79,143,0.3)]"
                : "bg-white text-[#55505c] ring-1 ring-[#fbdce7] hover:bg-[#fff0f5] hover:text-[#ef4f8f]"
            }`}
          >
            All
          </button>
          {VIDEO_CATEGORIES.map((chip) => (
            <button
              key={chip.slug}
              type="button"
              onClick={() => setCategory(chip.slug)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-300 ${
                category === chip.slug
                  ? "bg-[#f4699f] text-white shadow-[0_4px_14px_rgba(239,79,143,0.3)]"
                  : "bg-white text-[#55505c] ring-1 ring-[#fbdce7] hover:bg-[#fff0f5] hover:text-[#ef4f8f]"
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-1 items-center justify-center p-8">
          <p className="max-w-md text-center text-sm leading-relaxed text-gray-500">
            No premade videos in this category yet. Check back soon.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 md:grid-cols-4 md:gap-4 md:p-6 lg:grid-cols-5 xl:grid-cols-6">
          {filtered.map((row, index) => (
            <div
              key={row.item.id}
              className="media-card-enter"
              style={{ animationDelay: `${Math.min(index, 14) * 45}ms` }}
            >
              <ContentMediaThumb item={row.item} displayUrl={row.displayUrl} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
