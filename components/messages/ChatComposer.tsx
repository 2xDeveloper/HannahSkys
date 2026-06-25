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

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [value]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && !loading && value.trim()) onSend();
    }
  }

  return (
    <div className="shrink-0 border-t border-bp-border bg-bp-black/80 px-4 py-3 backdrop-blur-md">
      {disabled && disabledHint && (
        <p className="mb-2 text-center text-xs text-gray-500">{disabledHint}</p>
      )}
      <div className="mx-auto flex max-w-3xl items-end gap-2">
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          disabled={disabled || loading}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          maxLength={5000}
          className="max-h-[120px] min-h-[44px] flex-1 resize-none rounded-2xl border border-bp-border bg-bp-panel px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:border-bp-gold/60 focus:outline-none focus:ring-1 focus:ring-bp-gold/40 disabled:opacity-50"
        />
        <button
          type="button"
          onClick={onSend}
          disabled={disabled || loading || value.trim().length < 1}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-bp-gold text-lg text-white shadow-lg shadow-bp-gold/20 transition-transform hover:bg-bp-gold-dim active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Send message"
        >
          {loading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            "↑"
          )}
        </button>
      </div>
      <p className="mx-auto mt-2 max-w-3xl text-center text-[10px] text-gray-600">
        Press Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}
