"use client";

import { MediaWatermark } from "@/components/MediaWatermark";
import { VideoUploadInfo } from "@/components/VideoUploadInfo";
import { deleteCreatorContent, uploadCreatorContent } from "@/lib/content-client";
import { logDevIssue } from "@/lib/dev-log";
import {
  formatFileSize,
  isOverUploadLimit,
  mapUploadErrorMessage,
  maxUploadLabel,
} from "@/lib/upload-limits";
import { createClient } from "@/lib/supabase/client";
import type { CreatorContent } from "@/lib/types/content";
import {
  COLLECT_LABEL,
  formatContentPrice,
  getPublicDisplayMediaType,
  isFreeContent,
  isVideoFile,
  mediaTypeFromFile,
  priceToCents,
} from "@/lib/types/content";
import { prepareMediaForUpload } from "@/lib/watermark";
import {
  formatDuration,
  getVideoMetadata,
  type VideoMetadata,
  videoNeedsOptimization,
} from "@/lib/video-optimize";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

type ContentWithUrl = CreatorContent & { display_url: string };

type FilePreview = { url: string; label: string; size: number; isVideo: boolean };

type UploadSlotState = {
  autoOptimize: boolean;
  metadata: VideoMetadata | null;
  metadataLoading: boolean;
  optimizing: boolean;
  optimizeProgress: number;
  optimizeMessage: string;
  wasOptimized: boolean;
};

