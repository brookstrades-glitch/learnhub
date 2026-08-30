import { getPublishedCourses } from "@/lib/queries";
import { CourseCard } from "@/components/course-card";

export const metadata = { title: "Courses" };

export default async function CoursesPage() {
  const courses = await getPublishedCourses();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold">All courses</h1>
      {courses.length === 0 ? (
        <p className="text-muted-foreground">No courses published yet. Check back soon.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      )}
    </div>
  );
}
