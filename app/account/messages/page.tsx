import { AppShell } from "@/components/AppShell";
import { MessageInbox } from "@/components/MessageInbox";
import { getInboxMessages, getSentMessages, getUnreadCount } from "@/lib/messages";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types/database";
import { isApprovedCreator } from "@/lib/types/database";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function MessagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/account/messages");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/account");
  }

  const isCreator = isApprovedCreator(profile as Profile);
  const inbox = await getInboxMessages(user.id);
  const sent = isCreator ? [] : await getSentMessages(user.id);
  const unread = await getUnreadCount(user.id);

  return (
    <AppShell>
      <div className="min-h-0 flex-1 overflow-y-auto p-6 md:p-8">
        <div className="mx-auto max-w-2xl">
          <Link
            href="/account"
            className="text-sm text-bp-yellow hover:text-white"
          >
            ← Account
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-rose-50">Messages</h1>
          <p className="mt-1 text-sm text-gray-500">
            {isCreator
              ? "Fan messages sent to your creator profile"
              : "Replies from creators and messages you sent"}
            {unread > 0 && (
              <span className="ml-2 rounded-full bg-bp-gold px-2 py-0.5 text-xs font-bold text-white">
                {unread} new
              </span>
            )}
          </p>
          {isCreator && (
            <p className="mt-2 text-xs text-gray-600">
              Your public profile:{" "}
              <Link href={`/creator/${user.id}`} className="text-bp-yellow hover:text-white">
                /creator/{user.id.slice(0, 8)}…
              </Link>
            </p>
          )}
          <div className="mt-8">
            <MessageInbox
              messages={inbox}
              mode={isCreator ? "creator" : "fan"}
              sentMessages={sent}
              creator={
                isCreator
                  ? {
                      id: user.id,
                      displayName: profile.display_name ?? "Creator",
                      email: user.email ?? "",
                    }
                  : undefined
              }
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
