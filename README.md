# HannahSkys

Exclusive photo and video store with Stripe checkout, VIP memberships, and creator messaging.
All media, models, prices, and counts shown on the site come from Supabase — there is no
placeholder content.

## Run locally (auto-updates when you save files)

**One command — leave this running while you work:**

```bash
npm run dev
```

- Open **http://localhost:3000** (or the Network IP shown in the terminal for your phone)
- **Save a file** → the site updates automatically (no restart needed)
- Only restart if you change **`.env.local`**

**If you see port errors or a broken white/500 page:**

```bash
npm run dev:reset
```

That clears the cache, frees port 3000, and starts fresh.

**Do not** run multiple `npm run dev` terminals at once — that causes port conflicts.

## Environment variables

Create `.env.local` in the project root:

```bash
# Supabase → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe → Developers → API keys
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Public origin used for Stripe redirect URLs
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

`SUPABASE_SERVICE_ROLE_KEY` is required — without it, completed purchases and memberships
cannot be written to the database. Never expose it to the browser.

If `NEXT_PUBLIC_SUPABASE_URL` points at a deleted or paused project, every page still loads
but content sections render empty and the terminal logs `fetch failed`.

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com), then fill in the env vars above.
2. In **SQL Editor**, run `supabase/schema.sql` first (creates profiles and auth triggers).
3. Then run the remaining scripts in `supabase/`. They are idempotent, so re-running is safe:
   - `migration-creator-approval.sql`, `migration-fix-creator-signup.sql`,
     `migration-creator-application.sql`, `migration-creator-reapply.sql`,
     `migration-finalize-creator.sql`
   - `migration-creator-content.sql`, `migration-content-preview.sql`,
     `migration-bucket-video-limit.sql`
   - `migration-purchases.sql`, `migration-purchases-fulfill.sql`,
     `migration-stripe-connect.sql`
   - `migration-messages-policy.sql`, `migration-message-replies.sql`,
     `migration-messages-realtime.sql`
   - `migration-memberships.sql` (VIP subscription records)
4. **Authentication → URL configuration**: Site URL `http://localhost:3000`,
   redirect `http://localhost:3000/**`
5. **Authentication → Providers → Email**: turn **OFF** "Confirm email" for easy local testing.
6. If signup says an email is "invalid" for Gmail etc., set up
   **Authentication → SMTP** ([docs](https://supabase.com/docs/guides/auth/auth-smtp)).
7. Sign up at `/signup`, then make yourself admin in SQL Editor:
   ```sql
   update public.profiles set role = 'admin' where id = 'YOUR-USER-UUID';
   ```
   (UUID from **Authentication → Users**)

Nothing appears on the homepage or in the gallery until a creator is **approved** in `/admin`
and has uploaded content — the site only ever shows real approved models and real uploads.

## Stripe setup

Two checkout flows share the same Stripe account and secret key:

| Flow | Route | Mode |
|------|-------|------|
| Single photo or video | `/api/checkout` → `/auth/checkout-return` | one-time payment |
| VIP membership | `/api/checkout/membership` → `/auth/membership-return` | subscription |

Prices are always resolved on the server (item price from the database, plan price from
`lib/memberships.ts`), so they cannot be tampered with from the browser.

For local webhook testing:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the printed `whsec_...` value into `STRIPE_WEBHOOK_SECRET`.

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Landing page: real featured photos, videos, models, membership plans |
| `/gallery` | Browse everything for sale |
| `/gallery/[id]` | Item detail + Stripe purchase |
| `/creator/[id]` | Public model profile |
| `/library` | Media the logged-in user has purchased |
| `/messages` | Creator/fan messaging |
| `/signup`, `/login` | Auth |
| `/account` | Profile, uploads, creator status, earnings |
| `/admin` | Approve creators, view sales |

## Stack

- Next.js 15 + React 19 + Supabase (Auth, Postgres, Storage)
- Stripe Checkout (one-time + subscriptions) with Stripe Connect payouts
- Tailwind CSS 4
