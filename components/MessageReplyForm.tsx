"use client";

import { logDevIssue } from "@/lib/dev-log";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

type MessageReplyFormProps = {
  messageId: string;
  fanUserId: string;
  fanName: string;
  creatorId: string;
  creatorName: string;
  creatorEmail: string;
};

export function MessageReplyForm({
  messageId,
  fanUserId,
  fanName,
  creatorId,
  creatorName,
  creatorEmail,
}: MessageReplyFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const trimmed = body.trim();
    if (trimmed.length < 3) {
      setError("Reply is too short.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { error: insertError } = await supabase.from("messages").insert({
      recipient_id: fanUserId,
      sender_id: creatorId,
      sender_name: creatorName,
      sender_email: creatorEmail,
      body: trimmed,
    });

    setLoading(false);

    if (insertError) {
      if (insertError.message.includes("policy")) {
        logDevIssue("Message reply blocked by policy", insertError.message);
        setError("Could not send reply. Please try again later.");
      } else {
        setError(insertError.message);
      }
      return;
    }

    setBody("");
    setSuccess(true);
    setOpen(false);
    router.refresh();
  }

  if (success) {
    return (
      <p className="mt-3 text-xs text-emerald-400">
        Reply sent to {fanName}. They&apos;ll see it in their Messages.
      </p>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 rounded-lg bg-bp-gold px-3 py-1.5 text-xs font-semibold text-white hover:bg-bp-gold-dim"
      >
        Reply to {fanName}
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-2 border-t border-bp-border pt-3">
      <label htmlFor={`reply-${messageId}`} className="block text-xs font-medium text-gray-400">
        Your reply
      </label>
      <textarea
        id={`reply-${messageId}`}
        rows={3}
        maxLength={5000}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={`Reply to ${fanName}…`}
        className="w-full resize-y rounded-lg border border-bp-border bg-bp-main px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-bp-gold focus:outline-none focus:ring-1 focus:ring-bp-gold"
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-bp-gold px-3 py-1.5 text-xs font-semibold text-white hover:bg-bp-gold-dim disabled:opacity-60"
        >
          {loading ? "Sending…" : "Send reply"}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setError(null);
          }}
          className="rounded-lg px-3 py-1.5 text-xs text-gray-400 hover:text-white"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
