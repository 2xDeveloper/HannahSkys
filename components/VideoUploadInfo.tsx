"use client";

import { formatFileSize, isOverUploadLimit, maxUploadLabel } from "@/lib/upload-limits";
import {
  formatDuration,
  maxDurationForKind,
  optimizationSummary,
  type OptimizeKind,
  type VideoMetadata,
  videoNeedsOptimization,
} from "@/lib/video-optimize";

type VideoUploadInfoProps = {
  file: File;
  kind: OptimizeKind;
  metadata: VideoMetadata | null;
  metadataLoading: boolean;
  autoOptimize: boolean;
  onAutoOptimizeChange: (value: boolean) => void;
  optimizing: boolean;
  optimizeProgress: number;
  optimizeMessage: string;
  wasOptimized: boolean;
  onShortenNow: () => void;
};

export function VideoUploadInfo({
  file,
  kind,
  metadata,
  metadataLoading,
  autoOptimize,
  onAutoOptimizeChange,
  optimizing,
  optimizeProgress,
  optimizeMessage,
  wasOptimized,
  onShortenNow,
}: VideoUploadInfoProps) {
  const maxDur = maxDurationForKind(kind);
  const needsShorten = videoNeedsOptimization(file, metadata?.durationSeconds, kind);
  const overDuration =
    metadata != null && metadata.durationSeconds > maxDur;
  const overSize = isOverUploadLimit(file.size);

  return (
    <div
      className={`mt-2 space-y-2 rounded-lg border px-3 py-2.5 text-xs ${
        needsShorten && !wasOptimized
          ? "border-amber-900/50 bg-amber-950/25"
          : "border-bp-border bg-bp-main/70"
      }`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
        Your file
      </p>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-gray-400">
        <span>
          Size:{" "}
          <strong className={overSize ? "text-red-300" : "text-white"}>
            {formatFileSize(file.size)}
          </strong>
        </span>
        {metadataLoading ? (
          <span className="text-gray-500">Reading video length…</span>
        ) : metadata ? (
          <>
            <span>
              Length:{" "}
              <strong className={overDuration ? "text-amber-300" : "text-white"}>
                {formatDuration(metadata.durationSeconds)}
              </strong>
            </span>
            <span>
              Resolution:{" "}
              <strong className="text-white">
                {metadata.width}×{metadata.height}
              </strong>
            </span>
          </>
        ) : (
          <span className="text-gray-500">Length will appear in a moment…</span>
        )}
        {wasOptimized && (
          <span className="rounded-full bg-emerald-900/50 px-2 py-0.5 font-medium text-emerald-300">
            Shortened
          </span>
        )}
      </div>

      {overDuration && !wasOptimized && (
        <p className="text-amber-200">
          This video is longer than {formatDuration(maxDur)} for{" "}
          {kind === "preview" ? "previews" : "full uploads"}. Use{" "}
          <strong>Shorten &amp; compress</strong> to auto-trim, or pick a shorter clip.
        </p>
      )}

      {overSize && !wasOptimized && (
        <p className="text-red-300">
          Over the {maxUploadLabel()} site limit — shorten before publishing.
        </p>
      )}

      {!wasOptimized && (
        <div className="space-y-2 border-t border-bp-border/80 pt-2">
          <label className="flex cursor-pointer items-start gap-2">
            <input
              type="checkbox"
              checked={autoOptimize}
              onChange={(e) => onAutoOptimizeChange(e.target.checked)}
              disabled={optimizing}
              className="mt-0.5 rounded border-bp-border"
            />
            <span className="text-gray-300">
              <strong className="text-white">Shorten &amp; compress before upload</strong>
              {needsShorten ? (
                <>
                  {" "}
                  — {optimizationSummary(file, metadata, kind)}. Easier than editing on your
                  phone.
                </>
              ) : (
                <> — optional; makes upload faster on slow connections.</>
              )}
            </span>
          </label>
          <button
            type="button"
            disabled={optimizing}
            onClick={onShortenNow}
            className="rounded-lg bg-bp-gold px-4 py-2 text-xs font-semibold text-white hover:bg-bp-gold-dim disabled:opacity-50"
          >
            {optimizing
              ? optimizeMessage || "Shortening…"
              : needsShorten
                ? "Shorten & compress now"
                : "Compress now (optional)"}
          </button>
          {optimizing && (
            <div className="space-y-1">
              <div className="h-1.5 overflow-hidden rounded-full bg-bp-chip">
                <div
                  className="h-full rounded-full bg-bp-gold transition-all duration-300"
                  style={{ width: `${optimizeProgress}%` }}
                />
              </div>
              <p className="text-[11px] text-gray-500">
                {optimizeMessage ||
                  "Long videos can take several minutes. Keep this tab open."}
              </p>
            </div>
          )}
        </div>
      )}

      {!needsShorten && !metadataLoading && wasOptimized && (
        <p className="text-emerald-400/90">Ready to upload.</p>
      )}

      {!needsShorten && !metadataLoading && !wasOptimized && !overDuration && (
        <p className="text-emerald-400/90">Size and length look good — publish when ready.</p>
      )}
    </div>
  );
}
