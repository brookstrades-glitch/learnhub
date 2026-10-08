---
name: new-project
description: Create a brand new website or web app from scratch, with its own GitHub repo and a live Vercel URL. Use when the user wants to start a new site, app or project separate from the current one.
disable-model-invocation: true
argument-hint: "[name] [what it is for]"
---

Request: $ARGUMENTS

1. Ask (in one message, only what is missing): a short name, what the site is for in one sentence, and whether people need to log in or save data. Turn the name into a lowercase-hyphen folder name.
2. From the home folder: `npx create-next-app@latest <name> --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --yes`, then `cd` into it.
3. `npx shadcn@latest init -d` and `npm install lucide-react`.
4. Write a `CLAUDE.md` in the project (keep any `@AGENTS.md` line create-next-app wrote at the top) with: what the site is for, who uses it, the stack, and the rule that checks (`npm run lint`, `npm run build`) must pass before shipping. Keep it under 30 lines.
5. If login or saved data is needed: tell the user to create a Supabase project and which values go in `.env.local` (and the names to put in `.env.example`). Install `@supabase/supabase-js @supabase/ssr` and follow the Supabase Next.js SSR guide. Do not build the data layer until they have done that.
6. Replace the starter page with a simple, good-looking first version of their home page based on what the site is for. Run `npm run build`.
7. Commit, then `gh repo create <name> --private --source=. --push`.
8. `vercel link --yes --project <name>`, then `vercel git connect --yes`, then add any env vars from `.env.local` with `vercel env add`, then `vercel --prod --yes`.
9. Start the dev server and tell the user: the folder, the GitHub repo, the live URL, and that from now on they run `claude` inside that folder and use /ship to publish.
