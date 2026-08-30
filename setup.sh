#!/usr/bin/env bash
# LearnHub one-shot setup for Debian/Ubuntu (Chromebook Linux).
# Run:  curl -fsSL https://raw.githubusercontent.com/brookstrades-glitch/learnhub/main/setup.sh -o setup.sh && bash setup.sh
set -e

REPO="brookstrades-glitch/learnhub"
DIR="$HOME/learnhub"

say()  { printf "\n\033[1;36m==> %s\033[0m\n" "$*"; }
ask()  { local v; read -r -p "$1: " v </dev/tty; echo "$v"; }
yes_no() { local v; read -r -p "$1 [y/N]: " v </dev/tty; [[ "$v" =~ ^[Yy] ]]; }

say "1/7  Installing git, curl, gh"
sudo apt-get update -qq
sudo apt-get install -y -qq git curl gh nano >/dev/null

say "2/7  Installing Node 22 (via nvm)"
export NVM_DIR="$HOME/.nvm"
if [ ! -s "$NVM_DIR/nvm.sh" ]; then
  curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash >/dev/null
fi
. "$NVM_DIR/nvm.sh"
nvm install 22 >/dev/null
nvm alias default 22 >/dev/null
echo "node $(node -v), npm $(npm -v)"
npm ls -g vercel >/dev/null 2>&1 || npm install -g vercel >/dev/null

say "3/7  Git identity"
if [ -z "$(git config --global user.name)" ]; then
  git config --global user.name "$(ask 'Your name')"
fi
if [ -z "$(git config --global user.email)" ]; then
  git config --global user.email "$(ask 'Your GitHub email')"
fi
git config --global init.defaultBranch main

say "4/7  Log in to GitHub and Vercel (a browser will open for each)"
if ! gh auth status >/dev/null 2>&1; then
  gh auth login --hostname github.com --git-protocol https --web </dev/tty
fi
if ! vercel whoami >/dev/null 2>&1; then
  vercel login </dev/tty
fi

say "5/7  Getting the code"
if [ ! -d "$DIR/.git" ]; then
  gh repo clone "$REPO" "$DIR"
fi
cd "$DIR"
git pull -q --ff-only || true
npm install --no-audit --no-fund

say "6/7  Supabase keys"
if [ ! -f .env.local ]; then
  cat <<'TXT'

Open https://supabase.com/dashboard in your browser.
  - New project -> any name -> set a database password (WRITE IT DOWN) -> wait ~2 min
  - Project Settings (gear) -> API        : copy "Project URL" and "anon public" key
  - Project Settings (gear) -> Database   : Connection string -> "Transaction" tab
      copy it and replace [YOUR-PASSWORD] with your password

Paste each value below.
TXT
  URL=$(ask 'Project URL (https://xxxx.supabase.co)')
  ANON=$(ask 'anon public key')
  DBURL=$(ask 'Connection string (postgresql://...:6543/postgres)')
  EMAIL=$(ask 'Your email (this account becomes admin)')
  cat > .env.local <<EOF
NEXT_PUBLIC_SUPABASE_URL=$URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$ANON
DATABASE_URL=$DBURL
ADMIN_EMAIL=$EMAIL
EOF
fi

say "7/7  Creating database tables"
npm run db:push

cat <<'TXT'

=====================================================================
  LOCAL SETUP DONE
=====================================================================

To run it on this laptop:
    cd ~/learnhub && npm run dev
  then open http://localhost:3000, click Sign up, use the admin email.
  In a second terminal tab:  cd ~/learnhub && npm run db:seed   (adds a sample course)

To put it on the internet:
    cd ~/learnhub && npm run deploy
  (walks you through Vercel; run it once, then every 'git push' auto-deploys)

To have Claude build features:
    cd ~/learnhub && claude
TXT

if yes_no "Deploy to Vercel now?"; then
  npm run deploy
fi
