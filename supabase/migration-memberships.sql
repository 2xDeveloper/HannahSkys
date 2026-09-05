-- Memberships (Stripe subscription checkout) — run in Supabase SQL Editor (safe to re-run)

create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  plan_id text not null check (plan_id in ('monthly', 'quarterly', 'yearly')),
  amount_cents integer not null check (amount_cents > 0),
  status text not null default 'active' check (status in ('active', 'canceled', 'expired')),
  stripe_checkout_session_id text not null,
  stripe_subscription_id text,
  stripe_customer_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  unique (stripe_checkout_session_id)
);

create index if not exists memberships_user_id_idx on public.memberships (user_id);
create index if not exists memberships_status_idx on public.memberships (status);

alter table public.memberships enable row level security;

drop policy if exists "Members read own membership" on public.memberships;
create policy "Members read own membership"
  on public.memberships for select
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "Members insert own membership" on public.memberships;
create policy "Members insert own membership"
  on public.memberships for insert
  with check (user_id = auth.uid());

-- Webhook and success-redirect inserts use the service role (bypasses RLS)
