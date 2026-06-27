/** Safe in-app redirect target after login. */
export function safeAuthRedirect(path: string | null | undefined, fallback = "/account"): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return fallback;
  }
  return path;
}
