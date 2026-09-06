/**
 * Temporarily hide every model except Hannah Skys on public pages.
 * Flip to false when you want the full model list back. Nothing is deleted.
 */
export const HIDE_OTHER_MODELS = true;

const FEATURED_NAME = /hannah\s*skye?s?/i;

export function isFeaturedCreatorName(name: string | null | undefined): boolean {
  return FEATURED_NAME.test(name?.trim() ?? "");
}

export function isPubliclyListedCreator(name: string | null | undefined): boolean {
  if (!HIDE_OTHER_MODELS) return true;
  return isFeaturedCreatorName(name);
}
