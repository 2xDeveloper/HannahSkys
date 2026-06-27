import type { CreatorBalance, SaleRow, SalesSummary } from "@/lib/sales";
import { formatUsd } from "@/lib/format-money";
import { formatWunUsername, wunAppProfileUrl } from "@/lib/creator-application";
import { getCreatorSharePercent, getPlatformFeePercent } from "@/lib/stripe";
import Link from "next/link";

type AdminSalesPanelProps = {
  sales: SaleRow[];
  summary: SalesSummary;
  creatorBalances: CreatorBalance[];
};

export function AdminSalesPanel({ sales, summary, creatorBalances }: AdminSalesPanelProps) {
  const creatorsWithBalance = creatorBalances.filter((c) => c.owed_cents > 0);
  const platformFee = getPlatformFeePercent();
  const creatorShare = getCreatorSharePercent();

  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-rose-50">
          Manual creator payouts
          <span className="ml-2 rounded-full bg-emerald-800 px-2 py-0.5 text-xs font-bold text-white">
            {creatorsWithBalance.length}
          </span>
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          All payments go to your main Stripe account. Send each creator their share ({creatorShare}% of sales)
          yourself — Venmo, bank transfer, etc.
        </p>

        {creatorsWithBalance.length === 0 ? (
          <p className="mt-4 rounded-xl border border-bp-border bg-bp-panel px-4 py-6 text-sm text-gray-500">
            No creator earnings yet.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-emerald-900/40">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="bg-emerald-950/40 text-xs uppercase text-emerald-200/80">
                <tr>
                  <th className="px-4 py-3">Creator</th>
                  <th className="px-4 py-3">Wun.app</th>
                  <th className="px-4 py-3 text-right">Sales</th>
                  <th className="px-4 py-3 text-right">You keep ({platformFee}%)</th>
                  <th className="px-4 py-3 text-right">Send creator ({creatorShare}%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bp-border bg-bp-panel">
                {creatorsWithBalance.map((creator) => (
                  <tr key={creator.creator_id} className="text-gray-300">
                    <td className="px-4 py-3">
                      <Link
                        href={`/creator/${creator.creator_id}`}
                        className="font-medium text-bp-yellow hover:text-white"
                      >
                        {creator.creator_name ?? "Creator"}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {(() => {
                        const username = formatWunUsername(creator.instagram_handle);
                        const profileUrl = wunAppProfileUrl(creator.instagram_handle);
                        if (!username || !profileUrl) return "—";
                        return (
                          <a
                            href={profileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-bp-yellow hover:text-white"
                          >
                            wun.app/{username}
                          </a>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-400">
                      {creator.sale_count} · {formatUsd(creator.total_sales_cents)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-400">
                      {formatUsd(creator.platform_fees_cents)}
                    </td>
                    <td className="px-4 py-3 text-right text-lg font-bold text-emerald-400">
                      {formatUsd(creator.owed_cents)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-emerald-900/40 bg-emerald-950/20">
                <tr>
                  <td colSpan={4} className="px-4 py-3 text-right text-sm font-medium text-gray-400">
                    Total owed to all creators
                  </td>
                  <td className="px-4 py-3 text-right text-xl font-bold text-emerald-400">
                    {formatUsd(summary.creatorPayoutsCents)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-rose-50">
          All sales
          <span className="ml-2 rounded-full bg-bp-gold-dim px-2 py-0.5 text-xs font-bold text-white">
            {summary.saleCount}
          </span>
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Every fan purchase — money lands in your Stripe account.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <SummaryCard label="Gross volume" value={formatUsd(summary.totalSalesCents)} />
          <SummaryCard label={`Your cut (${platformFee}%)`} value={formatUsd(summary.platformFeesCents)} highlight />
          <SummaryCard label="Owed to creators" value={formatUsd(summary.creatorPayoutsCents)} />
        </div>

        {sales.length === 0 ? (
          <p className="mt-4 rounded-xl border border-bp-border bg-bp-panel px-4 py-6 text-sm text-gray-500">
            No completed purchases yet.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-bp-border">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-bp-chip text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Content</th>
                  <th className="px-4 py-3">Fan</th>
                  <th className="px-4 py-3">Creator</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-right">You keep</th>
                  <th className="px-4 py-3 text-right">Creator share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bp-border bg-bp-panel">
                {sales.map((sale) => (
                  <tr key={sale.id} className="text-gray-300">
                    <td className="whitespace-nowrap px-4 py-3 text-gray-500">
                      {new Date(sale.created_at).toLocaleString()}
                    </td>
                    <td className="max-w-[140px] truncate px-4 py-3">{sale.content_title}</td>
                    <td className="px-4 py-3">{sale.buyer_name ?? "—"}</td>
                    <td className="px-4 py-3 text-bp-yellow">{sale.creator_name ?? "—"}</td>
                    <td className="px-4 py-3 text-right font-medium text-white">
                      {formatUsd(sale.amount_cents)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-400">
                      {formatUsd(sale.platform_fee_cents)}
                    </td>
                    <td className="px-4 py-3 text-right text-emerald-400">
                      {formatUsd(sale.creator_payout_cents)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

function SummaryCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-bp-border bg-bp-panel px-4 py-4">
      <p className="text-xs uppercase tracking-wider text-gray-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${highlight ? "text-bp-yellow" : "text-white"}`}>
        {value}
      </p>
    </div>
  );
}
