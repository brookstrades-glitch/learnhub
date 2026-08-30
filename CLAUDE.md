@AGENTS.md

# LearnHub — project rules

Read `README.md` for the layout and `SETUP.md` for the environment. `setup.sh` bootstraps a fresh machine; `npm run deploy` (scripts/deploy.sh) does first-time Vercel setup. If the user is stuck on setup, run those rather than improvising. This file is what you must follow when changing code.

## Stack (do not swap any of these)
Next.js 16 App Router · TypeScript · Tailwind v4 · shadcn/ui (base-nova, Base UI primitives, not Radix) · Supabase Auth · Postgres via Drizzle ORM · Vercel.

## Non-negotiables
- **Auth stays on Supabase Auth.** Never hand-roll sessions, passwords, or tokens.
- **All writes go through server actions in `src/actions/`.** Every action calls `requireProfile()` / `requireRole()` / an ownership check before touching the DB. No DB access from client components. No API routes for mutations.
- **Schema changes go in `src/db/schema.ts`**, then `npm run db:generate` to produce a migration in `drizzle/`. Commit the migration.
- **Secrets never reach the browser.** Only `NEXT_PUBLIC_*` vars are public. `DATABASE_URL` is server-only.
- **Roles:** student < instructor < admin (`hasRole` in `src/lib/auth.ts` is rank-based). Instructors may only edit their own courses; admins may edit any.
- **Next 16 specifics:** `params`/`searchParams` are Promises — `await` them. Use the generated `PageProps<"/route">` / `LayoutProps` types. Middleware lives in `src/proxy.ts` (exports `proxy`), not `middleware.ts`. Run `npm run typecheck` (it runs `next typegen` first) before declaring work done.
- **Icons:** `lucide-react` only, explicit `size`, `aria-hidden` on decorative icons, `aria-label` on icon-only buttons. No emoji or Unicode glyphs as icons.
- **Links styled as buttons:** `<Link className={buttonVariants({...})}>`. The shadcn `Button` here is Base UI — it has no `asChild`.
- **Video:** store URLs only (YouTube or direct file). Never upload video into the database or Supabase storage.

## Conventions
- Server components by default; add `"use client"` only for forms using `useActionState` or interactive state.
- Forms: `<form action={serverAction}>`; bind IDs with `.bind(null, id)`. Use `useActionState` when the action returns `{ error }`.
- After writes, `revalidatePath` every route that shows the changed data.
- Keep UI plain and legible — the users are non-technical. Prefer the existing shadcn components over new dependencies.
- No multi-line comments or docstrings. Code should read on its own.

## Verify before finishing
```
npm run lint && npm run typecheck && npm run build
```
All three must pass. Vercel runs `next build` on every push; a failing build blocks deploy.

## Things this project does NOT have yet (ask before adding)
Payments, quizzes/assessments, certificates, file uploads, comments, email notifications, i18n.
