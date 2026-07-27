"use client";

import { useEffect, useRef } from "react";

type ChatComposerProps = {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  loading?: boolean;
  disabled?: boolean;
  disabledHint?: string;
};

export function ChatComposer({
  placeholder,
  value,
  onChange,
  onSend,
  loading = false,
  disabled = false,
  disabledHint,
}: ChatComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canSend = !disabled && !loading && value.trim().length > 0;

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [value]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (canSend) onSend();
    }
  }

  return (
    <div className="shrink-0 border-t border-white/5 bg-bp-black/90 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2.5 backdrop-blur-xl">
      {disabled && disabledHint && (
        <p className="mb-2 text-center text-xs text-gray-500">{disabledHint}</p>
      )}
      <div className="mx-auto flex max-w-3xl items-end gap-2">
        <div className="flex min-h-[48px] flex-1 items-end rounded-[24px] border border-white/8 bg-[#1f181c] px-4 py-2.5 shadow-inner focus-within:border-bp-gold/40">
          <textarea
            ref={textareaRef}
            rows={1}
            value={value}
            disabled={disabled || loading}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            maxLength={5000}
            className="max-h-[140px] min-h-[24px] w-full resize-none bg-transparent text-[15px] leading-6 text-white placeholder:text-gray-600 focus:outline-none disabled:opacity-50"
          />
        </div>
        <button
          type="button"
          onClick={onSend}
          disabled={!canSend}
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white shadow-lg transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-35 ${
            canSend
              ? "bg-bp-gold shadow-bp-gold/30 hover:bg-bp-gold-dim"
              : "bg-[#2a2227]"
          }`}
          aria-label="Send message"
        >
          {loading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
              <path d="M3.4 20.4 20.85 12.9c.7-.3.7-1.3 0-1.6L3.4 3.8c-.8-.35-1.55.4-1.25 1.2L5 11.2c.1.3.1.5 0 .8l-2.85 6.2c-.3.8.45 1.55 1.25 1.2Z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
