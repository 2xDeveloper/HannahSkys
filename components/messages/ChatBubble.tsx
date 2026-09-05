import type { ChatMessage } from "@/lib/message-threads";
import { formatBubbleTime } from "@/lib/message-threads";

type ChatBubbleProps = {
  message: ChatMessage;
  showTail?: boolean;
  pending?: boolean;
};

function ReadTicks({ read, pending }: { read: boolean; pending?: boolean }) {
  if (pending) {
    return <span className="ml-1 inline-block opacity-70">…</span>;
  }
  return (
    <span
      className={`ml-1 inline-flex tracking-tighter ${read ? "text-[#fde8f0]" : "text-white/70"}`}
      aria-label={read ? "Read" : "Sent"}
    >
      {read ? "✓✓" : "✓"}
    </span>
  );
}

export function ChatBubble({ message, showTail = true, pending = false }: ChatBubbleProps) {
  const mine = message.isMine;

  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={`relative max-w-[min(88%,420px)] px-3.5 py-2 shadow-[0_1px_2px_rgba(0,0,0,0.35)] transition-opacity ${
          pending ? "opacity-70" : "opacity-100"
        } ${
          mine
            ? `bg-gradient-to-br from-bp-gold to-bp-gold-dim text-white ${
                showTail ? "rounded-[18px] rounded-br-md" : "rounded-[18px]"
              }`
            : `bg-white text-[#4a4550] ring-1 ring-[#fbdce7] ${
                showTail ? "rounded-[18px] rounded-bl-md" : "rounded-[18px]"
              }`
        }`}
      >
        <p className="whitespace-pre-wrap break-words text-[15px] leading-[1.45]">
          {message.body}
        </p>
        <div
          className={`mt-1 flex items-center justify-end gap-0.5 text-[10px] leading-none ${
            mine ? "text-white/70" : "text-gray-500"
          }`}
        >
          <span>{formatBubbleTime(message.created_at)}</span>
          {mine && <ReadTicks read={Boolean(message.read_at)} pending={pending} />}
        </div>
      </div>
    </div>
  );
}

export function DaySeparator({ label }: { label: string }) {
  return (
    <div className="my-4 flex justify-center">
      <span className="rounded-full bg-white px-3 py-1 text-[11px] font-medium text-[#8a8390] shadow-sm ring-1 ring-[#fbdce7]">
        {label}
      </span>
    </div>
  );
}
