/** Public site origin for Stripe redirects (never use 0.0.0.0 in browser URLs). */
export function getSiteOrigin(request: Request): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (envUrl) {
    return envUrl.replace(/\/$/, "");
  }

  const url = new URL(request.url);
  const hostHeader = request.headers.get("x-forwarded-host") ?? request.headers.get("host");

  if (hostHeader) {
    const protocol =
      request.headers.get("x-forwarded-proto") ??
      (url.protocol === "https:" ? "https" : "http");
    let host = hostHeader.split(",")[0]?.trim() ?? hostHeader;

    if (host.startsWith("0.0.0.0")) {
      host = host.replace("0.0.0.0", "localhost");
    }

    return `${protocol}://${host}`;
  }

  if (url.hostname === "0.0.0.0") {
    const port = url.port || process.env.PORT || "3000";
    return `http://localhost:${port}`;
  }

  return url.origin;
}
