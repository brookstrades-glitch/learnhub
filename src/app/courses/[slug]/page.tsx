import Link from "next/link";
import { notFound } from "next/navigation";
import { PlayCircle } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { getCourseBySlug, isEnrolled } from "@/lib/queries";
import { getCurrentProfile } from "@/lib/auth";
import { enroll } from "@/actions/courses";

export default async function CoursePage({ params }: PageProps<"/courses/[slug]">) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  const profile = await getCurrentProfile();

  if (!course) notFound();
  const isOwner = profile && (profile.id === course.instructorId || profile.role === "admin");
  if (!course.published && !isOwner) notFound();

  const enrolled = profile ? await isEnrolled(profile.id, course.id) : false;
  const lessonCount = course.modules.reduce((n, m) => n + m.lessons.length, 0);

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 lg:grid-cols-[2fr_1fr]">
      <div>
        <h1 className="text-3xl font-bold">{course.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          By {course.instructor.fullName || course.instructor.email} · {course.modules.length}{" "}
          modules · {lessonCount} lessons
        </p>
        <p className="mt-6 whitespace-pre-line text-base">{course.description}</p>

        <h2 className="mt-10 mb-4 text-xl font-semibold">What you&apos;ll learn</h2>
        <ol className="space-y-4">
          {course.modules.map((m, i) => (
            <li key={m.id}>
              <p className="font-medium">
                {i + 1}. {m.title}
              </p>
              <ul className="mt-1 ml-5 space-y-1 text-sm text-muted-foreground">
                {m.lessons.map((l) => (
                  <li key={l.id} className="flex items-center gap-2">
                    <PlayCircle size={14} aria-hidden />
                    {l.title}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>

      <aside className="h-fit rounded-lg border p-6 lg:sticky lg:top-6">
        {course.coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={course.coverImageUrl} alt="" className="mb-4 aspect-video w-full rounded object-cover" />
        )}
        {!profile ? (
          <Link
            href={`/login?next=/courses/${course.slug}`}
            className={buttonVariants({ className: "w-full" })}
          >
            Log in to enroll
          </Link>
        ) : enrolled ? (
          <Link href={`/learn/${course.slug}`} className={buttonVariants({ className: "w-full" })}>
            Continue learning
          </Link>
        ) : (
          <form action={enroll.bind(null, course.id)}>
            <Button type="submit" className="w-full" disabled={!course.published}>
              Enroll for free
            </Button>
          </form>
        )}
        {isOwner && (
          <Link
            href={`/instructor/courses/${course.id}`}
            className={buttonVariants({ variant: "outline", className: "mt-2 w-full" })}
          >
            Edit course
          </Link>
        )}
      </aside>
    </div>
  );
}
