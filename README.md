# LearnHub

A simple online learning platform. Instructors create courses made of modules and lessons (Markdown + optional video); students enroll, work through lessons, and track progress.

## Setup on a new laptop (one command)

Paste this into the Linux terminal. Log in to GitHub when the browser opens (you must be a collaborator on the repo). It installs everything, asks for your Supabase keys, creates the tables, and offers to deploy to Vercel.

```
sudo apt-get update -qq && sudo apt-get install -y gh git && gh auth login -h github.com -p https -w && gh repo clone brookstrades-glitch/learnhub ~/learnhub && bash ~/learnhub/setup.sh
```

Manual walkthrough in [SETUP.md](./SETUP.md).

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind + shadcn/ui
- Supabase Auth (email/password + Google) and Supabase Postgres
- Drizzle ORM
- Deployed on Vercel (push to `main` = production)

## Roles

| Role | Can do |
|---|---|
| student | Browse, enroll, take lessons, track progress |
| instructor | Everything above + create/edit/publish their own courses |
| admin | Everything above + edit any course, change user roles |

New sign-ups are students. The email in `ADMIN_EMAIL` becomes admin on first login. Admins promote others from `/admin`.

## Commands

```
npm run dev          # local dev server → http://localhost:3000
npm run build        # production build (Vercel runs this)
npm run typecheck    # generate route types + tsc
npm run lint

npm run db:push      # push schema straight to the database (fastest for solo dev)
npm run db:generate  # write a SQL migration from schema changes
npm run db:migrate   # apply migrations
npm run db:seed      # add a sample course (needs the admin account to exist)
npm run db:studio    # browse the database in a GUI
```

## Environment variables

Copy `.env.example` to `.env.local` and fill in:

| Var | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → anon public |
| `DATABASE_URL` | Supabase → Project Settings → Database → Connection string → **Transaction** (port 6543) |
| `ADMIN_EMAIL` | Your own email |

Same four go into Vercel → Project → Settings → Environment Variables.

## Project layout

```
src/
  app/                 routes (App Router)
    (public)           /, /courses, /courses/[slug], /login, /signup
    dashboard/         student home
    learn/[slug]/      lesson viewer
    instructor/        course builder
    admin/             user + role management
    auth/callback/     Supabase OAuth / email-confirm return URL
  actions/             server actions (all writes go through here)
  components/          UI (components/ui = shadcn)
  db/                  schema.ts, client, seed
  lib/
    auth.ts            getCurrentProfile / requireProfile / requireRole
    queries.ts         read helpers
    supabase/          browser / server / proxy clients
  proxy.ts             session refresh + route protection (Next 16 name for middleware)
drizzle/               SQL migrations
```

## Security model

The app talks to Postgres with the direct connection string (bypasses RLS). All authorization is enforced in `src/actions/*` and page loaders via `requireRole` / ownership checks. Never expose `DATABASE_URL` to the browser — only `NEXT_PUBLIC_*` vars are public.
