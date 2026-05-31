-- Stripe Connect (creator payouts) + sales tracking
-- Run in Supabase SQL Editor (safe to re-run)

alter table public.profiles
  add column if not exists stripe_connect_account_id text;

alter table public.profiles
  add column if not exists stripe_connect_charges_enabled boolean not null default false;

alter table public.profiles
  add column if not exists stripe_connect_payouts_enabled boolean not null default false;

comment on column public.profiles.stripe_connect_account_id is
  'Stripe Connect Express account — creator receives payouts here';

alter table public.purchases
  add column if not exists creator_payout_cents integer;

update public.purchases
set creator_payout_cents = amount_cents - platform_fee_cents
where creator_payout_cents is null;

alter table public.purchases
  alter column creator_payout_cents set default 0;

-- Admins see all sales in admin panel
drop policy if exists "Admins read all purchases" on public.purchases;
create policy "Admins read all purchases"
  on public.purchases for select
  using (public.is_admin());
