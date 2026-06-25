import type { Message } from "@/lib/messages";

export type PartnerProfile = {
  display_name: string | null;
  avatar_url: string | null;
};

export type ChatMessage = Message & {
  isMine: boolean;
};

export type Conversation = {
  id: string;
  partnerId: string | null;
  partnerName: string;
  partnerAvatarUrl: string | null;
  isGuest: boolean;
  guestEmail: string | null;
  messages: ChatMessage[];
  lastMessage: string;
  lastAt: string;
  unreadCount: number;
};

export function partnerKeyForMessage(msg: Message, myId: string): string {
  if (msg.recipient_id === myId) {
    if (msg.sender_id) return msg.sender_id;
    const email = msg.sender_email?.trim().toLowerCase();
    const name = msg.sender_name?.trim().toLowerCase();
    return `guest:${email || name || msg.id}`;
  }
  return msg.recipient_id;
}

export function buildConversations(
  messages: Message[],
  myId: string,
  profiles: Record<string, PartnerProfile>,
): Conversation[] {
  const grouped = new Map<string, Message[]>();

  for (const msg of messages) {
    const key = partnerKeyForMessage(msg, myId);
    const list = grouped.get(key) ?? [];
    list.push(msg);
    grouped.set(key, list);
  }

  const conversations: Conversation[] = [];

  for (const [id, threadMessages] of grouped) {
    const sorted = [...threadMessages].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );

    const isGuest = id.startsWith("guest:");
    const partnerId = isGuest ? null : id;
    const firstInbound = sorted.find((m) => m.recipient_id === myId);
    const profile = partnerId ? profiles[partnerId] : undefined;

    const partnerName = isGuest
      ? firstInbound?.sender_name?.trim() || "Guest fan"
      : profile?.display_name?.trim() || firstInbound?.sender_name?.trim() || "User";

    const chatMessages: ChatMessage[] = sorted.map((m) => ({
      ...m,
      isMine: m.sender_id === myId,
    }));

    const last = sorted[sorted.length - 1];
    const unreadCount = sorted.filter(
      (m) => m.recipient_id === myId && !m.read_at,
    ).length;

    conversations.push({
      id,
      partnerId,
      partnerName,
      partnerAvatarUrl: profile?.avatar_url ?? null,
      isGuest,
      guestEmail: isGuest ? firstInbound?.sender_email ?? null : null,
      messages: chatMessages,
      lastMessage: last.body,
      lastAt: last.created_at,
      unreadCount,
      });
  }

  return conversations.sort(
    (a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime(),
  );
}

export function formatMessageTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) return "Yesterday";

  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function formatBubbleTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}
