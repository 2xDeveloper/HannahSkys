"use client";

import type { Message } from "@/lib/messages";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

type MessageInboxProps = {
  messages: Message[];
};

export function MessageInbox({ messages }: MessageInboxProps) {
  if (messages.length === 0) {
    return (
      <div className="rounded-2xl border border-bp-border bg-bp-panel px-6 py-12 text-center">
        <p className="text-sm text-gray-400">No messages yet.</p>
        <p className="mt-1 text-xs text-gray-600">
          When fans message you from your creator profile, they&apos;ll show up here.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {messages.map((msg) => (
        <MessageItem key={msg.id} message={msg} />
      ))}
    </ul>
  );
}

function MessageItem({ message }: { message: Message }) {
  const router = useRouter();
  const [marking, setMarking] = useState(false);
  const isUnread = !message.read_at;

  const from = message.sender_name ?? message.sender_email ?? "Anonymous";
  const when = new Date(message.created_at).toLocaleString();

  async function markRead() {
    if (!isUnread || marking) return;
    setMarking(true);

    const supabase = createClient();
    await supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .eq("id", message.id);

    setMarking(false);
    router.refresh();
  }

  return (
    <li
      className={`rounded-xl border p-4 md:p-5 ${
        isUnread
          ? "border-bp-gold/40 bg-bp-gold/5"
          : "border-bp-border bg-bp-panel"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-medium text-white">{from}</p>
          {message.sender_email && (
            <p className="text-xs text-gray-500">{message.sender_email}</p>
          )}
          <p className="mt-1 text-xs text-gray-600">{when}</p>
        </div>
        {isUnread && (
          <button
            type="button"
            onClick={markRead}
            disabled={marking}
            className="shrink-0 rounded-lg bg-bp-chip px-3 py-1 text-xs text-bp-yellow hover:bg-bp-chip-hover disabled:opacity-60"
          >
            {marking ? "…" : "Mark read"}
          </button>
        )}
      </div>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-300">
        {message.body}
      </p>
    </li>
  );
}
