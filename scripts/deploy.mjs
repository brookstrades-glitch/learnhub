import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parse } from "dotenv";

process.chdir(fileURLToPath(new URL("..", import.meta.url)));

const say = (m) => console.log(`\n\x1b[1;36m==> ${m}\x1b[0m`);
const vercel = (args, opts = {}) => spawnSync(`vercel ${args.join(" ")}`, { shell: true, stdio: "inherit", ...opts });

if (!existsSync(".env.local")) {
  console.error("Missing .env.local. Run setup first.");
  process.exit(1);
}
const env = parse(readFileSync(".env.local"));
const VARS = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "DATABASE_URL", "ADMIN_EMAIL"];
const missing = VARS.filter((v) => !env[v]);
if (missing.length) {
  console.error(`.env.local is missing: ${missing.join(", ")}`);
  process.exit(1);
}

if (vercel(["whoami"], { stdio: "ignore" }).status !== 0) vercel(["login"]);

say("Linking this folder to a Vercel project");
if (!existsSync(".vercel/project.json") && vercel(["link", "--yes"]).status !== 0) process.exit(1);

say("Sending environment variables to Vercel");
for (const name of VARS) {
  for (const target of ["production", "preview"]) {
    vercel(["env", "rm", name, target, "--yes"], { stdio: "ignore" });
    const r = vercel(["env", "add", name, target], { input: env[name], stdio: ["pipe", "ignore", "pipe"] });
    if (r.status !== 0) {
      if (target === "production") {
        console.error(`Could not set ${name}: ${r.stderr}`);
        process.exit(1);
      }
      console.log(`  (skipped ${name} for preview; add it in Vercel > Settings > Environment Variables if previews need it)`);
    }
  }
}

say("Connecting GitHub repo so every push auto-deploys");
if (vercel(["git", "connect", "--yes"], { stdio: "ignore" }).status !== 0) {
  console.log("  (could not auto-connect; do it in the Vercel dashboard: Settings > Git)");
}

say("Deploying to production");
const out = vercel(["--prod", "--yes"], { stdio: ["inherit", "pipe", "pipe"], encoding: "utf8" });
process.stderr.write(out.stderr ?? "");
if (out.status !== 0) process.exit(1);
const log = `${out.stdout}
${out.stderr}`;
const url =
  log.match(/Aliased\s+(https:\/\/\S+)/)?.[1] ??
  out.stdout.trim().split(/\s+/).filter((s) => s.startsWith("https://")).pop() ??
  "(see the Vercel dashboard)";

console.log(`
=====================================================================
  LIVE:  ${url}
=====================================================================

ONE LAST STEP (so login works on the live site):
  Supabase dashboard > Authentication > URL Configuration
    Site URL:       ${url}
    Redirect URLs:  ${url}/auth/callback

From now on, ship changes by telling Claude: /ship
`);
