import { cache } from "react";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { db, profiles, type Profile, type Role } from "@/db";

export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const existing = await db.query.profiles.findFirst({ where: eq(profiles.id, user.id) });
  if (existing) return existing;

  const isAdmin =
    !!process.env.ADMIN_EMAIL &&
    user.email?.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase();

  const [created] = await db
    .insert(profiles)
    .values({
      id: user.id,
      email: user.email ?? "",
      fullName: (user.user_metadata?.full_name as string | undefined) ?? null,
      role: isAdmin ? "admin" : "student",
    })
    .onConflictDoNothing()
    .returning();

  return created ?? (await db.query.profiles.findFirst({ where: eq(profiles.id, user.id) })) ?? null;
});

export async function requireProfile(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  return profile;
}

const RANK: Record<Role, number> = { student: 0, instructor: 1, admin: 2 };

export function hasRole(profile: Profile, role: Role) {
  return RANK[profile.role] >= RANK[role];
}

export async function requireRole(role: Role): Promise<Profile> {
  const profile = await requireProfile();
  if (!hasRole(profile, role)) redirect("/dashboard?error=forbidden");
  return profile;
}
