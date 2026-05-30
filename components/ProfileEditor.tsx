"use client";

import type { Profile } from "@/lib/types/database";
import { creatorStatusLabel } from "@/lib/types/database";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

type ProfileEditorProps = {
  profile: Profile;
  email: string;
};

export function ProfileEditor({ profile, email }: ProfileEditorProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState(profile.display_name ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const supabase = createClient();
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${profile.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      setUploading(false);
      setError(uploadError.message);
      return;
    }

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
    const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
      .eq("id", profile.id);

    setUploading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setAvatarUrl(publicUrl);
    router.refresh();
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        display_name: displayName.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSuccess("Profile saved.");
    router.refresh();
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full bg-bp-chip ring-2 ring-bp-border">
          {avatarUrl ? (
            <Image src={avatarUrl} alt="" fill className="object-cover" sizes="96px" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl text-gray-600">
              ?
            </div>
          )}
        </div>
        <div className="text-center sm:text-left">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleAvatarChange}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="rounded-lg bg-bp-chip px-4 py-2 text-sm text-white hover:bg-bp-chip-hover disabled:opacity-60"
          >
            {uploading ? "Uploading…" : "Change photo"}
          </button>
          <p className="mt-2 text-xs text-gray-500">{email}</p>
          <p className="mt-1 text-xs text-bp-yellow">
            {profile.role === "creator"
              ? `Creator · ${creatorStatusLabel(profile.creator_status ?? "pending")}`
              : profile.role === "admin"
                ? "Admin"
                : "Buyer / Fan"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-xs font-medium text-gray-400">
            Display name
          </label>
          <input
            id="name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full max-w-md rounded-lg border border-bp-border bg-bp-panel px-3 py-2.5 text-sm text-white focus:border-bp-gold focus:outline-none focus:ring-1 focus:ring-bp-gold"
          />
        </div>

        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}
        {success && (
          <p className="text-sm text-emerald-400">{success}</p>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-bp-gold px-6 py-2.5 text-sm font-semibold text-white hover:bg-bp-gold-dim disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save profile"}
          </button>
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-xl border border-bp-border px-6 py-2.5 text-sm text-gray-300 hover:bg-bp-chip"
          >
            Log out
          </button>
        </div>
      </form>
    </div>
  );
}
