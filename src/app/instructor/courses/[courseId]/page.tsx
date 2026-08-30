import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowDown, ArrowUp, Eye, Plus, Trash2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { requireRole, hasRole } from "@/lib/auth";
import { getCourseById } from "@/lib/queries";
import { CourseForm } from "@/components/course-form";
import {
  addLesson,
  addModule,
  deleteCourse,
  deleteModule,
  moveLesson,
  moveModule,
  renameModule,
  togglePublish,
} from "@/actions/courses";

export default async function EditCoursePage({ params }: PageProps<"/instructor/courses/[courseId]">) {
  const { courseId } = await params;
  const profile = await requireRole("instructor");
  const course = await getCourseById(courseId);
  if (!course) notFound();
  if (course.instructorId !== profile.id && !hasRole(profile, "admin")) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">{course.title}</h1>
          <Badge variant={course.published ? "default" : "secondary"}>
            {course.published ? "Published" : "Draft"}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Link href={`/courses/${course.slug}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
            <Eye size={14} aria-hidden />
            Preview
          </Link>
          <form action={togglePublish.bind(null, course.id)}>
            <Button type="submit" size="sm" variant={course.published ? "secondary" : "default"}>
              {course.published ? "Unpublish" : "Publish"}
            </Button>
          </form>
        </div>
      </div>

      <section className="rounded-lg border p-6">
        <h2 className="mb-4 text-lg font-semibold">Details</h2>
        <CourseForm course={course} />
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-lg font-semibold">Curriculum</h2>

        <div className="space-y-4">
          {course.modules.map((m, mi) => (
            <div key={m.id} className="rounded-lg border">
              <div className="flex items-center gap-2 border-b bg-muted/40 p-3">
                <form action={renameModule.bind(null, course.id, m.id)} className="flex flex-1 gap-2">
                  <Input name="title" defaultValue={m.title} className="max-w-md" aria-label="Module title" />
                  <Button type="submit" size="sm" variant="outline">
                    Rename
                  </Button>
                </form>
                <form action={moveModule.bind(null, course.id, m.id, -1)}>
                  <Button type="submit" size="icon-sm" variant="ghost" disabled={mi === 0} aria-label="Move module up">
                    <ArrowUp size={14} aria-hidden />
                  </Button>
                </form>
                <form action={moveModule.bind(null, course.id, m.id, 1)}>
                  <Button
                    type="submit"
                    size="icon-sm"
                    variant="ghost"
                    disabled={mi === course.modules.length - 1}
                    aria-label="Move module down"
                  >
                    <ArrowDown size={14} aria-hidden />
                  </Button>
                </form>
                <form action={deleteModule.bind(null, course.id, m.id)}>
                  <Button type="submit" size="icon-sm" variant="ghost" aria-label="Delete module">
                    <Trash2 size={14} aria-hidden />
                  </Button>
                </form>
              </div>

              <ul className="divide-y">
                {m.lessons.map((l, li) => (
                  <li key={l.id} className="flex items-center gap-2 px-3 py-2">
                    <Link
                      href={`/instructor/courses/${course.id}/lessons/${l.id}`}
                      className="flex-1 truncate text-sm hover:underline"
                    >
                      {l.title}
                    </Link>
                    {l.videoUrl && <Badge variant="outline">video</Badge>}
                    <form action={moveLesson.bind(null, course.id, l.id, -1)}>
                      <Button type="submit" size="icon-xs" variant="ghost" disabled={li === 0} aria-label="Move lesson up">
                        <ArrowUp size={12} aria-hidden />
                      </Button>
                    </form>
                    <form action={moveLesson.bind(null, course.id, l.id, 1)}>
                      <Button
                        type="submit"
                        size="icon-xs"
                        variant="ghost"
                        disabled={li === m.lessons.length - 1}
                        aria-label="Move lesson down"
                      >
                        <ArrowDown size={12} aria-hidden />
                      </Button>
                    </form>
                  </li>
                ))}
              </ul>

              <form action={addLesson.bind(null, course.id, m.id)} className="flex gap-2 p-3">
                <Input name="title" placeholder="New lesson title" required className="max-w-md" />
                <Button type="submit" size="sm" variant="outline">
                  <Plus size={14} aria-hidden />
                  Add lesson
                </Button>
              </form>
            </div>
          ))}
        </div>

        <form action={addModule.bind(null, course.id)} className="mt-4 flex gap-2">
          <Input name="title" placeholder="New module title" required className="max-w-md" />
          <Button type="submit" variant="outline">
            <Plus size={14} aria-hidden />
            Add module
          </Button>
        </form>
      </section>

      <Separator className="my-10" />

      <section>
        <h2 className="mb-2 text-lg font-semibold text-destructive">Danger zone</h2>
        <p className="mb-3 text-sm text-muted-foreground">
          Deleting a course removes all its modules, lessons, and student progress. This cannot be undone.
        </p>
        <form action={deleteCourse.bind(null, course.id)}>
          <Button type="submit" variant="destructive">
            Delete course
          </Button>
        </form>
      </section>
    </div>
  );
}
