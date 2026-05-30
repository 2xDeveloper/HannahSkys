/** Turn Supabase auth errors into clearer next steps for devs/clients. */
export function formatAuthError(message: string): string {
  const lower = message.toLowerCase();

  if (
    lower.includes("invalid") ||
    lower.includes("not authorized") ||
    lower.includes("unable to validate email")
  ) {
    return (
      `${message} — This usually means Supabase Auth settings, not a bad Gmail address. ` +
      `Fix: Supabase Dashboard → Authentication → Providers → Email → turn OFF “Confirm email” and Save. ` +
      `If it still fails, add custom SMTP under Authentication → SMTP (e.g. free Resend). ` +
      `See: https://supabase.com/docs/guides/auth/auth-smtp`
    );
  }

  if (lower.includes("signup") && lower.includes("disabled")) {
    return `${message} — Enable sign-ups: Authentication → Providers → Email.`;
  }

  if (lower.includes("rate limit") || lower.includes("rate_limit")) {
    return (
      "Email rate limit exceeded — Supabase paused auth emails after too many signup attempts. " +
      "Wait ~1 hour, or add your account manually: Supabase → Authentication → Users → Add user. " +
      "Turn OFF “Confirm email” for dev, and set up custom SMTP (Resend) for higher limits."
    );
  }

  return message;
}
