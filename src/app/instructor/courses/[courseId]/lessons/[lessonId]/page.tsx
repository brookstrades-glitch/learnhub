import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { requireRole, hasRole } from "@/lib/auth";
import { getCourseById } from "@/lib/queries";
import { deleteLesson } from "@/actions/courses";
import { LessonForm } from "@/components/lesson-form";

export default async function EditLessonPage({
  params,
}: PageProps<"/instructor/courses/[courseId]/lessons/[lessonId]">) {
  const { courseId, lessonId } = await params;
  const profile = await requireRole("instructor");
  const course = await getCourseById(courseId);
  if (!course) notFound();
  if (course.instructorId !== profile.id && !hasRole(profile, "admin")) notFound();

  const lesson = course.modules.flatMap((m) => m.lessons).find((l) => l.id === lessonId);
  if (!lesson) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link
        href={`/instructor/courses/${course.id}`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft size={14} aria-hidden />
        {course.title}
      </Link>
      <h1 className="mb-6 text-2xl font-bold">Edit lesson</h1>
      <LessonForm courseId={course.id} lesson={lesson} />

      <form action={deleteLesson.bind(null, course.id, lesson.id)} className="mt-10 border-t pt-6">
        <Button type="submit" variant="destructive" size="sm">
          Delete lesson
        </Button>
      </form>
    </div>
  );
}
