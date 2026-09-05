/** Requests to a paused or deleted Supabase project must fail fast, not hang the page. */
const REQUEST_TIMEOUT_MS = 8000;

const PLACEHOLDER_HINTS = ["your-project", "example.supabase.co", "changeme"];

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";

/** True when the env vars look like a usable Supabase project (does not check reachability). */
export function isSupabaseConfigured(): boolean {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return false;
  }

  if (PLACEHOLDER_HINTS.some((hint) => SUPABASE_URL.includes(hint))) {
    return false;
  }

  try {
    const url = new URL(SUPABASE_URL);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function supabaseFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  if (init?.signal) {
    return fetch(input, init);
  }

  return fetch(input, { ...init, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
}

/**
 * Server-side only. The browser client must stay untimed because photo and video
 * uploads stream through it and can legitimately run for minutes.
 */
export const serverClientOptions = {
  global: { fetch: supabaseFetch },
};
