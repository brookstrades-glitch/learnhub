# Setup: from a new Windows computer to a live site

You need four accounts first: **GitHub** (and access to this repo), **Vercel** (sign up with GitHub), **Supabase**, and a **Claude** subscription (Pro or Max) for Claude Code.

## 1. Run the setup (about 15 minutes)

Open **PowerShell** (Start menu, type PowerShell, press Enter; do not "Run as administrator") and paste the one-liner from [README.md](./README.md). Right-click pastes in PowerShell.

What happens, in order:
1. Windows may ask "Do you want to allow this app to make changes?" a few times. Click **Yes**; that is the installers.
2. A browser opens to log in to **GitHub**. Copy the 8-character code PowerShell shows, paste it in the browser, approve.
3. The script installs Node.js, VS Code, the Vercel CLI and Claude Code, and asks your name and GitHub email.
4. A browser opens to log in to **Vercel**. Approve.
5. It asks for three Supabase values. Before answering, in another tab:
   - https://supabase.com/dashboard, **New project**, any name, set a database password and **save it in your password manager**. Wait about 2 minutes.
   - **Project Settings > API**: copy **Project URL** and the **anon public** key.
   - **Connect** (top bar): copy the **Transaction pooler** string (ends in `:6543/postgres`) and replace `[YOUR-PASSWORD]` with your password.
6. It creates the database tables and asks whether to deploy now. Say **y**.
7. The deploy prints your live URL and one last Supabase step: **Authentication > URL Configuration**, set **Site URL** to the live URL and add `<live URL>/auth/callback` under **Redirect URLs**. Do it now, or login on the live site will send people to localhost.

If the script stops with an error, fix what it says and run it again: `powershell -ExecutionPolicy Bypass -File $HOME\learnhub\setup.ps1`. Finished steps are skipped.

## 2. First Claude session

Close PowerShell, open a new one, then:

```
lh
```

The first time, Claude asks you to log in with your Claude account in the browser. Then type `/start`. From here on, follow [VIBE-CODING.md](./VIBE-CODING.md).

In the site, **Sign up** with the email you gave as admin; that account becomes admin automatically. To add a sample course, ask Claude: "seed the sample course".

## What setup installed for Claude

| Where | What |
|---|---|
| `~\.claude\CLAUDE.md` | Your personal rules: plain English, plan before big changes, never handle secrets in chat, never delete things |
| `~\.claude\settings.json` | Edits are auto-accepted; common safe commands do not ask; destructive commands are blocked |
| `~\.claude\skills\` | `/start`, `/ship`, `/fix`, `/new-project` |
| Vercel plugin | Lets Claude read deploys and logs to fix live problems itself |
| VS Code extension | Claude panel inside VS Code (`lhcode`) |
| PowerShell shortcuts | `lh` opens Claude in this project, `lhcode` opens it in VS Code |

Source for all of it is the `harness/` folder in this repo. Re-running `setup.ps1` refreshes the skills; it does not overwrite your personal `CLAUDE.md` or `settings.json` if you have edited them.

## If something breaks

Type `/fix` in Claude and describe it. Common ones:

- **"relation does not exist"**: the tables were not created. `npm run db:push`.
- **Login on the live site redirects to localhost**: the Supabase URL Configuration step above.
- **Can't connect to the database**: `DATABASE_URL` must use port **6543** and must not still contain `[YOUR-PASSWORD]`. If your password has symbols like `@ # / ?`, reset it in Supabase to letters and numbers only.
- **"running scripts is disabled on this system"**: run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` in PowerShell, then retry.
- **`claude`, `gh` or `vercel` "is not recognized"**: close PowerShell and open a new one; the install updated your PATH.
