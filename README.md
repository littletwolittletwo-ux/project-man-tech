# Client Wishlist Dashboard

Internal tool for managing client software wishlists. Built with Next.js 15, Supabase, and Tailwind CSS.

## Accounts

Three pre-seeded accounts (no public signup):

| Email | Role | Access |
|---|---|---|
| `eric@example.com` | employee | Manages his own clients |
| `prithvi@example.com` | employee | Manages his own clients |
| `admin@example.com` | admin | Sees everything, full edit access |

## Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com) (free tier works)
2. Go to **SQL Editor** and run `supabase/migrations/0001_init.sql`
3. Copy your project URL, anon key, and service role key

### 2. Environment Variables

```bash
cp .env.example .env.local
```

Fill in:
- `NEXT_PUBLIC_SUPABASE_URL` — your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — your anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` — service role key (server-only, never expose)
- `SEED_ERIC_EMAIL`, `SEED_ERIC_PASSWORD` — Eric's credentials
- `SEED_PRITHVI_EMAIL`, `SEED_PRITHVI_PASSWORD` — Prithvi's credentials
- `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` — Admin's credentials

### 3. Seed Accounts

```bash
npm run seed
```

This creates the three auth users and their profile rows. Safe to re-run (idempotent).

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and log in with a seeded account.

### 5. Deploy to Vercel

1. Push to `main` — Vercel auto-deploys (repo is already connected)
2. In Vercel → **Settings → Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - (Skip the `SEED_*` vars in production)

## Tech Stack

- **Framework:** Next.js 15 (App Router) + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Auth + DB:** Supabase (Postgres, Auth, Row Level Security)
- **Forms:** react-hook-form + zod
- **Icons:** lucide-react
- **Font:** Geist Sans
