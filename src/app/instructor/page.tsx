import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { requireRole, hasRole } from "@/lib/auth";
import { getInstructorCourses } from "@/lib/queries";

export const metadata = { title: "Teach" };

export default async function InstructorPage() {
  const profile = await requireRole("instructor");
  const courses = await getInstructorCourses(profile.id, hasRole(profile, "admin"));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Your courses</h1>
        <Link href="/instructor/courses/new" className={buttonVariants()}>
          <Plus size={16} aria-hidden />
          New course
        </Link>
      </div>

      {courses.length === 0 ? (
        <p className="text-muted-foreground">No courses yet. Create your first one.</p>
      ) : (
        <div className="divide-y rounded-lg border">
          {courses.map((c) => (
            <Link
              key={c.id}
              href={`/instructor/courses/${c.id}`}
              className="flex items-center justify-between gap-4 p-4 hover:bg-muted/50"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{c.title}</p>
                <p className="text-sm text-muted-foreground">
                  {c.modules.length} modules · {c.lessonCount} lessons · {c.studentCount} students
                </p>
              </div>
              <Badge variant={c.published ? "default" : "secondary"}>
                {c.published ? "Published" : "Draft"}
              </Badge>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
