-- Purchases (Stripe checkout) — run in Supabase SQL Editor (safe to re-run)

create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles (id) on delete cascade,
  content_id uuid not null references public.creator_content (id) on delete cascade,
  creator_id uuid not null references public.profiles (id) on delete cascade,
  amount_cents integer not null check (amount_cents > 0),
  platform_fee_cents integer not null default 0 check (platform_fee_cents >= 0),
  stripe_checkout_session_id text not null,
  status text not null default 'completed' check (status in ('completed', 'refunded')),
  created_at timestamptz not null default now(),
  unique (stripe_checkout_session_id),
  unique (buyer_id, content_id)
);

create index if not exists purchases_buyer_id_idx on public.purchases (buyer_id);
create index if not exists purchases_content_id_idx on public.purchases (content_id);
create index if not exists purchases_creator_id_idx on public.purchases (creator_id);

alter table public.purchases enable row level security;

drop policy if exists "Buyers read own purchases" on public.purchases;
create policy "Buyers read own purchases"
  on public.purchases for select
  using (buyer_id = auth.uid() or public.is_admin());

drop policy if exists "Creators read sales of their content" on public.purchases;
create policy "Creators read sales of their content"
  on public.purchases for select
  using (creator_id = auth.uid() or public.is_admin());

drop policy if exists "Buyers insert own purchases" on public.purchases;
create policy "Buyers insert own purchases"
  on public.purchases for insert
  with check (buyer_id = auth.uid());

-- Webhook inserts use service role (bypasses RLS)
