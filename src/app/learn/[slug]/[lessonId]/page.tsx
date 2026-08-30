import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, ChevronLeft, ChevronRight, Circle, CircleCheck } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { getCourseBySlug, isEnrolled, getCompletedLessonIds } from "@/lib/queries";
import { requireProfile } from "@/lib/auth";
import { markLessonComplete, markLessonIncomplete } from "@/actions/courses";
import { cn, youtubeEmbed } from "@/lib/utils";
import { ProgressBar } from "@/components/progress-bar";

export default async function LessonPage({ params }: PageProps<"/learn/[slug]/[lessonId]">) {
  const { slug, lessonId } = await params;
  const profile = await requireProfile();
  const course = await getCourseBySlug(slug);
  if (!course) notFound();
  if (!(await isEnrolled(profile.id, course.id))) redirect(`/courses/${slug}`);

  const all = course.modules.flatMap((m) => m.lessons);
  const idx = all.findIndex((l) => l.id === lessonId);
  if (idx < 0) notFound();
  const lesson = all[idx];
  const prev = all[idx - 1];
  const next = all[idx + 1];

  const done = await getCompletedLessonIds(profile.id, all.map((l) => l.id));
  const percent = all.length ? Math.round((done.size / all.length) * 100) : 0;
  const isDone = done.has(lesson.id);
  const embed = youtubeEmbed(lesson.videoUrl);

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[280px_1fr]">
      <aside className="space-y-4 lg:sticky lg:top-6 lg:h-fit">
        <div>
          <Link href={`/courses/${slug}`} className="text-sm font-semibold hover:underline">
            {course.title}
          </Link>
          <div className="mt-2">
            <ProgressBar value={percent} />
            <p className="mt-1 text-xs text-muted-foreground">{percent}% complete</p>
          </div>
        </div>
        <nav className="space-y-3 text-sm">
          {course.modules.map((m) => (
            <div key={m.id}>
              <p className="mb-1 font-medium">{m.title}</p>
              <ul className="space-y-0.5">
                {m.lessons.map((l) => (
                  <li key={l.id}>
                    <Link
                      href={`/learn/${slug}/${l.id}`}
                      className={cn(
                        "flex items-center gap-2 rounded px-2 py-1 hover:bg-muted",
                        l.id === lesson.id && "bg-muted font-medium",
                      )}
                    >
                      {done.has(l.id) ? (
                        <CircleCheck size={14} className="text-primary" aria-hidden />
                      ) : (
                        <Circle size={14} className="text-muted-foreground" aria-hidden />
                      )}
                      <span className="line-clamp-1">{l.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      <article className="min-w-0">
        <h1 className="text-2xl font-bold">{lesson.title}</h1>

        {embed ? (
          <div className="mt-4 aspect-video w-full overflow-hidden rounded-lg bg-black">
            <iframe
              src={embed}
              title={lesson.title}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : lesson.videoUrl ? (
          <video src={lesson.videoUrl} controls className="mt-4 aspect-video w-full rounded-lg bg-black" />
        ) : null}

        <div className="prose prose-neutral mt-6 max-w-none dark:prose-invert">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{lesson.content}</ReactMarkdown>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t pt-6">
          {prev ? (
            <Link href={`/learn/${slug}/${prev.id}`} className={buttonVariants({ variant: "outline" })}>
              <ChevronLeft size={16} aria-hidden />
              Previous
            </Link>
          ) : (
            <span />
          )}

          <form action={(isDone ? markLessonIncomplete : markLessonComplete).bind(null, lesson.id, slug)}>
            <Button type="submit" variant={isDone ? "secondary" : "default"}>
              <Check size={16} aria-hidden />
              {isDone ? "Completed" : "Mark complete"}
            </Button>
          </form>

          {next ? (
            <Link href={`/learn/${slug}/${next.id}`} className={buttonVariants({ variant: "outline" })}>
              Next
              <ChevronRight size={16} aria-hidden />
            </Link>
          ) : (
            <Link href="/dashboard" className={buttonVariants({ variant: "outline" })}>
              Back to dashboard
            </Link>
          )}
        </div>
      </article>
    </div>
  );
}
