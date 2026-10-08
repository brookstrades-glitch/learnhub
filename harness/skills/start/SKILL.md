---
name: start
description: Start a work session. Syncs the project, installs anything new, starts the dev server and tells the user where things stand. Use when the user says start, good morning, let's work, or opens a session in a project.
---

1. Run `git status` and `git pull --ff-only`. If there are uncommitted changes, list them in plain English (what was being worked on, not file names) and ask whether to keep going with them or ship them first.
2. If `package-lock.json` changed in the pull or `node_modules` is missing, run `npm install`.
3. If `.env.local` is missing but `.env.example` exists, tell the user which values are needed and where to get each one. Do not ask them to paste values into the chat.
4. Start the dev server in the background (`npm run dev`) and confirm http://localhost:3000 responds.
5. Run `vercel ls --yes 2>/dev/null | head -5` (if the folder is linked) and report whether the latest live deploy is Ready or Error.
6. Reply with at most 5 short lines: what changed since last time, live site status, the local URL, and one suggestion for what to do next based on recent commits. Then ask what they want to build today.
