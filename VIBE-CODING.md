# Vibe coding playbook

You describe it, Claude builds it, you check it in the browser, you ship it. This page is everything you need.

## Every session

1. Open **PowerShell** and type `lh` (or `lhcode` to work inside VS Code, then click the Claude icon at the top right).
2. Type `/start`. Claude pulls the latest code, starts the site on your computer, and tells you where things stand.
3. Open **http://localhost:3000** in Chrome and keep it open. Every change shows up there within a second or two.
4. Build (see below).
5. When you like what you see, type `/ship`. Claude checks everything, saves it to GitHub, and the live site updates in about a minute.

## The four commands

| Type | When |
|---|---|
| `/start` | Beginning of every session |
| `/ship` | You are happy and want it live. `/ship preview` gives you a private test link first |
| `/fix <what is wrong>` | Anything broken: an error, a blank page, a failed deploy, login not working |
| `/new-project <name> <what it is for>` | A brand new, separate site with its own link |

## How to ask for things

Describe the **result you want and who it is for**, not the code.

| Weak | Strong |
|---|---|
| "add a search" | "On the Courses page, add a search box at the top so students can find a course by typing part of its title. Results should filter as they type." |
| "make it look better" | "The home page feels plain. Make the top section bold: big headline, one sentence under it, one button to Browse Courses. Calm colors, lots of white space, works on a phone." |
| "fix the login" | "/fix after I sign up on the live site, the email link sends me to localhost instead of the site" |

Good habits:
- **One feature at a time.** Ask, look at it in the browser, adjust, then the next thing.
- **For anything big, plan first.** Press **Shift+Tab** until you see "plan mode", then describe the feature. Claude writes a plan instead of code. Read it, push back, then approve.
- **Show, don't describe.** Drag a screenshot into the Claude window, or say "make it look like <website>".
- **Say what is wrong specifically.** "The button is too small on my phone" beats "it looks off".
- **Fresh topic, fresh chat.** Type `/clear` when you switch to something unrelated. Claude stays sharper.
- **Ask it to explain.** "Explain what you just changed like I am new to this" is always fair.

## Undo

- **Undo Claude's last steps:** press **Esc** twice and pick the point to go back to.
- **Just say it:** "undo that last change" or "go back to how the home page looked this morning".
- Everything you shipped is saved on GitHub forever, so nothing shipped is ever really lost.

## Rules that keep you safe

- **Never paste passwords, keys or database strings into the chat.** Claude will tell you which file to open (usually `.env.local`) and which line to put it on.
- **Nothing goes live until you say `/ship`.** Experiment freely on localhost.
- **Do not click "allow" on something you do not understand.** Ask Claude "what does that command do?" first. Deleting things is blocked on purpose.
- **Paid services:** Claude will ask before adding anything that costs money. Check with Brook if unsure.

## Where things live

| Thing | Where |
|---|---|
| Your project folder | `C:\Users\<you>\learnhub` |
| Live site and deploy history | https://vercel.com/dashboard |
| Code history | https://github.com (your repos) |
| Users and database | https://supabase.com/dashboard |
| Project rules Claude follows | `CLAUDE.md` in the project folder |
| Your personal rules for Claude | `C:\Users\<you>\.claude\CLAUDE.md` |

## When you are stuck

1. `/fix` and describe what you see.
2. Still stuck: ask Claude "write a short summary of this problem I can send to Brook", and send it.
