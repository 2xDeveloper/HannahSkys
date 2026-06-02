import { logDevIssue } from "@/lib/dev-log";

/** User-safe auth error text. Technical details go to server/client logs only. */
export function formatAuthError(message: string): string {
  const lower = message.toLowerCase();

  if (
    lower.includes("invalid") ||
    lower.includes("not authorized") ||
    lower.includes("unable to validate email")
  ) {
    logDevIssue(
      "Auth email validation failed",
      `${message} — Check Supabase Auth → Email (confirm email / SMTP).`,
    );
    return "We couldn't verify that email address. Try again or use a different email.";
  }

  if (lower.includes("signup") && lower.includes("disabled")) {
    logDevIssue("Auth signup disabled", message);
    return "Sign up is temporarily unavailable. Please try again later.";
  }

  if (lower.includes("rate limit") || lower.includes("rate_limit")) {
    logDevIssue("Auth email rate limit", message);
    return "Too many attempts. Please wait a while and try again.";
  }

  return message;
}
