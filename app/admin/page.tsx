import { AppShell } from "@/components/AppShell";
import { AdminPromoteCreator } from "@/components/AdminPromoteCreator";
import { AdminSalesPanel } from "@/components/AdminSalesPanel";
import { PendingCreatorCard } from "@/components/PendingCreatorCard";
import {
  creatorApplicationComplete,
  formatWunUsername,
  wunAppProfileUrl,
} from "@/lib/creator-application";
import { logDevIssue } from "@/lib/dev-log";
import { getAdminSales } from "@/lib/sales";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types/database";
import { creatorStatusLabel } from "@/lib/types/database";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin");
  }

  const { data: me } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (me?.role !== "admin") {
    redirect("/account");
  }

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  const all = (profiles as Profile[] | null) ?? [];
  const pendingCreators = all.filter(
    (p) => p.role === "creator" && p.creator_status === "pending",
  );
  // Catch signups saved as "user" but with creator application data
  const misclassified = all.filter(
    (p) =>
      p.role === "user" &&
      (p.instagram_handle || p.id_document_path || p.avatar_url),
  );
  const rejectedCreators = all.filter(
    (p) => p.creator_status === "rejected" && creatorApplicationComplete(p),
  );

  const { sales, summary, creatorBalances } = await getAdminSales();

  if (error) {
    logDevIssue("Admin panel could not load profiles", error.message);
  }

  return (
    <AppShell>
      <div className="min-h-0 flex-1 overflow-y-auto p-6 md:p-8">
        <div className="mx-auto max-w-5xl space-y-10">
          <div>
            <h1 className="app-heading text-2xl font-bold">Admin panel</h1>
            <p className="mt-1 text-sm text-gray-500">Approve creators and manage users</p>
          </div>

          {error && (
            <p className="app-alert-err rounded-lg px-4 py-3 text-sm">
              Could not load users. Try refreshing the page.
            </p>
          )}

          {rejectedCreators.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-red-700">
                Rejected — can re-review
                <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
                  {rejectedCreators.length}
                </span>
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Previously rejected but still have application files on file. Move back to pending
                to approve.
              </p>
              <div className="mt-4 space-y-4">
                {rejectedCreators.map((p) => (
                  <article
                    key={p.id}
                    className="rounded-xl border border-red-200 bg-red-50 p-5"
                  >
                    <PendingCreatorCard profile={p} hideAdminActions />
                    <div className="mt-2 border-t border-red-200 pt-3">
                      <AdminPromoteCreator profile={p} />
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {misclassified.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-amber-800">
                Applications needing fix
                <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">
                  {misclassified.length}
                </span>
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Signed up as creators but saved as regular users. Click &quot;Move to pending
                creators&quot; to review them.
              </p>
              <div className="mt-4 space-y-4">
                {misclassified.map((p) => (
                  <article
                    key={p.id}
                    className="rounded-xl border border-amber-200 bg-amber-50 p-5"
                  >
                    <PendingCreatorCard profile={p} hideAdminActions />
                    <div className="mt-2 border-t border-amber-200 pt-3">
                      <AdminPromoteCreator profile={p} />
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          <AdminSalesPanel sales={sales} summary={summary} creatorBalances={creatorBalances} />

          <section>
            <h2 className="app-heading text-lg font-semibold">
              Pending creators
              <span className="ml-2 rounded-full bg-[#f4699f] px-2 py-0.5 text-xs font-bold text-white">
                {pendingCreators.length}
              </span>
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Review influencer / creator signups before they can sell on the site.
            </p>

            {pendingCreators.length === 0 ? (
              <p className="app-card app-muted mt-4 rounded-xl px-4 py-6 text-sm">
                No pending creator applications.
              </p>
            ) : (
              <div className="mt-4 space-y-4">
                {pendingCreators.map((p) => (
                  <PendingCreatorCard key={p.id} profile={p} />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="app-heading text-lg font-semibold">All users</h2>
            <div className="app-card mt-4 overflow-hidden rounded-xl">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#fff0f5] text-xs uppercase text-[#8a8390]">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Wun.app</th>
                    <th className="px-4 py-3">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#fdeaf1] bg-white">
                  {all.map((p) => (
                    <tr key={p.id} className="text-[#55505c]">
                      <td className="px-4 py-3">{p.display_name ?? "—"}</td>
                      <td className="px-4 py-3 capitalize text-[#f4699f]">{p.role}</td>
                      <td className="px-4 py-3 text-gray-400">
                        {p.role === "creator"
                          ? creatorStatusLabel(p.creator_status)
                          : p.role === "admin"
                            ? "Admin"
                            : "Active"}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {(() => {
                          const username = formatWunUsername(p.instagram_handle);
                          const profileUrl = wunAppProfileUrl(p.instagram_handle);
                          if (!username || !profileUrl) return "—";
                          return (
                            <a
                              href={profileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="app-link"
                            >
                              wun.app/{username}
                            </a>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(p.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <Link href="/gallery" className="app-link inline-block text-sm">
            ← Back to the collection
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
