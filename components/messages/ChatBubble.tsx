import type { ChatMessage } from "@/lib/message-threads";
import { formatBubbleTime } from "@/lib/message-threads";

type ChatBubbleProps = {
  message: ChatMessage;
  showTail?: boolean;
};

export function ChatBubble({ message, showTail = true }: ChatBubbleProps) {
  const mine = message.isMine;

  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={`relative max-w-[min(85%,320px)] px-4 py-2.5 shadow-sm ${
          mine
            ? `bg-bp-gold text-white ${showTail ? "rounded-2xl rounded-br-md" : "rounded-2xl"}`
            : `bg-bp-panel text-gray-100 ring-1 ring-bp-border ${showTail ? "rounded-2xl rounded-bl-md" : "rounded-2xl"}`
        }`}
      >
        <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">
          {message.body}
        </p>
        <p
          className={`mt-1 text-[10px] ${mine ? "text-right text-white/70" : "text-right text-gray-500"}`}
        >
          {formatBubbleTime(message.created_at)}
          {mine && message.read_at && <span className="ml-1.5">· Read</span>}
        </p>
      </div>
    </div>
  );
}
