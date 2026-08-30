import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { getPublishedCourses } from "@/lib/queries";
import { CourseCard } from "@/components/course-card";

export default async function HomePage() {
  const courses = (await getPublishedCourses()).slice(0, 6);

  return (
    <div className="mx-auto max-w-6xl px-4">
      <section className="py-20 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Learn at your own pace.</h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
          Short, focused courses. Track your progress. Pick up right where you left off.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/courses" className={buttonVariants({ size: "lg" })}>
            Browse courses
            <ArrowRight size={16} aria-hidden />
          </Link>
          <Link href="/signup" className={buttonVariants({ size: "lg", variant: "outline" })}>
            Create an account
          </Link>
        </div>
      </section>

      {courses.length > 0 && (
        <section className="pb-20">
          <h2 className="mb-6 text-2xl font-semibold">Latest courses</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
