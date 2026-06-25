"use client";

import { ChatBubble } from "@/components/messages/ChatBubble";
import { ChatComposer } from "@/components/messages/ChatComposer";
import { CreatorAvatar } from "@/components/CreatorAvatar";
import type { Conversation } from "@/lib/message-threads";
import Link from "next/link";
import { useEffect, useRef } from "react";

type ChatThreadProps = {
  conversation: Conversation | null;
  userName: string;
  isCreator: boolean;
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  sending: boolean;
  onBack?: () => void;
  showBack?: boolean;
};

export function ChatThread({
  conversation,
  userName,
  isCreator,
  draft,
  onDraftChange,
  onSend,
  sending,
  onBack,
  showBack,
}: ChatThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages.length, conversation?.id]);

  if (!conversation) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        <div className="rounded-3xl border border-bp-border bg-bp-panel/50 px-10 py-12 shadow-xl">
          <p className="text-lg font-medium text-rose-50">Select a conversation</p>
          <p className="mt-2 max-w-sm text-sm text-gray-500">
            Pick a chat from the list to view messages and reply in real time.
          </p>
        </div>
      </div>
    );
  }

  const canReply = Boolean(conversation.partnerId) && !(isCreator && conversation.isGuest);
  const disabledHint = conversation.isGuest
    ? "This fan wasn't logged in — reply using their email if needed."
    : undefined;

  const placeholder = isCreator
    ? `Message ${conversation.partnerName}…`
    : `Message ${conversation.partnerName}…`;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center gap-3 border-b border-bp-border bg-bp-black/50 px-4 py-3 backdrop-blur-md">
        {showBack && onBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex h-9 w-9 items-center justify-center rounded-full text-bp-yellow hover:bg-bp-chip md:hidden"
            aria-label="Back to conversations"
          >
            ←
          </button>
        )}
        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full ring-2 ring-bp-border">
          <CreatorAvatar
            src={conversation.partnerAvatarUrl}
            name={conversation.partnerName}
            className="text-sm"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-white">{conversation.partnerName}</p>
          <p className="truncate text-xs text-gray-500">
            {conversation.isGuest
              ? conversation.guestEmail ?? "Guest · not on platform"
              : isCreator
                ? "Fan"
                : "Creator"}
          </p>
        </div>
        {conversation.partnerId && !conversation.isGuest && (
          <Link
            href={isCreator ? "#" : `/creator/${conversation.partnerId}`}
            className={`hidden text-xs text-bp-yellow hover:text-white sm:inline ${
              isCreator ? "pointer-events-none opacity-0" : ""
            }`}
          >
            View profile
          </Link>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto bg-[radial-gradient(ellipse_at_top,_rgba(196,30,58,0.06)_0%,_transparent_55%)] px-4 py-5">
        <div className="mx-auto flex max-w-3xl flex-col gap-2">
          {conversation.messages.map((msg, i) => {
            const prev = conversation.messages[i - 1];
            const sameSender = prev && prev.isMine === msg.isMine;
            return (
              <div key={msg.id} className={sameSender ? "mt-0.5" : "mt-3"}>
                <ChatBubble message={msg} showTail={!sameSender} />
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      <ChatComposer
        placeholder={placeholder}
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
