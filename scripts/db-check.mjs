import { config } from "dotenv";
import postgres from "postgres";

config({ path: [".env.local", ".env"], quiet: true });

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is missing from .env.local.");
  process.exit(1);
}

let host = "?";
try {
  const u = new URL(url);
  host = `${u.hostname}:${u.port}`;
  console.log(`    connecting as ${decodeURIComponent(u.username)} to ${host}`);
} catch {
  console.error("DATABASE_URL is not a valid connection string. Paste it again from Supabase > Connect > Transaction pooler.");
  process.exit(1);
}

const sql = postgres(url, { prepare: false, max: 1, connect_timeout: 15, onnotice: () => {} });
try {
  await sql`select 1`;
  console.log("    database connection OK");
  await sql.end();
} catch (e) {
  await sql.end({ timeout: 1 }).catch(() => {});
  const msg = `${e.code ?? ""} ${e.message ?? e}`;
  let hint = "Unexpected error. Send Brook a screenshot of this.";
  if (/password authentication failed|28P01/i.test(msg)) hint = "Wrong database password. Reset it in Supabase > Project Settings > Database (letters and numbers only), then paste the new connection string.";
  else if (/tenant or user not found|XX000/i.test(msg)) hint = "The user name or region in the connection string is wrong. Copy it again from Supabase > Connect > Transaction pooler.";
  else if (/ENOTFOUND|EAI_AGAIN/i.test(msg)) hint = "The database address could not be found. Check the connection string or your internet connection.";
  else if (/ETIMEDOUT|CONNECT_TIMEOUT|ECONNREFUSED|ENETUNREACH/i.test(msg)) hint = "Could not reach the database. Check your internet, VPN or firewall, and that the Supabase project is not paused.";
  console.error(`\n    Database error: ${msg.trim()}\n    ${hint}\n`);
  process.exit(1);
}
