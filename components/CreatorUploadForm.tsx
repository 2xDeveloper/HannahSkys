"use client";

import { deleteCreatorContent, uploadCreatorContent } from "@/lib/content-client";
import { createClient } from "@/lib/supabase/client";
import type { CreatorContent } from "@/lib/types/content";
import {
  formatContentPrice,
  isFreeContent,
  isImageFile,
  mediaTypeFromFile,
  priceToCents,
} from "@/lib/types/content";
import Link from "next/link";
import { useRef, useState } from "react";

type ContentWithUrl = CreatorContent & { display_url: string };

type FilePreview = { url: string; label: string };

type CreatorUploadFormProps = {
  userId: string;
  existingContent: ContentWithUrl[];
};

function FileDropZone({
  id,
  label,
  hint,
  accept,
  preview,
  onPick,
  dragOver,
  onDragOver,
  onDragLeave,
  onDrop,
}: {
  id: string;
  label: string;
  hint: string;
  accept: string;
  preview: FilePreview | null;
  onPick: (file: File | undefined) => void;
  dragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-xs font-medium text-gray-400">
        {label}
      </label>
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`relative rounded-xl border-2 border-dashed transition-colors ${
          dragOver
            ? "border-bp-gold bg-bp-gold/10"
            : "border-bp-border bg-bp-main/50 hover:border-bp-gold-dim"
        }`}
      >
        <input
          id={id}
          type="file"
          accept={accept}
          onChange={(e) => onPick(e.target.files?.[0])}
          className="absolute inset-0 z-10 cursor-pointer opacity-0"
        />
        {preview ? (
          <div className="relative flex min-h-[140px] items-center justify-center p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview.url}
              alt=""
              className="max-h-40 rounded-lg object-contain"
            />
            <span className="absolute bottom-2 right-2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] text-white">
              {preview.label}
            </span>
          </div>
        ) : (
          <div className="flex min-h-[120px] flex-col items-center justify-center gap-2 px-4 py-6 text-center">
            <span className="text-2xl opacity-80">📁</span>
            <p className="text-xs text-gray-400">{hint}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function CreatorUploadForm({
  userId,
  existingContent,
}: CreatorUploadFormProps) {
  const fullFileRef = useRef<File | null>(null);
  const previewTeaserRef = useRef<File | null>(null);

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [isFree, setIsFree] = useState(true);
  const [fullPreview, setFullPreview] = useState<FilePreview | null>(null);
  const [teaserPreview, setTeaserPreview] = useState<FilePreview | null>(null);
  const [dragFull, setDragFull] = useState(false);
  const [dragTeaser, setDragTeaser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function revoke(url: string | undefined) {
    if (url) URL.revokeObjectURL(url);
  }

  function setFullFile(file: File | undefined) {
    revoke(fullPreview?.url);
    if (!file) {
      fullFileRef.current = null;
      setFullPreview(null);
      return;
    }
    const mediaType = mediaTypeFromFile(file);
    if (!mediaType) {
      setError("Full file must be an image or video.");
      return;
    }
    setError(null);
    fullFileRef.current = file;
    setFullPreview({
      url: URL.createObjectURL(file),
      label: mediaType === "video" ? "Video" : "Photo",
    });
  }

  function setTeaserFile(file: File | undefined) {
    revoke(teaserPreview?.url);
    if (!file) {
      previewTeaserRef.current = null;
      setTeaserPreview(null);
      return;
    }
    if (!isImageFile(file)) {
      setError("Preview must be an image (what fans see before buying).");
      return;
    }
    setError(null);
    previewTeaserRef.current = file;
    setTeaserPreview({ url: URL.createObjectURL(file), label: "Preview" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const fullFile = fullFileRef.current;
    if (!fullFile) {
      setError(isFree ? "Add a photo or video." : "Add the full paid file.");
      return;
    }
    if (!title.trim()) {
      setError("Add a title.");
      return;
    }

    const mediaType = mediaTypeFromFile(fullFile);
    if (!mediaType) {
      setError("Full file must be an image or video.");
      return;
    }

    let priceCents: number | null = null;
    if (!isFree) {
      priceCents = priceToCents(price);
      if (priceCents == null || priceCents <= 0) {
        setError("Enter a price or choose Free.");
        return;
      }
      if (!previewTeaserRef.current) {
        setError("Paid posts need a preview image fans can see on the gallery.");
        return;
      }
    }

    setLoading(true);
    const supabase = createClient();

    try {
      await uploadCreatorContent(
        supabase,
        userId,
        title.trim(),
        fullFile,
        mediaType,
        priceCents,
        isFree ? null : previewTeaserRef.current,
      );
      window.location.assign("/account?published=1#upload");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed.";
      if (msg.includes("creator_content") || msg.includes("preview_storage")) {
        setError(
          `${msg} — Run supabase/migration-content-preview.sql in Supabase SQL Editor.`,
        );
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(item: ContentWithUrl) {
    if (!window.confirm(`Delete “${item.title}”?`)) return;
    setDeletingId(item.id);
    setError(null);
    const supabase = createClient();
    try {
      await deleteCreatorContent(
        supabase,
        item.id,
        item.storage_path,
        item.preview_storage_path,
      );
      window.location.assign("/account#upload");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div id="upload" className="scroll-mt-6 space-y-8">
      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-2xl border border-bp-gold/25 bg-gradient-to-br from-bp-panel via-bp-panel to-bp-chip/40 shadow-xl shadow-black/30"
      >
        <div className="border-b border-bp-border/80 bg-bp-gold/10 px-6 py-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-bp-yellow">
                Creator studio
              </p>
              <h2 className="mt-1 text-xl font-bold text-rose-50">Upload photos & videos</h2>
              <p className="mt-1 max-w-lg text-sm text-gray-400">
                {isFree
                  ? "Free posts show the full file on the gallery."
                  : "Paid posts show only your preview on the gallery — the full file stays locked until purchase."}
              </p>
            </div>
            <Link
              href={`/creator/${userId}`}
              className="rounded-lg border border-bp-border bg-bp-main/60 px-3 py-1.5 text-xs text-bp-yellow hover:border-bp-gold-dim hover:text-white"
            >
              Preview profile →
            </Link>
          </div>
        </div>

        <div className="space-y-5 p-6">
          <div>
            <label htmlFor="content-title" className="mb-2 block text-xs font-medium text-gray-400">
              Title
            </label>
            <input
              id="content-title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Exclusive set, BTS clip…"
              className="w-full rounded-xl border border-bp-border bg-bp-main/80 px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:border-bp-gold focus:outline-none focus:ring-1 focus:ring-bp-gold/50"
            />
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-gray-400">Pricing</p>
            <div className="inline-flex rounded-xl border border-bp-border bg-bp-main/80 p-1">
              <button
                type="button"
                onClick={() => {
                  setIsFree(true);
                  setTeaserFile(undefined);
                }}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  isFree
                    ? "bg-emerald-800/80 text-white shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Free
              </button>
              <button
                type="button"
                onClick={() => setIsFree(false)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  !isFree
                    ? "bg-bp-gold text-white shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Paid
              </button>
            </div>
            {!isFree && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-lg font-medium text-gray-400">$</span>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="9.99"
                  className="w-32 rounded-xl border border-bp-border bg-bp-main px-4 py-2.5 text-sm text-white focus:border-bp-gold focus:outline-none"
                />
                <span className="text-xs text-gray-500">USD</span>
              </div>
            )}
          </div>

          {isFree ? (
            <FileDropZone
              id="free-file"
              label="Photo or video"
              hint="Drag & drop or click — shown in full on the gallery"
              accept="image/*,video/*"
              preview={fullPreview}
              onPick={setFullFile}
              dragOver={dragFull}
              onDragOver={(e) => {
                e.preventDefault();
                setDragFull(true);
              }}
              onDragLeave={() => setDragFull(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragFull(false);
                setFullFile(e.dataTransfer.files?.[0]);
              }}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <FileDropZone
                id="preview-teaser"
                label="Preview image (public)"
                hint="What fans see on home & profile — e.g. blurred teaser, cover shot"
                accept="image/*"
                preview={teaserPreview}
                onPick={setTeaserFile}
                dragOver={dragTeaser}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragTeaser(true);
                }}
                onDragLeave={() => setDragTeaser(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragTeaser(false);
                  setTeaserFile(e.dataTransfer.files?.[0]);
                }}
              />
              <FileDropZone
                id="paid-full"
                label="Full file (locked)"
                hint="Photo or video buyers get after purchase — never shown on gallery"
                accept="image/*,video/*"
                preview={fullPreview}
                onPick={setFullFile}
                dragOver={dragFull}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragFull(true);
                }}
                onDragLeave={() => setDragFull(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragFull(false);
                  setFullFile(e.dataTransfer.files?.[0]);
                }}
              />
            </div>
          )}

          {error && (
            <p className="rounded-lg border border-red-900/50 bg-red-950/40 px-4 py-2.5 text-sm text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-bp-gold py-3.5 text-sm font-semibold text-white shadow-[0_4px_24px_rgba(196,30,58,0.45)] transition-all hover:bg-bp-gold-dim disabled:opacity-60 sm:w-auto sm:px-10"
          >
            {loading ? "Publishing…" : "Publish to gallery"}
          </button>
        </div>
      </form>

      {existingContent.length > 0 && (
        <section className="rounded-2xl border border-bp-border bg-bp-panel p-6">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-rose-50">
              Your library
              <span className="ml-2 rounded-full bg-bp-chip px-2 py-0.5 text-xs text-gray-400">
                {existingContent.length}
              </span>
            </h3>
            <Link href="/" className="text-xs text-bp-yellow hover:text-white">
              View on home →
            </Link>
          </div>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {existingContent.map((item) => {
              const paid = !isFreeContent(item);
              return (
                <li
                  key={item.id}
                  className="group flex gap-3 rounded-xl border border-bp-border bg-bp-main/60 p-3"
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-bp-chip ring-1 ring-bp-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.display_url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    {paid && (
                      <span className="absolute bottom-0 left-0 right-0 bg-bp-gold/90 py-0.5 text-center text-[8px] font-bold text-white">
                        PREVIEW
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{item.title}</p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {paid
                        ? `${item.media_type === "video" ? "Video" : "Photo"} · full locked`
                        : item.media_type === "video"
                          ? "Video · free"
                          : "Photo · free"}
                    </p>
                    <p
                      className={`mt-1 text-xs font-semibold ${
                        paid ? "text-bp-yellow" : "text-emerald-400"
                      }`}
                    >
                      {formatContentPrice(item.price_cents)}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={deletingId === item.id}
                    onClick={() => handleDelete(item)}
                    className="self-center shrink-0 rounded-lg px-2 py-1 text-xs text-red-400 hover:bg-red-950/40 disabled:opacity-40"
                  >
                    {deletingId === item.id ? "…" : "Remove"}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
