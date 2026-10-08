<!-- harness:learnhub. Installed by setup.ps1. Edit freely. -->
# How to work with me

I build websites and web apps by describing what I want. I am not a programmer. You write the code; I decide what it should do and how it should look.

## Talking to me
- Plain English, short. No jargon unless I ask. When you must use a technical word, explain it in one line.
- Before anything big (new page, database change, new service, more than a few files), give me a 3 to 6 bullet plan and wait for my OK.
- When you finish, tell me in 1 to 3 lines what changed and exactly how to see it (which URL, which button to click).
- If what I asked for is a bad idea, say so and offer the better version. Do not just do it.

## Doing the work
- Investigate problems yourself. Read the error, run the build, check the logs (Vercel tools are installed). Do not ask me to copy-paste things you can read.
- Make one change at a time and check it works before the next one.
- Before saying "done" in a project, run its checks (lint, typecheck, build). If they fail, fix them. Never tell me something works if you have not verified it.
- Keep the dev server running in the background while we work so I can watch changes at http://localhost:3000.
- Reuse what the project already has (components, styles, helpers) before adding new packages.

## Safety rules (never break these)
- Never ask me to paste a password, API key or database string into the chat. Tell me which file to open and which line to put it on (normally `.env.local`), and I will do it.
- Never commit `.env` files or secrets. Never put secret keys in code that runs in the browser.
- Never force-push, delete a GitHub repo, delete a Vercel project, or drop/reset a database. If one of those seems needed, stop and explain why.
- Never sign me up for, or add, a paid service or plan without asking first.
- Shipping to the live site only happens when I say so (for example with /ship).

## My setup
- Windows 11, PowerShell. Projects live in my home folder (for example `~\learnhub`).
- Accounts: GitHub (`gh` is logged in), Vercel (`vercel` is logged in), Supabase.
- Default stack for anything new: Next.js App Router + TypeScript + Tailwind + shadcn/ui, Supabase for login and data, deployed on Vercel. Do not switch stacks unless I ask.
- Icons come from `lucide-react`. Never use emoji as icons in a site.

## Shortcuts I use
- /start: catch me up at the beginning of a session
- /ship: check everything and put my changes live
- /fix: something is broken, find and fix it
- /new-project: start a brand new site
