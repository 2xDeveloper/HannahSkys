"use client";

import { ChatBubble, DaySeparator } from "@/components/messages/ChatBubble";
import { ChatComposer } from "@/components/messages/ChatComposer";
import { CreatorAvatar } from "@/components/CreatorAvatar";
import type { Conversation } from "@/lib/message-threads";
import { formatDaySeparator, isSameCalendarDay } from "@/lib/message-threads";
import Link from "next/link";
import { useEffect, useRef } from "react";

type ChatThreadProps = {
  conversation: Conversation | null;
  isCreator: boolean;
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  sending: boolean;
  onBack?: () => void;
  showBack?: boolean;
  pendingIds?: Set<string>;
};

export function ChatThread({
  conversation,
  isCreator,
  draft,
  onDraftChange,
  onSend,
  sending,
  onBack,
  showBack,
  pendingIds,
}: ChatThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages.length, conversation?.id, sending]);

  if (!conversation) {
    return (
      <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-8 text-center">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(255,90,154,0.22), transparent 40%), radial-gradient(circle at 80% 80%, rgba(192,132,252,0.12), transparent 45%)",
          }}
        />
        <div className="app-card relative rounded-3xl px-8 py-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#ffe6ef] text-2xl text-[#f4699f]">
            ✉
          </div>
          <p className="app-heading mt-4 font-display text-xl font-extrabold">Your messages</p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-gray-500">
            Pick a chat on the left to reply instantly — like texting, but built into the site.
          </p>
        </div>
      </div>
    );
  }

  const canReply = Boolean(conversation.partnerId) && !(isCreator && conversation.isGuest);
  const disabledHint = conversation.isGuest
    ? "This fan wasn't logged in — you can't reply in-app to guest messages."
    : undefined;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center gap-3 border-b border-[#fdeaf1] bg-white/90 px-3 py-2.5 backdrop-blur-xl">
        {showBack && onBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#f4699f] hover:bg-[#fff0f5] md:hidden"
            aria-label="Back to conversations"
          >
            ←
          </button>
        )}
        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#ffe6ef] ring-1 ring-[#fbdce7]">
          <CreatorAvatar
            src={conversation.partnerAvatarUrl}
            name={conversation.partnerName}
            className="text-sm"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="app-heading truncate text-[15px] font-semibold">
            {conversation.partnerName}
          </p>
          <p className="truncate text-xs text-gray-500">
            {conversation.isGuest
              ? conversation.guestEmail ?? "Guest · not on platform"
              : isCreator
                ? "Fan · tap to keep chatting"
                : "Creator · online on HannahSkys"}
          </p>
        </div>
        {conversation.partnerId && !conversation.isGuest && !isCreator && (
          <Link
            href={`/creator/${conversation.partnerId}`}
            className="landing-btn-outline px-3 py-1.5 text-xs"
          >
            Profile
          </Link>
        )}
      </div>

      <div
        ref={scrollerRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4 sm:px-5"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at top, rgba(255,192,216,0.35), transparent 55%), linear-gradient(180deg, #fff8fb 0%, #fff 100%)",
        }}
      >
        <div className="mx-auto flex max-w-3xl flex-col">
          {conversation.messages.map((msg, i) => {
            const prev = conversation.messages[i - 1];
            const showDay = !prev || !isSameCalendarDay(prev.created_at, msg.created_at);
            const sameSender = Boolean(prev && prev.isMine === msg.isMine && !showDay);
            return (
              <div key={msg.id}>
                {showDay && <DaySeparator label={formatDaySeparator(msg.created_at)} />}
                <div className={sameSender ? "mt-1" : "mt-2.5"}>
                  <ChatBubble
                    message={msg}
                    showTail={!sameSender}
                    pending={pendingIds?.has(msg.id)}
                  />
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} className="h-2" />
        </div>
      </div>

      <ChatComposer
        placeholder={`Message ${conversation.partnerName}`}
        value={draft}
        onChange={onDraftChange}
        onSend={onSend}
        loading={sending}
        disabled={!canReply}
        disabledHint={disabledHint}
      />
    </div>
  );
}
