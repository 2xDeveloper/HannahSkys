"use client";

import { CreatorAvatar } from "@/components/CreatorAvatar";
import type { Conversation } from "@/lib/message-threads";
import { formatMessageTime } from "@/lib/message-threads";

type ConversationListProps = {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  isCreator: boolean;
};

export function ConversationList({
  conversations,
  activeId,
  onSelect,
  isCreator,
}: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-bp-chip text-2xl">
          💬
        </div>
        <p className="mt-4 text-sm font-medium text-gray-300">No conversations yet</p>
        <p className="mt-1 max-w-xs text-xs leading-relaxed text-gray-500">
          {isCreator
            ? "When fans message you from your profile, chats will appear here."
            : "Message a creator from their profile to start a conversation."}
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-bp-border/80">
      {conversations.map((convo) => {
        const active = convo.id === activeId;
        return (
          <li key={convo.id}>
            <button
              type="button"
              onClick={() => onSelect(convo.id)}
              className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors ${
                active ? "bg-bp-gold/10" : "hover:bg-bp-chip/60"
              }`}
            >
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full ring-2 ring-bp-border">
                <CreatorAvatar
                  src={convo.partnerAvatarUrl}
                  name={convo.partnerName}
                  className="text-sm"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className={`truncate text-sm font-semibold ${active ? "text-white" : "text-gray-200"}`}>
                    {convo.partnerName}
                    {convo.isGuest && (
                      <span className="ml-1.5 text-[10px] font-normal text-gray-500">Guest</span>
                    )}
                  </p>
                  <span className="shrink-0 text-[10px] text-gray-500">
                    {formatMessageTime(convo.lastAt)}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-xs text-gray-500">
                  {convo.lastMessage}
                </p>
              </div>
              {convo.unreadCount > 0 && (
                <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-bp-gold px-1.5 text-[10px] font-bold text-white">
                  {convo.unreadCount > 9 ? "9+" : convo.unreadCount}
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
