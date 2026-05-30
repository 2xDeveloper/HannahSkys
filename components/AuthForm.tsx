"use client";

import type { AccountType } from "@/lib/types/database";
import { formatAuthError } from "@/lib/auth-errors";
import { normalizeInstagram } from "@/lib/creator-application";
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
  const next = searchParams.get("next") ?? "/account";

  const avatarRef = useRef<HTMLInputElement>(null);
  const idRef = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [instagram, setInstagram] = useState("");
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
      const ig = normalizeInstagram(instagram);
      const avatarFile = avatarRef.current?.files?.[0];
      const idFile = idRef.current?.files?.[0];

      if (accountType === "creator") {
        if (!ig) {
          setLoading(false);
          setError("Instagram username is required for creators.");
          return;
        }
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
            instagram_handle: accountType === "creator" ? ig : null,
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
            await submitCreatorApplication(ig, avatarFile, idFile, {
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
        router.push("/account");
        router.refresh();
        return;
      }

      setMessage(
        accountType === "creator"
          ? "Account created. Confirm your email, then log in — your photos will upload when you complete signup on the Account page."
          : "Account created. You can log in and start browsing.",
      );
      return;
    }

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError(formatAuthError(signInError.message));
      return;
    }

    if (signInData.user) {
      await ensureUserProfile(supabase, signInData.user);
    }

    router.push(next);
    router.refresh();
  }

  const isCreatorSignup = mode === "signup" && accountType === "creator";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mode === "signup" && (
        <>
          <div>
            <p className="mb-2 text-xs font-medium text-gray-400">I want to join as</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAccountType("user")}
                className={`rounded-xl border p-4 text-left transition-colors ${
                  accountType === "user"
                    ? "border-bp-gold bg-bp-gold/10 ring-1 ring-bp-gold/40"
                    : "border-bp-border bg-bp-panel hover:border-bp-gold-dim"
                }`}
              >
                <span className="text-lg">🛒</span>
                <p className="mt-2 text-sm font-semibold text-white">Buyer / Fan</p>
                <p className="mt-1 text-[11px] leading-snug text-gray-500">
                  Browse, purchase photos & videos
                </p>
              </button>
              <button
                type="button"
                onClick={() => setAccountType("creator")}
                className={`rounded-xl border p-4 text-left transition-colors ${
                  accountType === "creator"
                    ? "border-bp-gold bg-bp-gold/10 ring-1 ring-bp-gold/40"
                    : "border-bp-border bg-bp-panel hover:border-bp-gold-dim"
                }`}
              >
                <span className="text-lg">✨</span>
                <p className="mt-2 text-sm font-semibold text-white">Creator</p>
                <p className="mt-1 text-[11px] leading-snug text-gray-500">
                  Requires photo, ID & admin approval
                </p>
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="displayName" className="mb-1.5 block text-xs font-medium text-gray-400">
              Display name
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-lg border border-bp-border bg-bp-panel px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-bp-gold focus:outline-none focus:ring-1 focus:ring-bp-gold"
              placeholder="Your name"
            />
          </div>

          {isCreatorSignup && (
            <>
              <div>
                <label htmlFor="instagram" className="mb-1.5 block text-xs font-medium text-gray-400">
                  Instagram username
                </label>
                <div className="flex items-center rounded-lg border border-bp-border bg-bp-panel">
                  <span className="pl-3 text-sm text-gray-500">@</span>
                  <input
                    id="instagram"
                    required
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    className="w-full bg-transparent px-2 py-2.5 text-sm text-white focus:outline-none"
                    placeholder="yourhandle"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-400">
                    Profile photo
                  </label>
                  <input
                    ref={avatarRef}
                    type="file"
                    accept="image/*"
                    required
                    className="w-full text-xs text-gray-400 file:mr-2 file:rounded-lg file:border-0 file:bg-bp-chip file:px-3 file:py-2 file:text-xs file:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-400">
                    Photo of ID
                  </label>
                  <input
                    ref={idRef}
                    type="file"
                    accept="image/*"
                    required
                    className="w-full text-xs text-gray-400 file:mr-2 file:rounded-lg file:border-0 file:bg-bp-chip file:px-3 file:py-2 file:text-xs file:text-white"
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
        <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-gray-400">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-bp-border bg-bp-panel px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-bp-gold focus:outline-none focus:ring-1 focus:ring-bp-gold"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-gray-400">
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
          className="w-full rounded-lg border border-bp-border bg-bp-panel px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-bp-gold focus:outline-none focus:ring-1 focus:ring-bp-gold"
          placeholder="••••••••"
        />
      </div>

      {error && (
        <p className="rounded-lg border border-red-900/50 bg-red-950/40 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}
      {message && (
        <p className="rounded-lg border border-emerald-900/50 bg-emerald-950/30 px-3 py-2 text-sm text-emerald-300">
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-bp-gold py-3 text-sm font-semibold text-white shadow-[0_4px_24px_rgba(196,30,58,0.4)] transition-colors hover:bg-bp-gold-dim disabled:opacity-60"
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
            <Link href="/signup" className="text-bp-yellow hover:text-white">
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="text-bp-yellow hover:text-white">
              Log in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
