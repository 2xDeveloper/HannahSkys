import { getContentPublicUrl } from "@/lib/content";
import { logDevIssue } from "@/lib/dev-log";
import { isPubliclyListedCreator } from "@/lib/public-creators";
import { createClient } from "@/lib/supabase/server";
import type { CreatorContent } from "@/lib/types/content";
import {
  formatContentPrice,
  getPublicDisplayMediaType,
  getPublicDisplayPath,
  shouldBlurPublicMedia,
} from "@/lib/types/content";

const SECTION_LIMIT = 4;
const NEW_MODEL_DAYS = 14;

export type LandingMediaItem = {
  id: string;
  title: string;
  href: string;
  displayUrl: string;
  renderAsVideo: boolean;
  locked: boolean;
  priceLabel: string;
  creatorId: string;
  creatorName: string;
};

export type LandingModel = {
  id: string;
  name: string;
  href: string;
  avatarUrl: string | null;
  isNew: boolean;
  photoCount: number;
  videoCount: number;
};

export type LandingContent = {
  photos: LandingMediaItem[];
  videos: LandingMediaItem[];
  models: LandingModel[];
  photoCount: number;
  videoCount: number;
  /** False when Supabase could not be reached — the page then shows empty states. */
  connected: boolean;
};

const EMPTY: LandingContent = {
  photos: [],
  videos: [],
  models: [],
  photoCount: 0,
  videoCount: 0,
  connected: false,
};

function isRecentlyJoined(createdAt: string): boolean {
  const joined = new Date(createdAt).getTime();
  return joined >= Date.now() - NEW_MODEL_DAYS * 24 * 60 * 60 * 1000;
}

/** Real models and real media for the landing page — no placeholder content. */
export async function getLandingContent(): Promise<LandingContent> {
  let supabase: Awaited<ReturnType<typeof createClient>>;

  try {
    supabase = await createClient();
  } catch (err) {
    logDevIssue("Landing page could not create a Supabase client", err);
    return EMPTY;
  }

  const { data: creatorRows, error: creatorError } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, created_at")
    .eq("role", "creator")
    .eq("creator_status", "approved")
    .order("created_at", { ascending: false });

  if (creatorError) {
    logDevIssue("Landing page creators query failed", creatorError.message);
    return EMPTY;
  }

  const creators = (creatorRows ?? []).filter((row) =>
    isPubliclyListedCreator(row.display_name),
  );

  if (creators.length === 0) {
    return { ...EMPTY, connected: true };
  }

  const nameById = new Map(
    creators.map((row) => [row.id, row.display_name?.trim() || "Creator"] as const),
  );

  const { data: contentRows, error: contentError } = await supabase
    .from("creator_content")
    .select("*")
    .in(
      "creator_id",
      creators.map((row) => row.id),
    )
    .order("created_at", { ascending: false });

  if (contentError) {
    logDevIssue("Landing page content query failed", contentError.message);
    return { ...EMPTY, connected: true };
  }

  const rows = (contentRows ?? []) as CreatorContent[];

  function toMediaItem(row: CreatorContent): LandingMediaItem {
    const item: CreatorContent = {
      ...row,
      creator_name: nameById.get(row.creator_id) ?? null,
    };

    return {
      id: item.id,
      title: item.title,
      href: `/gallery/${item.id}`,
      displayUrl: getContentPublicUrl(supabase, getPublicDisplayPath(item)),
      renderAsVideo: getPublicDisplayMediaType(item) === "video",
      locked: shouldBlurPublicMedia(item),
      priceLabel: formatContentPrice(item.price_cents),
      creatorId: item.creator_id,
      creatorName: nameById.get(item.creator_id) ?? "Creator",
    };
  }

  const photoRows = rows.filter((row) => row.media_type === "photo");
  const videoRows = rows.filter((row) => row.media_type === "video");

  const models: LandingModel[] = creators.map((row) => ({
    id: row.id,
    name: nameById.get(row.id) ?? "Creator",
    href: `/creator/${row.id}`,
    avatarUrl: row.avatar_url,
    isNew: isRecentlyJoined(row.created_at),
    photoCount: photoRows.filter((item) => item.creator_id === row.id).length,
    videoCount: videoRows.filter((item) => item.creator_id === row.id).length,
  }));

  return {
    photos: photoRows.slice(0, SECTION_LIMIT).map(toMediaItem),
    videos: videoRows.slice(0, SECTION_LIMIT).map(toMediaItem),
    models,
    photoCount: photoRows.length,
    videoCount: videoRows.length,
    connected: true,
  };
}
