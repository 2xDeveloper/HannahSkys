-- Purchase fulfillment fixes — run in Supabase SQL Editor (safe to re-run)

alter table public.purchases
  add column if not exists creator_payout_cents integer;

update public.purchases
set creator_payout_cents = amount_cents - platform_fee_cents
where creator_payout_cents is null;

alter table public.purchases
  alter column creator_payout_cents set default 0;

-- Ensure buyers can insert their own purchase row (redirect fulfillment fallback)
drop policy if exists "Buyers insert own purchases" on public.purchases;
create policy "Buyers insert own purchases"
  on public.purchases for insert
  with check (buyer_id = auth.uid());

-- Allow admin inserts if needed for manual fixes
drop policy if exists "Admins insert purchases" on public.purchases;
create policy "Admins insert purchases"
  on public.purchases for insert
  with check (public.is_admin());
