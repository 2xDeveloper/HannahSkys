export const VIDEO_CATEGORIES = [
  { slug: "findom", label: "Findom" },
  { slug: "joi", label: "JOI" },
  { slug: "sph", label: "SPH" },
  { slug: "humiliation", label: "Humiliation" },
  { slug: "worship", label: "Worship" },
  { slug: "feet", label: "Feet" },
  { slug: "cei", label: "CEI" },
  { slug: "other", label: "Other" },
] as const;

export type VideoCategorySlug = (typeof VIDEO_CATEGORIES)[number]["slug"];

export function isVideoCategorySlug(value: string): value is VideoCategorySlug {
  return VIDEO_CATEGORIES.some((category) => category.slug === value);
}

export function videoCategoryLabel(slug: string | null | undefined): string {
  return VIDEO_CATEGORIES.find((category) => category.slug === slug)?.label ?? "Other";
}
