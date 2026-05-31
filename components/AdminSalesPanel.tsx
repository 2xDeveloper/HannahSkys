import type { SaleRow, SalesSummary } from "@/lib/sales";
import { formatUsd } from "@/lib/format-money";

type AdminSalesPanelProps = {
  sales: SaleRow[];
  summary: SalesSummary;
};

export function AdminSalesPanel({ sales, summary }: AdminSalesPanelProps) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-rose-50">
        Sales &amp; payments
        <span className="ml-2 rounded-full bg-bp-gold-dim px-2 py-0.5 text-xs font-bold text-white">
          {summary.saleCount}
        </span>
      </h2>
      <p className="mt-1 text-sm text-gray-500">
        All fan purchases. Platform fee (10%) stays with you; creator share is sent via Stripe
        Connect when the creator has connected Stripe.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <SummaryCard label="Gross volume" value={formatUsd(summary.totalSalesCents)} />
        <SummaryCard label="Platform fees (you)" value={formatUsd(summary.platformFeesCents)} highlight />
        <SummaryCard label="Creator payouts" value={formatUsd(summary.creatorPayoutsCents)} />
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
                <th className="px-4 py-3 text-right">Platform</th>
                <th className="px-4 py-3 text-right">Creator</th>
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
