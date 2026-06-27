import type { SaleRow, SalesSummary } from "@/lib/sales";
import { formatUsd } from "@/lib/format-money";
import { getCreatorSharePercent } from "@/lib/stripe";

type CreatorEarningsProps = {
  sales: SaleRow[];
  summary: SalesSummary;
};

export function CreatorEarnings({ sales, summary }: CreatorEarningsProps) {
  const creatorShare = getCreatorSharePercent();

  return (
    <section className="mt-6 rounded-2xl border border-bp-border bg-bp-panel p-5 md:p-6">
      <h2 className="text-lg font-semibold text-rose-50">Your earnings</h2>
      <p className="mt-1 text-sm text-gray-500">
        Completed purchases of your content. Payouts are sent manually by the platform.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Total sales" value={formatUsd(summary.totalSalesCents)} />
        <Stat label={`Your share (${creatorShare}%)`} value={formatUsd(summary.creatorPayoutsCents)} highlight />
        <Stat label="Platform fee" value={formatUsd(summary.platformFeesCents)} />
      </div>
      <p className="mt-2 text-xs text-gray-600">{summary.saleCount} sale(s)</p>

      {sales.length === 0 ? (
        <p className="mt-4 text-sm text-gray-500">No sales yet.</p>
      ) : (
        <ul className="mt-4 max-h-64 space-y-2 overflow-y-auto">
          {sales.map((sale) => (
            <li
              key={sale.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-bp-border bg-bp-main/50 px-3 py-2 text-xs"
            >
              <div>
                <p className="font-medium text-white">{sale.content_title}</p>
                <p className="text-gray-500">
                  Buyer: {sale.buyer_name ?? "Fan"} · {new Date(sale.created_at).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-emerald-400">
                  +{formatUsd(sale.creator_payout_cents)}
                </p>
                <p className="text-gray-600">of {formatUsd(sale.amount_cents)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-bp-border bg-bp-main/50 px-3 py-3">
      <p className="text-[10px] uppercase tracking-wider text-gray-500">{label}</p>
      <p className={`mt-1 text-lg font-bold ${highlight ? "text-emerald-400" : "text-white"}`}>
        {value}
      </p>
    </div>
  );
}
