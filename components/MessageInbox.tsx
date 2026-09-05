"use client";

import { MessageReplyForm } from "@/components/MessageReplyForm";
import type { Message } from "@/lib/messages";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

type CreatorInfo = {
  id: string;
  displayName: string;
  email: string;
};

type MessageInboxProps = {
  messages: Message[];
  mode: "creator" | "fan";
  creator?: CreatorInfo;
  sentMessages?: Message[];
};

export function MessageInbox({ messages, mode, creator, sentMessages = [] }: MessageInboxProps) {
  if (mode === "fan") {
    return <FanInbox received={messages} sent={sentMessages} />;
  }

  if (messages.length === 0) {
    return (
      <div className="app-card rounded-2xl px-6 py-12 text-center">
        <p className="text-sm text-gray-400">No messages yet.</p>
        <p className="mt-1 text-xs text-gray-600">
          When fans message you from your creator profile, they&apos;ll show up here.
        </p>
      </div>
    );
  }

  if (!creator) {
    return null;
  }

  return (
    <ul className="space-y-3">
      {messages.map((msg) => (
        <CreatorMessageItem key={msg.id} message={msg} creator={creator} />
      ))}
    </ul>
  );
}

function FanInbox({ received, sent }: { received: Message[]; sent: Message[] }) {
  const hasReceived = received.length > 0;
  const hasSent = sent.length > 0;

  if (!hasReceived && !hasSent) {
    return (
      <div className="app-card rounded-2xl px-6 py-12 text-center">
        <p className="text-sm text-gray-400">No messages yet.</p>
        <p className="mt-1 text-xs text-gray-600">
          Message a creator from their profile. Replies will show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {hasReceived && (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-rose-300/70">
            Replies from creators
          </h2>
          <ul className="space-y-3">
            {received.map((msg) => (
              <FanMessageItem key={msg.id} message={msg} />
            ))}
          </ul>
        </section>
      )}
      {hasSent && (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-rose-300/70">
            Messages you sent
          </h2>
          <ul className="space-y-3">
            {sent.map((msg) => (
              <li
                key={msg.id}
                className="app-card rounded-xl p-4 md:p-5"
              >
                <p className="text-xs text-gray-600">
                  {new Date(msg.created_at).toLocaleString()}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-300">
                  {msg.body}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function FanMessageItem({ message }: { message: Message }) {
  const router = useRouter();
  const [marking, setMarking] = useState(false);
  const isUnread = !message.read_at;
  const from = message.sender_name ?? "Creator";
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
          ? "border-[#f4699f]/40 bg-[#fff0f5]"
          : "border-[#fbdce7] bg-white"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="app-heading font-medium">{from}</p>
          <p className="mt-1 text-xs text-gray-600">{when}</p>
        </div>
        {isUnread && (
          <button
            type="button"
            onClick={markRead}
            disabled={marking}
            className="landing-btn-outline shrink-0 px-3 py-1 text-xs disabled:opacity-60"
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

function CreatorMessageItem({
  message,
  creator,
}: {
  message: Message;
  creator: CreatorInfo;
}) {
  const router = useRouter();
  const [marking, setMarking] = useState(false);
  const isUnread = !message.read_at;

  const from = message.sender_name ?? message.sender_email ?? "Anonymous";
  const when = new Date(message.created_at).toLocaleString();
  const canReply = Boolean(message.sender_id);

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
          ? "border-[#f4699f]/40 bg-[#fff0f5]"
          : "border-[#fbdce7] bg-white"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="app-heading font-medium">{from}</p>
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
            className="landing-btn-outline shrink-0 px-3 py-1 text-xs disabled:opacity-60"
          >
            {marking ? "…" : "Mark read"}
          </button>
        )}
      </div>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-300">
        {message.body}
      </p>
      {canReply ? (
        <MessageReplyForm
          messageId={message.id}
          fanUserId={message.sender_id!}
          fanName={from}
          creatorId={creator.id}
          creatorName={creator.displayName}
          creatorEmail={creator.email}
        />
      ) : (
        <p className="mt-3 text-xs text-gray-500">
          This fan wasn&apos;t logged in — reply by email if needed.
        </p>
      )}
    </li>
  );
}
