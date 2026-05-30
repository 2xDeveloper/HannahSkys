"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type MessageFormProps = {
  creatorId: string;
  creatorName: string;
  /** Logged-in visitor */
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    const trimmedBody = body.trim();
    if (trimmedBody.length < 3) {
      setLoading(false);
      setError("Message is too short.");
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
    router.refresh();
  }

  return (
    <div className="rounded-2xl border border-bp-border bg-bp-panel p-5 md:p-6">
      <h2 className="text-lg font-semibold text-rose-50">Message {creatorName}</h2>
      <p className="mt-1 text-sm text-gray-500">
        {isLoggedIn
          ? "Send a direct message as your account."
          : "Send a message — log in for a faster experience."}
      </p>

      {!isLoggedIn && (
        <p className="mt-2 text-xs text-gray-600">
          <Link href={`/login?next=/creator/${creatorId}`} className="text-bp-yellow hover:text-white">
            Log in
          </Link>{" "}
          or{" "}
          <Link href={`/signup?next=/creator/${creatorId}`} className="text-bp-yellow hover:text-white">
            sign up
          </Link>{" "}
          to message with your profile.
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        {!isLoggedIn && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="senderName" className="mb-1.5 block text-xs font-medium text-gray-400">
                Your name
              </label>
              <input
                id="senderName"
                required
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="w-full rounded-lg border border-bp-border bg-bp-main px-3 py-2.5 text-sm text-white focus:border-bp-gold focus:outline-none focus:ring-1 focus:ring-bp-gold"
              />
            </div>
            <div>
              <label htmlFor="senderEmail" className="mb-1.5 block text-xs font-medium text-gray-400">
                Your email
              </label>
              <input
                id="senderEmail"
                type="email"
                required
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                className="w-full rounded-lg border border-bp-border bg-bp-main px-3 py-2.5 text-sm text-white focus:border-bp-gold focus:outline-none focus:ring-1 focus:ring-bp-gold"
              />
            </div>
          </div>
        )}

        <div>
          <label htmlFor="messageBody" className="mb-1.5 block text-xs font-medium text-gray-400">
            Message
          </label>
          <textarea
            id="messageBody"
            required
            rows={5}
            maxLength={5000}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={`Say hi to ${creatorName}…`}
            className="w-full resize-y rounded-lg border border-bp-border bg-bp-main px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-bp-gold focus:outline-none focus:ring-1 focus:ring-bp-gold"
          />
        </div>

        {error && (
          <p className="rounded-lg border border-red-900/50 bg-red-950/40 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}
        {success && (
          <p className="rounded-lg border border-emerald-900/50 bg-emerald-950/30 px-3 py-2 text-sm text-emerald-300">
            Message sent! {creatorName} will see it in their inbox.
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-bp-gold px-6 py-3 text-sm font-semibold text-white hover:bg-bp-gold-dim disabled:opacity-60"
        >
          {loading ? "Sending…" : "Send message"}
        </button>
      </form>
    </div>
  );
}
