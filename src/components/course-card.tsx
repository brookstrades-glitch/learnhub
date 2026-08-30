import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Course, Profile } from "@/db";

export function CourseCard({ course }: { course: Course & { instructor?: Profile | null } }) {
  return (
    <Link href={`/courses/${course.slug}`} className="block">
      <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
        {course.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={course.coverImageUrl} alt="" className="aspect-video w-full object-cover" />
        ) : (
          <div className="aspect-video w-full bg-muted" />
        )}
        <CardHeader>
          <CardTitle className="line-clamp-2">{course.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="line-clamp-3 text-sm text-muted-foreground">{course.description}</p>
          {course.instructor && (
            <p className="mt-3 text-xs text-muted-foreground">
              By {course.instructor.fullName || course.instructor.email}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
