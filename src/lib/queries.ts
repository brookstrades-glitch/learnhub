import { and, count, eq, inArray } from "drizzle-orm";
import { db, courses, enrollments, lessonProgress, profiles } from "@/db";

export async function getPublishedCourses() {
  return db.query.courses.findMany({
    where: eq(courses.published, true),
    with: { instructor: true },
    orderBy: (c, { desc }) => [desc(c.createdAt)],
  });
}

export async function getCourseBySlug(slug: string) {
  return db.query.courses.findFirst({
    where: eq(courses.slug, slug),
    with: {
      instructor: true,
      modules: {
        orderBy: (m, { asc }) => [asc(m.position)],
        with: { lessons: { orderBy: (l, { asc }) => [asc(l.position)] } },
      },
    },
  });
}

export async function getCourseById(id: string) {
  return db.query.courses.findFirst({
    where: eq(courses.id, id),
    with: {
      modules: {
        orderBy: (m, { asc }) => [asc(m.position)],
        with: { lessons: { orderBy: (l, { asc }) => [asc(l.position)] } },
      },
    },
  });
}

export async function getInstructorCourses(instructorId: string, all = false) {
  const rows = await db.query.courses.findMany({
    where: all ? undefined : eq(courses.instructorId, instructorId),
    orderBy: (c, { desc }) => [desc(c.updatedAt)],
    with: {
      modules: { with: { lessons: { columns: { id: true } } } },
      enrollments: { columns: { userId: true } },
    },
  });
  return rows.map((c) => ({
    ...c,
    lessonCount: c.modules.reduce((n, m) => n + m.lessons.length, 0),
    studentCount: c.enrollments.length,
  }));
}

export async function isEnrolled(userId: string, courseId: string) {
  const row = await db.query.enrollments.findFirst({
    where: and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId)),
  });
  return !!row;
}

export async function getCompletedLessonIds(userId: string, lessonIds: string[]) {
  if (lessonIds.length === 0) return new Set<string>();
  const rows = await db
    .select({ lessonId: lessonProgress.lessonId })
    .from(lessonProgress)
    .where(and(eq(lessonProgress.userId, userId), inArray(lessonProgress.lessonId, lessonIds)));
  return new Set(rows.map((r) => r.lessonId));
}

export async function getDashboardCourses(userId: string) {
  const enrolled = await db.query.enrollments.findMany({
    where: eq(enrollments.userId, userId),
    with: {
      course: {
        with: {
          instructor: true,
          modules: { with: { lessons: { columns: { id: true } } } },
        },
      },
    },
    orderBy: (e, { desc }) => [desc(e.enrolledAt)],
  });

  const allLessonIds = enrolled.flatMap((e) =>
    e.course.modules.flatMap((m) => m.lessons.map((l) => l.id)),
  );
  const done = await getCompletedLessonIds(userId, allLessonIds);

  return enrolled.map((e) => {
    const ids = e.course.modules.flatMap((m) => m.lessons.map((l) => l.id));
    const completed = ids.filter((id) => done.has(id)).length;
    return {
      course: e.course,
      total: ids.length,
      completed,
      percent: ids.length ? Math.round((completed / ids.length) * 100) : 0,
    };
  });
}

export async function getAllProfiles() {
  return db.query.profiles.findMany({ orderBy: (p, { desc }) => [desc(p.createdAt)] });
}

export async function getAdminStats() {
  const [[u], [c], [e]] = await Promise.all([
    db.select({ n: count() }).from(profiles),
    db.select({ n: count() }).from(courses),
    db.select({ n: count() }).from(enrollments),
  ]);
  return { users: u.n, courses: c.n, enrollments: e.n };
}
