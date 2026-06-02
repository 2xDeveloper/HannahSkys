import { createClient } from "@/lib/supabase/server";

export type SaleRow = {
  id: string;
  created_at: string;
  creator_id: string;
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

export type CreatorBalance = {
  creator_id: string;
  creator_name: string | null;
  instagram_handle: string | null;
  sale_count: number;
  total_sales_cents: number;
  owed_cents: number;
  platform_fees_cents: number;
};

type PurchaseJoinRow = {
  id: string;
  created_at: string;
  creator_id: string;
  amount_cents: number;
  platform_fee_cents: number;
  creator_payout_cents: number | null;
  status: string;
  creator_content: { title: string } | { title: string }[] | null;
  buyer: { display_name: string | null } | { display_name: string | null }[] | null;
  creator:
    | { display_name: string | null; instagram_handle: string | null }
    | { display_name: string | null; instagram_handle: string | null }[]
    | null;
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
    creator_id: row.creator_id,
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
  creator_id,
  amount_cents,
  platform_fee_cents,
  creator_payout_cents,
  status,
  creator_content (title),
  buyer:profiles!purchases_buyer_id_fkey (display_name),
  creator:profiles!purchases_creator_id_fkey (display_name, instagram_handle)
`;

export function summarizeCreatorBalances(sales: SaleRow[]): CreatorBalance[] {
  const byCreator = new Map<string, CreatorBalance>();

  for (const sale of sales) {
    const existing = byCreator.get(sale.creator_id);
    if (existing) {
      existing.sale_count += 1;
      existing.total_sales_cents += sale.amount_cents;
      existing.owed_cents += sale.creator_payout_cents;
      existing.platform_fees_cents += sale.platform_fee_cents;
      continue;
    }

    byCreator.set(sale.creator_id, {
      creator_id: sale.creator_id,
      creator_name: sale.creator_name,
      instagram_handle: null,
      sale_count: 1,
      total_sales_cents: sale.amount_cents,
      owed_cents: sale.creator_payout_cents,
      platform_fees_cents: sale.platform_fee_cents,
    });
  }

  return [...byCreator.values()].sort((a, b) => b.owed_cents - a.owed_cents);
}

function attachCreatorInstagram(
  balances: CreatorBalance[],
  sales: PurchaseJoinRow[],
): CreatorBalance[] {
  const instagramByCreator = new Map<string, string | null>();

  for (const row of sales) {
    if (instagramByCreator.has(row.creator_id)) continue;
    const creator = one(row.creator);
    instagramByCreator.set(row.creator_id, creator?.instagram_handle ?? null);
  }

  return balances.map((balance) => ({
    ...balance,
    instagram_handle: instagramByCreator.get(balance.creator_id) ?? null,
  }));
}

/** All platform sales — admin only (RLS) */
export async function getAdminSales(): Promise<{
  sales: SaleRow[];
  summary: SalesSummary;
  creatorBalances: CreatorBalance[];
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("purchases")
    .select(saleSelect)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error || !data) {
    console.error("getAdminSales:", error?.message);
    return { sales: [], summary: summarize([]), creatorBalances: [] };
  }

  const rows = data as PurchaseJoinRow[];
  const sales = rows.map(mapSale);
  const creatorBalances = attachCreatorInstagram(summarizeCreatorBalances(sales), rows);
  return { sales, summary: summarize(sales), creatorBalances };
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
