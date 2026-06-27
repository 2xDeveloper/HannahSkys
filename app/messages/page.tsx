import { MessagesApp } from "@/components/messages/MessagesApp";
import { MessagesShell } from "@/components/MessagesShell";
import {
  getAllMessagesForUser,
  getPartnerProfiles,
} from "@/lib/messages";
import { partnerKeyForMessage } from "@/lib/message-threads";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types/database";
import { isApprovedCreator } from "@/lib/types/database";
import { redirect } from "next/navigation";

type PageProps = {
  searchParams: Promise<{ with?: string }>;
};

export default async function MessagesPage({ searchParams }: PageProps) {
  const { with: threadPartner } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/messages");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/account");
  }

  const messages = await getAllMessagesForUser(user.id);

  const partnerIds = [
    ...new Set(
      messages
        .map((m) => partnerKeyForMessage(m, user.id))
        .filter((id) => !id.startsWith("guest:")),
    ),
  ];

  if (threadPartner && !partnerIds.includes(threadPartner)) {
    partnerIds.push(threadPartner);
  }

  const partnerProfiles = await getPartnerProfiles(partnerIds);

  const isCreator = isApprovedCreator(profile as Profile);
  const headerAuth = { userId: user.id, profile: profile as Profile };

  return (
    <MessagesShell headerAuth={headerAuth}>
      <MessagesApp
        userId={user.id}
        userName={profile.display_name ?? user.email?.split("@")[0] ?? "You"}
        userEmail={user.email ?? ""}
        isCreator={isCreator}
        initialMessages={messages}
        partnerProfiles={partnerProfiles}
        initialThreadId={threadPartner ?? null}
      />
    </MessagesShell>
  );
}
