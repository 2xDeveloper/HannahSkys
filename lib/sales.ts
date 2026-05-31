import { createClient } from "@/lib/supabase/server";

export type SaleRow = {
  id: string;
  created_at: string;
  amount_cents: number;
  platform_fee_cents: number;
  creator_payout_cents: number;
  status: string;
  content_title: string;
  buyer_name: string | null;
  creator_name: string | null;
};

export type SalesSummary = {
  totalSalesCents: number;
  platformFeesCents: number;
  creatorPayoutsCents: number;
  saleCount: number;
};

type PurchaseJoinRow = {
  id: string;
  created_at: string;
  amount_cents: number;
  platform_fee_cents: number;
  creator_payout_cents: number | null;
  status: string;
  creator_content: { title: string } | { title: string }[] | null;
  buyer: { display_name: string | null } | { display_name: string | null }[] | null;
  creator: { display_name: string | null } | { display_name: string | null }[] | null;
};

function one<T>(value: T | T[] | null): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function mapSale(row: PurchaseJoinRow): SaleRow {
  const content = one(row.creator_content);
  const buyer = one(row.buyer);
  const creator = one(row.creator);
  const payout =
    row.creator_payout_cents ?? Math.max(0, row.amount_cents - row.platform_fee_cents);

  return {
    id: row.id,
    created_at: row.created_at,
    amount_cents: row.amount_cents,
    platform_fee_cents: row.platform_fee_cents,
    creator_payout_cents: payout,
    status: row.status,
    content_title: content?.title ?? "Unknown",
    buyer_name: buyer?.display_name ?? null,
    creator_name: creator?.display_name ?? null,
  };
}

function summarize(rows: SaleRow[]): SalesSummary {
  return rows.reduce(
    (acc, row) => ({
      totalSalesCents: acc.totalSalesCents + row.amount_cents,
      platformFeesCents: acc.platformFeesCents + row.platform_fee_cents,
      creatorPayoutsCents: acc.creatorPayoutsCents + row.creator_payout_cents,
      saleCount: acc.saleCount + 1,
    }),
    { totalSalesCents: 0, platformFeesCents: 0, creatorPayoutsCents: 0, saleCount: 0 },
  );
}

const saleSelect = `
  id,
  created_at,
  amount_cents,
  platform_fee_cents,
  creator_payout_cents,
  status,
  creator_content (title),
  buyer:profiles!purchases_buyer_id_fkey (display_name),
  creator:profiles!purchases_creator_id_fkey (display_name)
`;

/** All platform sales — admin only (RLS) */
export async function getAdminSales(): Promise<{ sales: SaleRow[]; summary: SalesSummary }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("purchases")
    .select(saleSelect)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error || !data) {
    console.error("getAdminSales:", error?.message);
    return { sales: [], summary: summarize([]) };
  }

  const sales = (data as PurchaseJoinRow[]).map(mapSale);
  return { sales, summary: summarize(sales) };
}

/** Creator's own sales — creator RLS */
export async function getCreatorSales(
  creatorId: string,
): Promise<{ sales: SaleRow[]; summary: SalesSummary }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("purchases")
    .select(saleSelect)
    .eq("creator_id", creatorId)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error || !data) {
    console.error("getCreatorSales:", error?.message);
    return { sales: [], summary: summarize([]) };
  }

  const sales = (data as PurchaseJoinRow[]).map(mapSale);
  return { sales, summary: summarize(sales) };
}

export { formatUsd } from "@/lib/format-money";
