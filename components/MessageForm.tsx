"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type MessageFormProps = {
  creatorId: string;
  creatorName: string;
  userId?: string | null;
  userEmail?: string | null;
  userDisplayName?: string | null;
};

export function MessageForm({
  creatorId,
  creatorName,
  userId,
  userEmail,
  userDisplayName,
}: MessageFormProps) {
  const router = useRouter();
  const isLoggedIn = Boolean(userId);

  const [senderName, setSenderName] = useState(userDisplayName ?? "");
  const [senderEmail, setSenderEmail] = useState(userEmail ?? "");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function openExistingChat() {
    router.push(`/messages?with=${creatorId}`);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    const trimmedBody = body.trim();
    if (trimmedBody.length < 1) {
      setLoading(false);
      setError("Type a message first.");
      return;
    }

    if (!isLoggedIn) {
      if (!senderName.trim() || !senderEmail.trim()) {
        setLoading(false);
        setError("Please enter your name and email.");
        return;
      }
    }

    const supabase = createClient();

    const { error: insertError } = await supabase.from("messages").insert({
      recipient_id: creatorId,
      sender_id: userId ?? null,
      sender_name: isLoggedIn ? userDisplayName ?? senderName.trim() : senderName.trim(),
      sender_email: isLoggedIn ? userEmail ?? senderEmail.trim() : senderEmail.trim(),
      body: trimmedBody,
    });

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setBody("");
    setSuccess(true);

    if (isLoggedIn) {
      router.push(`/messages?with=${creatorId}`);
      return;
    }

    router.refresh();
  }

  return (
    <div className="app-card overflow-hidden rounded-3xl">
      <div className="border-b border-[#fdeaf1] px-5 py-4 md:px-6">
        <h2 className="app-heading text-lg font-semibold">Message {creatorName}</h2>
        <p className="mt-1 text-sm text-gray-500">
          {isLoggedIn
            ? "Opens your chat instantly — like texting."
            : "Send a note, or log in for full chat."}
        </p>
      </div>

      <div className="space-y-4 p-5 md:p-6">
        {isLoggedIn && (
          <button
            type="button"
            onClick={openExistingChat}
            className="landing-btn-primary w-full"
          >
            Open chat with {creatorName}
          </button>
        )}

        {!isLoggedIn && (
          <p className="text-xs text-gray-600">
            <Link href={`/login?next=/creator/${creatorId}`} className="app-link">
              Log in
            </Link>{" "}
            or{" "}
            <Link href={`/signup?next=/creator/${creatorId}`} className="app-link">
              sign up
            </Link>{" "}
            for the full messaging inbox.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {!isLoggedIn && (
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                required
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Your name"
                className="app-input px-3.5 py-3 text-sm"
              />
              <input
                type="email"
                required
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                placeholder="Your email"
                className="app-input px-3.5 py-3 text-sm"
              />
            </div>
          )}

          <div className="flex items-end gap-2 rounded-[22px] border border-[#fbdce7] bg-[#fff7fa] px-3 py-2 focus-within:border-[#f4699f]">
            <textarea
              required
              rows={2}
              maxLength={5000}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={`Message ${creatorName}…`}
              className="max-h-32 min-h-[44px] w-full resize-none bg-transparent py-2 text-[15px] text-[#4a4550] placeholder:text-[#b6aeba] focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="mb-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-bp-gold text-white shadow-lg shadow-bp-gold/25 hover:bg-bp-gold-dim disabled:opacity-50"
              aria-label="Send message"
            >
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
                  <path d="M3.4 20.4 20.85 12.9c.7-.3.7-1.3 0-1.6L3.4 3.8c-.8-.35-1.55.4-1.25 1.2L5 11.2c.1.3.1.5 0 .8l-2.85 6.2c-.3.8.45 1.55 1.25 1.2Z" />
                </svg>
              )}
            </button>
          </div>

          {error && (
            <p className="app-alert-err rounded-xl px-3 py-2 text-sm">
              {error}
            </p>
          )}
          {success && !isLoggedIn && (
            <p className="app-alert-ok rounded-xl px-3 py-2 text-sm">
              Message sent! Log in next time to keep chatting in your inbox.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
