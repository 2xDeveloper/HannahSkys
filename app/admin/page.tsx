import { AdminPromoteCreator } from "@/components/AdminPromoteCreator";
import { AdminSalesPanel } from "@/components/AdminSalesPanel";
import { PendingCreatorCard } from "@/components/PendingCreatorCard";
import { AppShell } from "@/components/AppShell";
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

  const { sales, summary, creatorBalances } = await getAdminSales();

  if (error) {
    logDevIssue("Admin panel could not load profiles", error.message);
  }

  return (
    <AppShell>
      <div className="min-h-0 flex-1 overflow-y-auto p-6 md:p-8">
        <div className="mx-auto max-w-5xl space-y-10">
          <div>
            <h1 className="text-2xl font-bold text-rose-50">Admin panel</h1>
            <p className="mt-1 text-sm text-gray-500">Approve creators and manage users</p>
          </div>

          {error && (
            <p className="rounded-lg border border-red-900/50 bg-red-950/40 px-4 py-3 text-sm text-red-300">
              Could not load users. Try refreshing the page.
            </p>
          )}

          {misclassified.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-amber-200">
                Applications needing fix
                <span className="ml-2 rounded-full bg-amber-900/60 px-2 py-0.5 text-xs font-bold text-amber-100">
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
                    className="rounded-xl border border-amber-900/50 bg-amber-950/20 p-5"
                  >
                    <PendingCreatorCard profile={p} hideAdminActions />
                    <div className="mt-2 border-t border-amber-900/40 pt-3">
                      <AdminPromoteCreator profile={p} />
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          <AdminSalesPanel sales={sales} summary={summary} creatorBalances={creatorBalances} />

          <section>
            <h2 className="text-lg font-semibold text-rose-50">
              Pending creators
              <span className="ml-2 rounded-full bg-bp-gold-dim px-2 py-0.5 text-xs font-bold text-white">
                {pendingCreators.length}
              </span>
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Review influencer / creator signups before they can sell on the site.
            </p>

            {pendingCreators.length === 0 ? (
              <p className="mt-4 rounded-xl border border-bp-border bg-bp-panel px-4 py-6 text-sm text-gray-500">
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
            <h2 className="text-lg font-semibold text-rose-50">All users</h2>
            <div className="mt-4 overflow-hidden rounded-xl border border-bp-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-bp-chip text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Instagram</th>
                    <th className="px-4 py-3">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bp-border bg-bp-panel">
                  {all.map((p) => (
                    <tr key={p.id} className="text-gray-300">
                      <td className="px-4 py-3">{p.display_name ?? "—"}</td>
                      <td className="px-4 py-3 capitalize text-bp-yellow">{p.role}</td>
                      <td className="px-4 py-3 text-gray-400">
                        {p.role === "creator"
                          ? creatorStatusLabel(p.creator_status)
                          : p.role === "admin"
                            ? "Admin"
                            : "Active"}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {p.instagram_handle ? `@${p.instagram_handle.replace(/^@/, "")}` : "—"}
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

          <Link href="/" className="inline-block text-sm text-bp-yellow hover:text-white">
            ← Back to gallery
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