function defaultUploadSlot(): UploadSlotState {
  return {
    autoOptimize: true,
    metadata: null,
    metadataLoading: false,
    optimizing: false,
    optimizeProgress: 0,
    optimizeMessage: "",
    wasOptimized: false,
  };
}

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
  fileInfo,
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
  fileInfo?: React.ReactNode;
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
            {preview.label === "Video" ? (
              <>
                <video
                  src={preview.url}
                  className="max-h-40 max-w-full rounded-lg"
                  muted
                  playsInline
                  preload="metadata"
                />
                <MediaWatermark compact />
              </>
            ) : (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview.url}
                  alt=""
                  className="max-h-40 rounded-lg object-contain"
                />
                <MediaWatermark compact />
              </>
            )}
            <span className="absolute bottom-2 right-2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] text-white">
              {preview.label}
            </span>
            <span className="absolute bottom-2 left-2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] text-white">
              {formatFileSize(preview.size)}
            </span>
          </div>
        ) : (
          <div className="flex min-h-[120px] flex-col items-center justify-center gap-2 px-4 py-6 text-center">
            <span className="text-2xl opacity-80">📁</span>
            <p className="text-xs text-gray-400">{hint}</p>
          </div>
        )}
      </div>
      {fileInfo}
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
  const [fullSlot, setFullSlot] = useState<UploadSlotState>(defaultUploadSlot);
  const [teaserSlot, setTeaserSlot] = useState<UploadSlotState>(defaultUploadSlot);
  const [dragFull, setDragFull] = useState(false);
  const [dragTeaser, setDragTeaser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function revoke(url: string | undefined) {
    if (url) URL.revokeObjectURL(url);
  }

  async function loadVideoMeta(
    file: File,
    kind: "full" | "preview",
    setSlot: React.Dispatch<React.SetStateAction<UploadSlotState>>,
  ) {
    setSlot((s) => ({ ...s, metadataLoading: true, metadata: null }));
    try {
      const metadata = await getVideoMetadata(file);
      setSlot((s) => ({
        ...s,
        metadata,
        metadataLoading: false,
        autoOptimize: videoNeedsOptimization(file, metadata.durationSeconds, kind),
      }));
    } catch {
      setSlot((s) => ({ ...s, metadataLoading: false }));
    }
  }

  function setFullFile(file: File | undefined, wasOptimized = false) {
    revoke(fullPreview?.url);
    if (!file) {
      fullFileRef.current = null;
      setFullPreview(null);
      setFullSlot(defaultUploadSlot());
      return;
    }
    const mediaType = mediaTypeFromFile(file);
    if (!mediaType) {
      setError("Full file must be an image or video.");
      return;
    }
    setError(null);
    fullFileRef.current = file;
    if (isOverUploadLimit(file.size) && !wasOptimized) {
      setError(
        `File is ${formatFileSize(file.size)} — max ${maxUploadLabel()}. Turn on optimize or compress the video.`,
      );
    }
    setFullPreview({
      url: URL.createObjectURL(file),
      label: mediaType === "video" ? "Video" : "Photo",
      size: file.size,
      isVideo: mediaType === "video",
    });
    setFullSlot({
      ...defaultUploadSlot(),
      wasOptimized,
      autoOptimize: mediaType === "video",
    });
    if (mediaType === "video") {
      void loadVideoMeta(file, "full", setFullSlot);
    }
  }

  function setTeaserFile(file: File | undefined, wasOptimized = false) {
    revoke(teaserPreview?.url);
    if (!file) {
      previewTeaserRef.current = null;
      setTeaserPreview(null);
      setTeaserSlot(defaultUploadSlot());
      return;
    }
    const mediaType = mediaTypeFromFile(file);
    if (!mediaType) {
      setError("Preview must be a photo or video.");
      return;
    }
    if (isOverUploadLimit(file.size) && !wasOptimized) {
      setError(
        `Preview is ${formatFileSize(file.size)} — max ${maxUploadLabel()}. Turn on optimize or use a smaller clip.`,
      );
      return;
    }
    setError(null);
    previewTeaserRef.current = file;
    setTeaserPreview({
      url: URL.createObjectURL(file),
      label: mediaType === "video" ? "Video" : "Preview",
      size: file.size,
      isVideo: mediaType === "video",
    });
    setTeaserSlot({
      ...defaultUploadSlot(),
      wasOptimized,
      autoOptimize: mediaType === "video",
    });
    if (mediaType === "video") {
      void loadVideoMeta(file, "preview", setTeaserSlot);
    }
  }

  async function optimizeSlot(slot: "full" | "teaser") {
    const file = slot === "full" ? fullFileRef.current : previewTeaserRef.current;
    if (!file || !isVideoFile(file)) return;

    const kind = slot === "full" ? "full" : "preview";
    const setSlot = slot === "full" ? setFullSlot : setTeaserSlot;
    const applyFile = slot === "full" ? setFullFile : setTeaserFile;

    setSlot((s) => ({
      ...s,
      optimizing: true,
      optimizeProgress: 0,
      optimizeMessage: "Starting…",
    }));
    setError(null);

    try {
      const prepared = await prepareMediaForUpload(file, kind, {
        autoOptimize: true,
        metadata: slot === "full" ? fullSlot.metadata : teaserSlot.metadata,
        wasOptimized: false,
      }, (p) => {
        setSlot((s) => ({
          ...s,
          optimizeProgress: p.percent,
          optimizeMessage: p.message,
        }));
      });
      applyFile(prepared, true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Video optimization failed.";
      logDevIssue("Video optimize failed", msg);
      setError(
        `${msg} Try a shorter clip, or upload without optimize if the file is under ${maxUploadLabel()}.`,
      );
    } finally {
      setSlot((s) => ({ ...s, optimizing: false }));
    }
  }

  async function prepareUploadFile(
    file: File,
    kind: "full" | "preview",
    slot: UploadSlotState,
    setSlot: React.Dispatch<React.SetStateAction<UploadSlotState>>,
  ): Promise<File> {
    return prepareMediaForUpload(
      file,
      kind,
      {
        autoOptimize: slot.autoOptimize,
        metadata: slot.metadata,
        wasOptimized: slot.wasOptimized,
      },
      (p) => {
        setSlot((s) => ({
          ...s,
          optimizing: true,
          optimizeProgress: p.percent,
          optimizeMessage: p.message,
        }));
      },
    );
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

    if (!isVideoFile(fullFile) && isOverUploadLimit(fullFile.size)) {
      setError(
        `File is ${formatFileSize(fullFile.size)} — max ${maxUploadLabel()}. Use a smaller image.`,
      );
      return;
    }

    let priceCents: number | null = null;
    if (!isFree) {
      priceCents = priceToCents(price);
      if (priceCents == null || priceCents <= 0) {
        setError("Enter a price or choose Collect.");
        return;
      }
      if (!previewTeaserRef.current) {
        setError("Paid posts need a preview photo or video for the gallery.");
        return;
      }
    }

    setLoading(true);
    const supabase = createClient();

    try {
      let uploadFull = fullFile;
      let uploadPreview = previewTeaserRef.current;

      uploadFull = await prepareUploadFile(uploadFull, "full", fullSlot, setFullSlot);
      fullFileRef.current = uploadFull;

      if (!isFree && uploadPreview) {
        uploadPreview = await prepareUploadFile(
          uploadPreview,
          "preview",
          teaserSlot,
          setTeaserSlot,
        );
        previewTeaserRef.current = uploadPreview;
      }

      if (isOverUploadLimit(uploadFull.size)) {
        setError(
          `File is still ${formatFileSize(uploadFull.size)} after optimize — max ${maxUploadLabel()}.`,
        );
        return;
      }

      await uploadCreatorContent(
        supabase,
        userId,
        title.trim(),
        uploadFull,
        mediaType,
        priceCents,
        isFree ? null : uploadPreview,
      );
      router.push("/account?published=1#upload");
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed.";
      logDevIssue("Creator content upload failed", msg);
      setError(mapUploadErrorMessage(msg));
    } finally {
      setLoading(false);
      setFullSlot((s) => ({ ...s, optimizing: false }));
      setTeaserSlot((s) => ({ ...s, optimizing: false }));
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
      router.refresh();
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
                  ? "Collect posts show the full file on the gallery."
                  : "Paid posts show only your preview on the gallery — the full file stays locked until purchase."}{" "}
                Max file size {maxUploadLabel()}.
              </p>
              {!isFree && (
                <ul className="mt-3 max-w-lg space-y-1 text-xs leading-relaxed text-gray-500">
                  <li>
                    • After you pick a video, the site shows <strong className="text-gray-400">size &amp; length</strong>{" "}
                    so you don&apos;t have to guess.
                  </li>
                  <li>
                    • Previews: max <strong className="text-gray-400">10 seconds</strong>. Full videos: max{" "}
                    <strong className="text-gray-400">10 minutes</strong> — use{" "}
                    <strong className="text-gray-400">Shorten &amp; compress</strong> to auto-trim.
                  </li>
                  <li>
                    • Large files? One click compresses to 720p (still good quality) and a smaller upload.
                  </li>
                </ul>
              )}
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
                {COLLECT_LABEL}
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
            <div>
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
              {fullPreview?.isVideo && fullFileRef.current && (
                <VideoUploadInfo
                  file={fullFileRef.current}
                  kind="full"
                  metadata={fullSlot.metadata}
                  metadataLoading={fullSlot.metadataLoading}
                  autoOptimize={fullSlot.autoOptimize}
                  onAutoOptimizeChange={(v) =>
                    setFullSlot((s) => ({ ...s, autoOptimize: v }))
                  }
                  optimizing={fullSlot.optimizing}
                  optimizeProgress={fullSlot.optimizeProgress}
                  optimizeMessage={fullSlot.optimizeMessage}
                  wasOptimized={fullSlot.wasOptimized}
                  onShortenNow={() => optimizeSlot("full")}
                />
              )}
              {fullPreview && !fullPreview.isVideo && (
                <p className="mt-2 text-xs text-gray-400">
                  Size: <strong className="text-gray-200">{formatFileSize(fullPreview.size)}</strong>
                </p>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <FileDropZone
                  id="preview-teaser"
                  label="Preview (public)"
                  hint="Photo or video fans see on home & profile — not the locked full file"
                  accept="image/*,video/*"
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
                {teaserPreview?.isVideo && previewTeaserRef.current && (
                  <VideoUploadInfo
                    file={previewTeaserRef.current}
                    kind="preview"
                    metadata={teaserSlot.metadata}
                    metadataLoading={teaserSlot.metadataLoading}
                    autoOptimize={teaserSlot.autoOptimize}
                    onAutoOptimizeChange={(v) =>
                      setTeaserSlot((s) => ({ ...s, autoOptimize: v }))
                    }
                    optimizing={teaserSlot.optimizing}
                    optimizeProgress={teaserSlot.optimizeProgress}
                    optimizeMessage={teaserSlot.optimizeMessage}
                    wasOptimized={teaserSlot.wasOptimized}
                    onShortenNow={() => optimizeSlot("teaser")}
                  />
                )}
                {teaserPreview && !teaserPreview.isVideo && (
                  <p className="mt-2 text-xs text-gray-400">
                    Size:{" "}
                    <strong className="text-gray-200">{formatFileSize(teaserPreview.size)}</strong>
                  </p>
                )}
              </div>
              <div>
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
                {fullPreview?.isVideo && fullFileRef.current && (
                  <VideoUploadInfo
                    file={fullFileRef.current}
                    kind="full"
                    metadata={fullSlot.metadata}
                    metadataLoading={fullSlot.metadataLoading}
                    autoOptimize={fullSlot.autoOptimize}
                    onAutoOptimizeChange={(v) =>
                      setFullSlot((s) => ({ ...s, autoOptimize: v }))
                    }
                    optimizing={fullSlot.optimizing}
                    optimizeProgress={fullSlot.optimizeProgress}
                    optimizeMessage={fullSlot.optimizeMessage}
                    wasOptimized={fullSlot.wasOptimized}
                    onShortenNow={() => optimizeSlot("full")}
                  />
                )}
                {fullPreview && !fullPreview.isVideo && (
                  <p className="mt-2 text-xs text-gray-400">
                    Size:{" "}
                    <strong className="text-gray-200">{formatFileSize(fullPreview.size)}</strong>
                  </p>
                )}
              </div>
            </div>
          )}

          {error && (
            <p className="rounded-lg border border-red-900/50 bg-red-950/40 px-4 py-2.5 text-sm text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={
              loading || fullSlot.optimizing || teaserSlot.optimizing
            }
            className="w-full rounded-full bg-bp-gold py-3.5 text-sm font-semibold text-white shadow-[0_4px_24px_rgba(255,90,154,0.45)] transition-all hover:bg-bp-gold-dim disabled:opacity-60 sm:w-auto sm:px-10"
          >
            {fullSlot.optimizing || teaserSlot.optimizing
              ? "Shortening video…"
              : loading
                ? "Publishing…"
                : "Publish to gallery"}
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
              const thumbIsVideo = getPublicDisplayMediaType(item) === "video";
              return (
                <li
                  key={item.id}
                  className="group flex gap-3 rounded-xl border border-bp-border bg-bp-main/60 p-3"
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-bp-chip ring-1 ring-bp-border">
                    {thumbIsVideo ? (
                      <>
                        <video
                          src={item.display_url}
                          className="h-full w-full object-cover"
                          muted
                          playsInline
                          preload="metadata"
                        />
                        <MediaWatermark compact />
                      </>
                    ) : (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.display_url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                        <MediaWatermark compact />
                      </>
                    )}
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
                          ? `Video · ${COLLECT_LABEL.toLowerCase()}`
                          : `Photo · ${COLLECT_LABEL.toLowerCase()}`}
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
