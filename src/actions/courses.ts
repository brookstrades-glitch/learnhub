"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db, courses, modules, lessons, enrollments, lessonProgress } from "@/db";
import { requireProfile, requireRole, hasRole } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export type ActionState = { error?: string } | undefined;

async function ownedCourse(courseId: string) {
  const profile = await requireRole("instructor");
  const course = await db.query.courses.findFirst({ where: eq(courses.id, courseId) });
  if (!course) throw new Error("Course not found");
  if (course.instructorId !== profile.id && !hasRole(profile, "admin")) throw new Error("Forbidden");
  return { profile, course };
}

const courseSchema = z.object({
  title: z.string().min(2).max(120),
  description: z.string().max(5000).default(""),
  coverImageUrl: z.string().url().optional().or(z.literal("")),
});

export async function createCourse(_: ActionState, formData: FormData): Promise<ActionState> {
  const profile = await requireRole("instructor");
  const parsed = courseSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const base = slugify(parsed.data.title) || "course";
  const slug = `${base}-${Math.random().toString(36).slice(2, 7)}`;

  const [course] = await db
    .insert(courses)
    .values({
      title: parsed.data.title,
      description: parsed.data.description,
      coverImageUrl: parsed.data.coverImageUrl || null,
      slug,
      instructorId: profile.id,
    })
    .returning();

  redirect(`/instructor/courses/${course.id}`);
}

export async function updateCourse(
  courseId: string,
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await ownedCourse(courseId);
  const parsed = courseSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await db
    .update(courses)
    .set({
      title: parsed.data.title,
      description: parsed.data.description,
      coverImageUrl: parsed.data.coverImageUrl || null,
      updatedAt: new Date(),
    })
    .where(eq(courses.id, courseId));

  revalidatePath(`/instructor/courses/${courseId}`);
  revalidatePath("/courses");
  return undefined;
}

export async function togglePublish(courseId: string) {
  const { course } = await ownedCourse(courseId);
  await db
    .update(courses)
    .set({ published: !course.published, updatedAt: new Date() })
    .where(eq(courses.id, courseId));
  revalidatePath(`/instructor/courses/${courseId}`);
  revalidatePath("/courses");
}

export async function deleteCourse(courseId: string) {
  await ownedCourse(courseId);
  await db.delete(courses).where(eq(courses.id, courseId));
  revalidatePath("/instructor");
  revalidatePath("/courses");
  redirect("/instructor");
}

export async function addModule(courseId: string, formData: FormData) {
  await ownedCourse(courseId);
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  const [{ next }] = await db
    .select({ next: sql<number>`coalesce(max(${modules.position}), -1) + 1` })
    .from(modules)
    .where(eq(modules.courseId, courseId));

  await db.insert(modules).values({ courseId, title, position: Number(next) });
  revalidatePath(`/instructor/courses/${courseId}`);
}

export async function renameModule(courseId: string, moduleId: string, formData: FormData) {
  await ownedCourse(courseId);
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  await db
    .update(modules)
    .set({ title })
    .where(and(eq(modules.id, moduleId), eq(modules.courseId, courseId)));
  revalidatePath(`/instructor/courses/${courseId}`);
}

export async function deleteModule(courseId: string, moduleId: string) {
  await ownedCourse(courseId);
  await db.delete(modules).where(and(eq(modules.id, moduleId), eq(modules.courseId, courseId)));
  revalidatePath(`/instructor/courses/${courseId}`);
}

export async function moveModule(courseId: string, moduleId: string, dir: -1 | 1) {
  await ownedCourse(courseId);
  const list = await db.query.modules.findMany({
    where: eq(modules.courseId, courseId),
    orderBy: (m, { asc }) => [asc(m.position)],
  });
  const i = list.findIndex((m) => m.id === moduleId);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= list.length) return;
  [list[i], list[j]] = [list[j], list[i]];
  await Promise.all(
    list.map((m, idx) => db.update(modules).set({ position: idx }).where(eq(modules.id, m.id))),
  );
  revalidatePath(`/instructor/courses/${courseId}`);
}

export async function addLesson(courseId: string, moduleId: string, formData: FormData) {
  await ownedCourse(courseId);
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  const [{ next }] = await db
    .select({ next: sql<number>`coalesce(max(${lessons.position}), -1) + 1` })
    .from(lessons)
    .where(eq(lessons.moduleId, moduleId));

  const [lesson] = await db
    .insert(lessons)
    .values({ moduleId, title, position: Number(next) })
    .returning();
  redirect(`/instructor/courses/${courseId}/lessons/${lesson.id}`);
}

const lessonSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().max(100_000).default(""),
  videoUrl: z.string().url().optional().or(z.literal("")),
});

export async function updateLesson(
  courseId: string,
  lessonId: string,
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await ownedCourse(courseId);
  const parsed = lessonSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await db
    .update(lessons)
    .set({
      title: parsed.data.title,
      content: parsed.data.content,
      videoUrl: parsed.data.videoUrl || null,
    })
    .where(eq(lessons.id, lessonId));

  revalidatePath(`/instructor/courses/${courseId}`);
  revalidatePath(`/instructor/courses/${courseId}/lessons/${lessonId}`);
  return undefined;
}

export async function deleteLesson(courseId: string, lessonId: string) {
  await ownedCourse(courseId);
  await db.delete(lessons).where(eq(lessons.id, lessonId));
  revalidatePath(`/instructor/courses/${courseId}`);
  redirect(`/instructor/courses/${courseId}`);
}

export async function moveLesson(courseId: string, lessonId: string, dir: -1 | 1) {
  await ownedCourse(courseId);
  const lesson = await db.query.lessons.findFirst({ where: eq(lessons.id, lessonId) });
  if (!lesson) return;
  const list = await db.query.lessons.findMany({
    where: eq(lessons.moduleId, lesson.moduleId),
    orderBy: (l, { asc }) => [asc(l.position)],
  });
  const i = list.findIndex((l) => l.id === lessonId);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= list.length) return;
  [list[i], list[j]] = [list[j], list[i]];
  await Promise.all(
    list.map((l, idx) => db.update(lessons).set({ position: idx }).where(eq(lessons.id, l.id))),
  );
  revalidatePath(`/instructor/courses/${courseId}`);
}

export async function enroll(courseId: string) {
  const profile = await requireProfile();
  const course = await db.query.courses.findFirst({ where: eq(courses.id, courseId) });
  if (!course || !course.published) throw new Error("Course not available");
  await db.insert(enrollments).values({ userId: profile.id, courseId }).onConflictDoNothing();
  revalidatePath(`/courses/${course.slug}`);
  revalidatePath("/dashboard");
  redirect(`/learn/${course.slug}`);
}

export async function markLessonComplete(lessonId: string, courseSlug: string) {
  const profile = await requireProfile();
  await db.insert(lessonProgress).values({ userId: profile.id, lessonId }).onConflictDoNothing();
  revalidatePath(`/learn/${courseSlug}`);
  revalidatePath("/dashboard");
}

export async function markLessonIncomplete(lessonId: string, courseSlug: string) {
  const profile = await requireProfile();
  await db
    .delete(lessonProgress)
    .where(and(eq(lessonProgress.userId, profile.id), eq(lessonProgress.lessonId, lessonId)));
  revalidatePath(`/learn/${courseSlug}`);
  revalidatePath("/dashboard");
}
