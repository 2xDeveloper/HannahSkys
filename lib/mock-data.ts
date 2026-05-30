export type Creator = {
  id: string;
  name: string;
};

export type MediaType = "photo" | "video";

export type GalleryItem = {
  id: number;
  title: string;
  creator: string;
  duration: string;
  imageId: string;
  featured?: boolean;
  type: MediaType;
  price: number;
  previewText: string;
  description: string;
};

/** SFW portrait / fashion-style Unsplash IDs */
const modelImageIds = [
  "1529626455594-4ff0802fb7eb",
  "1534528741775-53994a69daeb",
  "1524502397800-2c2fd9bd4350",
  "1488426862026-3ee34a7d66df",
  "1517841905240-472988babdf9",
  "1494790108377-be9c29b29330",
  "1438761681033-6461ffad8d80",
  "1544005313-94ddf0286df2",
  "1509967418310-64f094cf5f6e",
  "1529139574484-c3d56b0b2c2b",
  "1508214751196-bcfd4ca60f91",
  "1515886657612-9f8655e83512",
  "1469334031218-e045a6dee992",
  "1524504388940-b1c1722653e1",
  "1531746020758-6d0ac511ead3",
  "1521119981863-ef27f08b1976",
  "1487412720507-e7ab37603c6f",
  "1507003211169-0a1dd7228f2d",
  "1506794778202-cad84cf45f1d",
  "1519699049038-2c5a1b4b0e0a",
  "1520813865204-7fe8427a8b8a",
  "1531120400824-ffa80383f0f3",
  "1529626455594-4ff0802fb7eb",
  "1485899242236-452f6b48b3a0",
];

const titles = [
  "Golden Hour Portrait",
  "Studio Glam Set",
  "Rooftop Fashion Film",
  "Soft Light Collection",
  "Editorial Vol. 2",
  "Behind the Scenes",
  "Exclusive Photoshoot",
  "City Lights Session",
  "Mirror Room Preview",
  "Velvet Lounge Set",
  "Summer Campaign",
  "Midnight Studio Drop",
  "Classic Beauty Series",
  "Runway BTS Clip",
  "Private Gallery Unlock",
  "Candid Moments Pack",
  "Luxury Hotel Shoot",
  "Neon Street Style",
  "Close-Up Portrait Set",
  "Poolside Editorial",
  "Dressing Room Teaser",
  "VIP Member Exclusive",
  "Natural Light Diaries",
  "Premium Creator Drop",
];

export function imageUrl(id: string, width: number, height?: number) {
  const h = height ?? Math.round(width * (4 / 3));
  return `https://images.unsplash.com/photo-${id}?w=${width}&h=${h}&fit=crop&crop=faces&q=80`;
}

export const galleryItems: GalleryItem[] = modelImageIds.map((imageId, i) => {
  const type: MediaType = i % 3 === 0 ? "video" : "photo";

  return {
    id: i + 1,
    title: titles[i % titles.length],
    creator: "Creator",
    duration: type === "video" ? `${Math.floor((i % 8) + 2)}:${String((i * 7) % 60).padStart(2, "0")}` : "—",
    imageId,
    featured: i % 5 === 0,
    type,
    price: type === "video" ? 12.99 + (i % 5) * 2 : 4.99 + (i % 4),
    previewText:
      type === "video"
        ? "Watch a short preview clip. Purchase to unlock the full HD video download."
        : "Preview is watermarked and slightly blurred. Purchase to unlock the full-resolution photo set.",
    description: `Premium ${type}. Includes full-quality files and instant access after purchase.`,
  };
});

export const filterChips = [
  { label: "Deals", emoji: "🏷️" },
  { label: "Featured Only", emoji: "💎" },
  { label: "Paid Only", emoji: "💰" },
  { label: "Purchased", emoji: "✅" },
  { label: "Most Viewed", emoji: "🔥" },
  { label: "Popular", emoji: "📈" },
  { label: "Watching Now", emoji: "👀" },
  { label: "Shadow Games", emoji: "🎮" },
  { label: "Short", emoji: "⚡" },
  { label: "Long", emoji: "🎬" },
] as const;
