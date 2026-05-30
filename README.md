# FindomVids.xyz (UI mockup)

Dark-themed creator gallery layout — design preview with placeholder photos.

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

## Deploy

Push to GitHub and connect the repo to [Vercel](https://vercel.com) (free).

## Supabase (login & users)

1. Copy `.env.example` → `.env.local` and add your URL + publishable key.
2. In Supabase → **SQL Editor**, run the full script in `supabase/schema.sql`.
3. **Authentication → URL configuration**: Site URL `http://localhost:3000`, redirect `http://localhost:3000/**`
4. **Existing project?** Run `supabase/migration-creator-approval.sql` in SQL Editor (adds creator approval).
5. **Authentication → Providers → Email**: turn **OFF** “Confirm email” (for easy local testing)
6. If signup says email is “invalid” for Gmail etc.: set up **Authentication → SMTP** ([docs](https://supabase.com/docs/guides/auth/auth-smtp))
4. Sign up at `/signup`, then in SQL Editor make yourself admin:
   ```sql
   update public.profiles set role = 'admin' where id = 'YOUR-USER-UUID';
   ```
   (UUID from **Authentication → Users**)

| Route | Purpose |
|-------|---------|
| `/signup` | Create account (buyer or creator) |
| `/login` | Log in |
| `/account` | Profile + creator approval status |
| `/admin` | Approve creators, list users |

## Stack

- Next.js 15 + React 19 + Supabase Auth
- Tailwind CSS 4
- Placeholder gallery images from Unsplash
