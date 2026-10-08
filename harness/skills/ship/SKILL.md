---
name: ship
description: Check the current changes, save them to GitHub and put them live on Vercel. Only run when the user explicitly asks to ship, publish, deploy or put it live.
disable-model-invocation: true
argument-hint: "[preview] [note about what changed]"
---

Ship the current work. Arguments: $ARGUMENTS

1. `git status` and `git diff`. If nothing changed, say so and stop.
2. Make sure no secret is about to be committed: no `.env*` file staged, no API keys, passwords or connection strings in the diff. If you find one, stop and explain.
3. Run every check the project has in `package.json` (`lint`, `typecheck`, `build`, `test`). If any fail, fix the cause and re-run. Never skip a failing check and never weaken a check to make it pass. If you cannot fix it in a few tries, stop and explain in plain English.
4. If the schema changed and the project uses Drizzle, make sure the migration is generated and the database is updated (`npm run db:push`) before shipping, because the live site shares the database.
5. Commit with a clear message that says what the user can now do, for example "Students can filter courses by topic".
6. If the arguments include `preview`: push to a new branch, open a pull request with `gh pr create --fill`, wait for the Vercel preview, and give the user the preview URL. Stop there.
7. Otherwise push to `main`. Watch the deploy with `vercel ls --yes` / `vercel inspect` (or the Vercel tools) until it is Ready or Error.
8. If it errors, read the build logs, fix, and repeat from step 3.
9. Finish with two lines: what is now live, and the live URL to check it.
