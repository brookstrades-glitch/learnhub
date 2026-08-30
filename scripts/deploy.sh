#!/usr/bin/env bash
# First-time Vercel deploy: link project, push env vars, deploy to production, connect GitHub.
set -e
cd "$(dirname "$0")/.."

say() { printf "\n\033[1;36m==> %s\033[0m\n" "$*"; }

[ -f .env.local ] || { echo "Missing .env.local — run setup.sh first"; exit 1; }
set -a; . ./.env.local; set +a

if ! vercel whoami >/dev/null 2>&1; then vercel login </dev/tty; fi

say "Linking this folder to a Vercel project"
if [ ! -f .vercel/project.json ]; then
  vercel link --yes </dev/tty
fi

say "Sending environment variables to Vercel"
for VAR in NEXT_PUBLIC_SUPABASE_URL NEXT_PUBLIC_SUPABASE_ANON_KEY DATABASE_URL ADMIN_EMAIL; do
  for ENV in production preview; do
    vercel env rm "$VAR" "$ENV" --yes >/dev/null 2>&1 || true
    printf '%s' "${!VAR}" | vercel env add "$VAR" "$ENV" >/dev/null
  done
done

say "Connecting GitHub repo so every push auto-deploys"
vercel git connect --yes </dev/tty >/dev/null 2>&1 || echo "(could not auto-connect — do it in Vercel dashboard: Settings -> Git)"

say "Deploying to production"
URL=$(vercel --prod --yes 2>/dev/null | tail -1)

cat <<TXT

=====================================================================
  LIVE:  $URL
=====================================================================

ONE LAST STEP (so login works on the live site):
  Supabase dashboard -> Authentication -> URL Configuration
    Site URL:       $URL
    Redirect URLs:  $URL/auth/callback

From now on, to ship changes:
    git add -A && git commit -m "what I changed" && git push
TXT
