"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db, profiles, type Role } from "@/db";
import { requireRole } from "@/lib/auth";

const ROLES: Role[] = ["student", "instructor", "admin"];

export async function setUserRole(userId: string, formData: FormData) {
  const admin = await requireRole("admin");
  const role = String(formData.get("role")) as Role;
  if (!ROLES.includes(role)) return;
  if (userId === admin.id) return;
  await db.update(profiles).set({ role }).where(eq(profiles.id, userId));
  revalidatePath("/admin");
}
