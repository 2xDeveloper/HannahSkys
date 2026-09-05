"use client";

import { safeAuthRedirect } from "@/lib/auth/redirect";
import type { AccountType } from "@/lib/types/database";
import { formatAuthError } from "@/lib/auth-errors";
import { submitCreatorApplication } from "@/lib/submit-creator-application";
import { ensureUserProfile } from "@/lib/ensure-profile";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

type AuthFormProps = {
  mode: "login" | "signup";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeAuthRedirect(searchParams.get("next"));
  const purchaseComplete = searchParams.get("purchase") === "1";

  const avatarRef = useRef<HTMLInputElement>(null);
  const idRef = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("user");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const supabase = createClient();
    const normalizedEmail = normalizeEmail(email);

    if (mode === "signup") {
      const avatarFile = avatarRef.current?.files?.[0];
      const idFile = idRef.current?.files?.[0];

      if (accountType === "creator") {
        if (!avatarFile) {
          setLoading(false);
          setError("Profile photo is required for creators.");
          return;
        }
        if (!idFile) {
          setLoading(false);
          setError("Photo of your ID is required for verification.");
          return;
        }
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/account`,
          data: {
            display_name: displayName.trim() || normalizedEmail.split("@")[0],
            account_type: accountType,
          },
        },
      });

      if (signUpError) {
        setLoading(false);
        setError(formatAuthError(signUpError.message));
        return;
      }

      if (data.user && accountType === "creator" && avatarFile && idFile) {
        let session = data.session;

        // signUp may return a user without a session cookie yet — sign in to establish one
        if (!session) {
          const { data: signInData, error: signInError } =
            await supabase.auth.signInWithPassword({
              email: normalizedEmail,
              password,
            });
          if (!signInError && signInData.session) {
            session = signInData.session;
          }
        }

        if (session) {
          try {
            await submitCreatorApplication("", avatarFile, idFile, {
              userId: data.user.id,
              session,
            });
          } catch (uploadErr) {
            setLoading(false);
            setError(
              uploadErr instanceof Error
                ? uploadErr.message
                : "Application failed. Try completing it on your Account page after login.",
            );
            return;
          }
        }
      }

      if (data.user) {
        await ensureUserProfile(supabase, data.user);
      }

      setLoading(false);

      const {
        data: { session: activeSession },
      } = await supabase.auth.getSession();

      if (activeSession) {
        window.location.assign("/account");
        return;
      }

      setMessage(
        accountType === "creator"
          ? "Account created. Confirm your email, then log in — your photos will upload when you complete signup on the Account page."
          : "Account created. You can log in and start browsing.",
      );
      return;
    }

    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (signInError) {
        setError(formatAuthError(signInError.message));
        return;
      }

      if (!signInData.session) {
        setError("Login failed. Please try again.");
        return;
      }

      window.location.assign(next);
    } catch {
      setError("Could not reach the login server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
    return;
  }

  const isCreatorSignup = mode === "signup" && accountType === "creator";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mode === "signup" && (
        <>
          <div>
            <p className="app-muted mb-2 text-xs font-medium">I want to join as</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAccountType("user")}
                className={`rounded-xl border p-4 text-left transition-colors ${
                  accountType === "user"
                    ? "border-[#f4699f] bg-[#fff0f5] ring-1 ring-[#f4699f]/30"
                    : "border-[#fbdce7] bg-white hover:border-[#f4699f]"
                }`}
              >
                <span className="text-lg">🛒</span>
                <p className="app-heading mt-2 text-sm font-semibold">Buyer / Fan</p>
                <p className="mt-1 text-[11px] leading-snug text-gray-500">
                  Browse, purchase photos & videos
                </p>
              </button>
              <button
                type="button"
                onClick={() => setAccountType("creator")}
                className={`rounded-xl border p-4 text-left transition-colors ${
                  accountType === "creator"
                    ? "border-[#f4699f] bg-[#fff0f5] ring-1 ring-[#f4699f]/30"
                    : "border-[#fbdce7] bg-white hover:border-[#f4699f]"
                }`}
              >
                <span className="text-lg">✨</span>
                <p className="app-heading mt-2 text-sm font-semibold">Creator</p>
                <p className="mt-1 text-[11px] leading-snug text-gray-500">
                  Requires photo, ID & admin approval
                </p>
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="displayName" className="app-muted mb-1.5 block text-xs font-medium">
              Display name
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="app-input px-3 py-2.5 text-sm"
              placeholder="Your name"
            />
          </div>

          {isCreatorSignup && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="app-muted mb-1.5 block text-xs font-medium">
                    Profile photo
                  </label>
                  <input
                    ref={avatarRef}
                    type="file"
                    accept="image/*"
                    required
                    className="app-muted w-full text-xs file:mr-2 file:rounded-lg file:border-0 file:bg-[#ffe6ef] file:px-3 file:py-2 file:text-xs file:text-[#ef4f8f]"
                  />
                </div>
                <div>
                  <label className="app-muted mb-1.5 block text-xs font-medium">
                    Photo of ID
                  </label>
                  <input
                    ref={idRef}
                    type="file"
                    accept="image/*"
                    required
                    className="app-muted w-full text-xs file:mr-2 file:rounded-lg file:border-0 file:bg-[#ffe6ef] file:px-3 file:py-2 file:text-xs file:text-[#ef4f8f]"
                  />
                </div>
              </div>
              <p className="text-[11px] leading-relaxed text-gray-600">
                ID photos are stored privately and only visible to admins for verification.
              </p>
            </>
          )}
        </>
      )}

      <div>
        <label htmlFor="email" className="app-muted mb-1.5 block text-xs font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="app-input px-3 py-2.5 text-sm"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="app-muted mb-1.5 block text-xs font-medium">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={6}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="app-input px-3 py-2.5 text-sm"
          placeholder="••••••••"
        />
      </div>

      {purchaseComplete && !error && (
        <p className="app-alert-ok rounded-lg px-3 py-2 text-sm">
          Payment complete — log in to view your purchase in your library.
        </p>
      )}
      {error && (
        <p className="app-alert-err rounded-lg px-3 py-2 text-sm">{error}</p>
      )}
      {message && (
        <p className="app-alert-ok rounded-lg px-3 py-2 text-sm">{message}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="landing-btn-primary landing-btn-lg landing-btn-block mt-0 disabled:opacity-60"
      >
        {loading
          ? "Please wait…"
          : mode === "login"
            ? "Log in"
            : isCreatorSignup
              ? "Submit creator application"
              : "Create account"}
      </button>

      <p className="text-center text-sm text-gray-500">
        {mode === "login" ? (
          <>
            No account?{" "}
            <Link href="/signup" className="app-link">
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="app-link">
              Log in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
