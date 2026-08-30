import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  primaryKey,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const roleEnum = pgEnum("role", ["student", "instructor", "admin"]);

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  email: text("email").notNull(),
  fullName: text("full_name"),
  role: roleEnum("role").notNull().default("student"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const courses = pgTable(
  "courses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    coverImageUrl: text("cover_image_url"),
    instructorId: uuid("instructor_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    published: boolean("published").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("courses_instructor_idx").on(t.instructorId)],
);

export const modules = pgTable(
  "modules",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    position: integer("position").notNull().default(0),
  },
  (t) => [index("modules_course_idx").on(t.courseId)],
);

export const lessons = pgTable(
  "lessons",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    moduleId: uuid("module_id")
      .notNull()
      .references(() => modules.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    content: text("content").notNull().default(""),
    videoUrl: text("video_url"),
    position: integer("position").notNull().default(0),
  },
  (t) => [index("lessons_module_idx").on(t.moduleId)],
);

export const enrollments = pgTable(
  "enrollments",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    enrolledAt: timestamp("enrolled_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.courseId] })],
);

export const lessonProgress = pgTable(
  "lesson_progress",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    lessonId: uuid("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.lessonId] })],
);

export const coursesRelations = relations(courses, ({ one, many }) => ({
  instructor: one(profiles, { fields: [courses.instructorId], references: [profiles.id] }),
  modules: many(modules),
  enrollments: many(enrollments),
}));

export const modulesRelations = relations(modules, ({ one, many }) => ({
  course: one(courses, { fields: [modules.courseId], references: [courses.id] }),
  lessons: many(lessons),
}));

export const lessonsRelations = relations(lessons, ({ one }) => ({
  module: one(modules, { fields: [lessons.moduleId], references: [modules.id] }),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  user: one(profiles, { fields: [enrollments.userId], references: [profiles.id] }),
  course: one(courses, { fields: [enrollments.courseId], references: [courses.id] }),
}));

export type Profile = typeof profiles.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type Module = typeof modules.$inferSelect;
export type Lesson = typeof lessons.$inferSelect;
export type Role = Profile["role"];
