"use client";

import { CreatorAvatar } from "@/components/CreatorAvatar";
import type { Conversation } from "@/lib/message-threads";
import { formatMessageTime } from "@/lib/message-threads";

type ConversationListProps = {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  isCreator: boolean;
  search: string;
  onSearchChange: (value: string) => void;
};

export function ConversationList({
  conversations,
  activeId,
  onSelect,
  isCreator,
  search,
  onSearchChange,
}: ConversationListProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 px-3 pb-2 pt-3">
        <label className="relative block">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
              <path d="M10.5 3a7.5 7.5 0 0 1 5.95 12.1l4.22 4.23a1 1 0 0 1-1.41 1.41l-4.23-4.22A7.5 7.5 0 1 1 10.5 3Zm0 2a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11Z" />
            </svg>
          </span>
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search chats"
            className="w-full rounded-2xl border border-transparent bg-[#1f181c] py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-gray-600 focus:border-bp-gold/40 focus:outline-none"
          />
        </label>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2a2227] text-xl text-bp-yellow">
              ✉
            </div>
            <p className="mt-4 text-sm font-medium text-gray-200">
              {search.trim() ? "No matching chats" : "No conversations yet"}
            </p>
            <p className="mt-1.5 max-w-[220px] text-xs leading-relaxed text-gray-500">
              {search.trim()
                ? "Try another name or message."
                : isCreator
                  ? "When fans message you, chats show up here instantly."
                  : "Open any creator profile and tap Message to start."}
            </p>
          </div>
        ) : (
          <ul className="pb-3">
            {conversations.map((convo) => {
              const active = convo.id === activeId;
              const unread = convo.unreadCount > 0;
              return (
                <li key={convo.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(convo.id)}
                    className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                      active ? "bg-bp-gold/12" : "hover:bg-white/[0.04] active:bg-white/[0.06]"
                    }`}
                  >
                    <div className="relative h-12 w-12 shrink-0">
                      <div className="h-12 w-12 overflow-hidden rounded-full bg-[#2a2227] ring-1 ring-white/10">
                        <CreatorAvatar
                          src={convo.partnerAvatarUrl}
                          name={convo.partnerName}
                          className="text-sm"
                        />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1 border-b border-white/[0.04] pb-2.5">
                      <div className="flex items-baseline justify-between gap-2">
                        <p
                          className={`truncate text-[15px] ${
                            unread ? "font-semibold text-white" : "font-medium text-gray-200"
                          }`}
                        >
                          {convo.partnerName}
                          {convo.isGuest && (
                            <span className="ml-1.5 text-[10px] font-normal text-gray-500">
                              Guest
                            </span>
                          )}
                        </p>
                        <span
                          className={`shrink-0 text-[11px] ${
                            unread ? "font-medium text-bp-yellow" : "text-gray-500"
                          }`}
                        >
                          {formatMessageTime(convo.lastAt)}
                        </span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-2">
                        <p
                          className={`min-w-0 flex-1 truncate text-[13px] ${
                            unread ? "text-gray-300" : "text-gray-500"
                          }`}
                        >
                          {convo.lastMessage}
                        </p>
                        {unread && (
                          <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-bp-gold px-1.5 text-[10px] font-bold text-white">
                            {convo.unreadCount > 99 ? "99+" : convo.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
