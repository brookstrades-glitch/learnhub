# Setup — from a blank Chromebook to a live site

You already have GitHub, Supabase, and Vercel accounts. Everything below happens in the **Linux terminal** on your Chromebook (Settings → Advanced → Developers → Linux, then open "Terminal").

Commands are shown in blocks like this. Type them one at a time and press Enter:

```
echo hello
```

---

## Part 1 — Install the tools (once, ~5 min)

```
sudo apt update
sudo apt install -y git curl
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc
nvm install 22
node -v
```

You should see `v22.x.x`. Then tell git who you are (use the same email as your GitHub account):

```
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

Install the GitHub and Vercel command-line tools and log into both (each opens a browser page — follow the prompts):

```
sudo apt install -y gh
gh auth login
npm install -g vercel
vercel login
```

For `gh auth login` choose: **GitHub.com → HTTPS → Yes (authenticate git) → Login with a web browser**.

---

## Part 2 — Get the code

Ask whoever set this up to add your GitHub username as a collaborator on the repo, then:

```
cd ~
gh repo clone <OWNER>/learnhub
cd learnhub
npm install
```

(Or if the repo was transferred to your account, use your own username as OWNER.)

---

## Part 3 — Create the database (Supabase, ~5 min)

1. Go to https://supabase.com/dashboard → **New project**. Pick any name, set a database password **and save it somewhere** — you need it in a minute.
2. Wait for the project to finish provisioning (~2 min).
3. Left sidebar → **Project Settings** (gear) → **API**. Copy:
   - **Project URL**
   - **anon public** key
4. Same page area → **Database** → **Connection string** → pick **Transaction** mode (it ends in `:6543/postgres`). Copy it and replace `[YOUR-PASSWORD]` with the password from step 1.
5. **Authentication → URL Configuration**: after you deploy (Part 5) come back and set **Site URL** to your Vercel URL and add `https://<your-vercel-url>/auth/callback` under **Redirect URLs**. For now, leave defaults.

Optional — Google login: **Authentication → Providers → Google**, follow Supabase's instructions to create a Google OAuth client. You can skip this; email/password works without it.

---

## Part 4 — Run it on your laptop

```
cp .env.example .env.local
nano .env.local
```

Paste in the four values (URL, anon key, connection string, your own email as `ADMIN_EMAIL`). In nano: **Ctrl+O, Enter** to save, **Ctrl+X** to exit.

Create the tables, then start the app:

```
npm run db:push
npm run dev
```

Open http://localhost:3000. **Sign up** with the email you put in `ADMIN_EMAIL` — that account becomes admin automatically. (If Supabase emails you a confirmation link, click it.)

Then in a second terminal tab, add the sample course:

```
cd ~/learnhub
npm run db:seed
```

Refresh the site: you'll see "Getting Started with LearnHub". Click **Teach** in the top bar to edit it or create your own.

Stop the dev server with **Ctrl+C**.

---

## Part 5 — Put it on the internet (Vercel, ~5 min)

```
vercel link
```

Answer: **Set up and deploy? Y → your account → Link to existing project? N → project name: learnhub → directory: ./ → modify settings? N**

Add the same four environment variables to Vercel:

```
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add DATABASE_URL production
vercel env add ADMIN_EMAIL production
```

(Each one prompts you to paste the value.) Then deploy:

```
vercel --prod
```

It prints a URL like `https://learnhub-xxxx.vercel.app`. That's your live site.

**Now finish Supabase step 5 above** — set Site URL and the `/auth/callback` redirect to that Vercel URL, otherwise email confirmation and Google login will bounce back to localhost.

---

## Part 6 — Auto-deploy on every change

Connect the GitHub repo so you never have to run `vercel --prod` again:

1. https://vercel.com/dashboard → your **learnhub** project → **Settings → Git → Connect Git Repository** → pick the `learnhub` repo.
2. Done. From now on:

```
git add -A
git commit -m "describe what you changed"
git push
```

…and Vercel rebuilds the live site in about a minute. Pull requests get their own preview URL.

---

## Day-to-day

| I want to… | Do this |
|---|---|
| Work on the site locally | `cd ~/learnhub && npm run dev` |
| Ship my changes | `git add -A && git commit -m "..." && git push` |
| Change the database schema | edit `src/db/schema.ts`, then `npm run db:push` (local) — Vercel uses the same Supabase DB, so it's already live |
| Make someone an instructor | log in as admin → **Admin** → change their role → Save |
| Ask Claude to build a feature | `cd ~/learnhub && claude` then describe what you want — `CLAUDE.md` tells it how this project works |

## If something breaks

- **"relation does not exist"** → you skipped `npm run db:push`.
- **Login redirects to localhost on the live site** → Supabase Site URL / Redirect URLs (Part 3 step 5).
- **Vercel build fails** → run `npm run build` locally, fix what it complains about, push again.
- **`ECONNREFUSED` / can't connect to database** → check `DATABASE_URL` uses port **6543** and the password has no `[ ]` brackets left in it.
