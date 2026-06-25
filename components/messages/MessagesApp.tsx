"use client";

import { ConversationList } from "@/components/messages/ConversationList";
import { ChatThread } from "@/components/messages/ChatThread";
import { logDevIssue } from "@/lib/dev-log";
import {
  buildConversations,
  partnerKeyForMessage,
  type Conversation,
} from "@/lib/message-threads";
import type { Message } from "@/lib/messages";
import type { PartnerProfile } from "@/lib/message-threads";
import { createClient } from "@/lib/supabase/client";
import { useCallback, useEffect, useMemo, useState } from "react";

type MessagesAppProps = {
  userId: string;
  userName: string;
  userEmail: string;
  isCreator: boolean;
  initialMessages: Message[];
  partnerProfiles: Record<string, PartnerProfile>;
  initialThreadId?: string | null;
};

export function MessagesApp({
  userId,
  userName,
  userEmail,
  isCreator,
  initialMessages,
  partnerProfiles,
  initialThreadId,
}: MessagesAppProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [profiles, setProfiles] = useState(partnerProfiles);
  const [activeId, setActiveId] = useState<string | null>(initialThreadId ?? null);
  const [mobileShowThread, setMobileShowThread] = useState(Boolean(initialThreadId));
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const conversations = useMemo(
    () => buildConversations(messages, userId, profiles),
    [messages, userId, profiles],
  );

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId],
  );

  const mergeMessage = useCallback((msg: Message) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === msg.id)) return prev;
      return [...prev, msg].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      );
    });

    const partnerId = partnerKeyForMessage(msg, userId);
    if (!partnerId.startsWith("guest:") && !profiles[partnerId]) {
      void (async () => {
        const supabase = createClient();
        const { data } = await supabase
          .from("profiles")
          .select("id, display_name, avatar_url")
          .eq("id", partnerId)
          .maybeSingle();
        if (data) {
          setProfiles((p) => ({
            ...p,
            [data.id]: { display_name: data.display_name, avatar_url: data.avatar_url },
          }));
        }
      })();
    }
  }, [profiles, userId]);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`messages:${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const msg = payload.new as Message;
          if (msg.recipient_id === userId || msg.sender_id === userId) {
            mergeMessage(msg);
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages" },
        (payload) => {
          const updated = payload.new as Message;
          setMessages((prev) =>
            prev.map((m) => (m.id === updated.id ? { ...m, ...updated } : m)),
          );
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId, mergeMessage]);

  const markThreadRead = useCallback(
    async (convo: Conversation) => {
      const unread = convo.messages.filter(
        (m) => m.recipient_id === userId && !m.read_at,
      );
      if (unread.length === 0) return;

      const supabase = createClient();
      const now = new Date().toISOString();

      await Promise.all(
        unread.map((m) =>
          supabase.from("messages").update({ read_at: now }).eq("id", m.id),
        ),
      );

      setMessages((prev) =>
        prev.map((m) =>
          unread.some((u) => u.id === m.id) ? { ...m, read_at: now } : m,
        ),
      );
    },
    [userId],
  );

  useEffect(() => {
    if (activeConversation) {
      void markThreadRead(activeConversation);
    }
  }, [activeConversation, markThreadRead]);

  useEffect(() => {
    if (!activeId && conversations.length > 0 && !initialThreadId) {
      setActiveId(conversations[0].id);
    }
  }, [activeId, conversations, initialThreadId]);

  function selectConversation(id: string) {
    setActiveId(id);
    setMobileShowThread(true);
    setSendError(null);
  }

  async function handleSend() {
    if (!activeConversation || sending) return;

    const trimmed = draft.trim();
    if (trimmed.length < 1) return;

    const partnerId = activeConversation.partnerId;
    if (!partnerId) return;

    setSending(true);
    setSendError(null);

    const supabase = createClient();
    const { data, error } = await supabase
      .from("messages")
      .insert({
        recipient_id: partnerId,
        sender_id: userId,
        sender_name: userName,
        sender_email: userEmail,
        body: trimmed,
      })
      .select()
      .single();

    setSending(false);

    if (error) {
      logDevIssue("Chat send failed", error.message);
      setSendError("Could not send message. Try again.");
      return;
    }

    if (data) {
      mergeMessage(data as Message);
      setDraft("");
    }
  }

  return (
    <div className="flex min-h-0 flex-1">
      <aside
        className={`flex w-full shrink-0 flex-col border-r border-bp-border bg-bp-black/40 md:w-[320px] lg:w-[360px] ${
          mobileShowThread ? "hidden md:flex" : "flex"
        }`}
      >
        <div className="shrink-0 border-b border-bp-border px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Conversations
          </p>
          <p className="mt-0.5 text-sm text-gray-400">
            {conversations.length === 0
              ? "Start messaging from a creator profile"
              : `${conversations.length} active`}
          </p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <ConversationList
            conversations={conversations}
            activeId={activeId}
            onSelect={selectConversation}
            isCreator={isCreator}
          />
        </div>
      </aside>

      <section
        className={`flex min-w-0 flex-1 flex-col ${
          mobileShowThread ? "flex" : "hidden md:flex"
        }`}
      >
        {sendError && (
          <p className="shrink-0 border-b border-red-900/40 bg-red-950/30 px-4 py-2 text-center text-xs text-red-300">
            {sendError}
          </p>
        )}
        <ChatThread
          conversation={activeConversation}
          userName={userName}
          isCreator={isCreator}
          draft={draft}
          onDraftChange={setDraft}
          onSend={handleSend}
          sending={sending}
          showBack
          onBack={() => setMobileShowThread(false)}
        />
      </section>
    </div>
  );
}
