---
name: fix
description: Something is broken (error on screen, page not loading, failed deploy, login not working). Find the real cause and fix it. Use when the user reports a bug, an error, or says something stopped working.
argument-hint: "[what is wrong, or paste the error]"
---

Problem: $ARGUMENTS

1. Reproduce it before changing anything. Depending on where it happens:
   - Local site: check the dev server output, load the page, run `npm run build`.
   - Live site: check the latest deploy and its build/runtime logs with the Vercel tools or `vercel logs`.
   - Login problems: check Supabase Site URL and Redirect URLs against the live URL, and the env vars on Vercel.
2. Find the root cause. Say it to the user in one plain sentence. Do not guess: if you have not reproduced it, keep investigating.
3. Make the smallest fix that solves the cause, not the symptom. Do not rewrite unrelated code.
4. Prove it is fixed the same way you reproduced it, then run the project checks (`lint`, `typecheck`, `build`).
5. Tell the user: what was wrong, what you changed, and how they can see it working. If the bug is on the live site, ask whether to /ship the fix.
6. Ask the user for something only if it is genuinely only on their side (a dashboard setting you cannot reach). Tell them exactly where to click.
