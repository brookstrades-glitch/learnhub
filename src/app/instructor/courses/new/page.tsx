import { requireRole } from "@/lib/auth";
import { CourseForm } from "@/components/course-form";

export const metadata = { title: "New course" };

export default async function NewCoursePage() {
  await requireRole("instructor");
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold">New course</h1>
      <CourseForm />
    </div>
  );
}
