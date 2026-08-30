import { notFound, redirect } from "next/navigation";
import { getCourseBySlug, isEnrolled, getCompletedLessonIds } from "@/lib/queries";
import { requireProfile } from "@/lib/auth";

export default async function LearnIndex({ params }: PageProps<"/learn/[slug]">) {
  const { slug } = await params;
  const profile = await requireProfile();
  const course = await getCourseBySlug(slug);
  if (!course) notFound();
  if (!(await isEnrolled(profile.id, course.id))) redirect(`/courses/${slug}`);

  const all = course.modules.flatMap((m) => m.lessons);
  if (all.length === 0) redirect(`/courses/${slug}`);

  const done = await getCompletedLessonIds(profile.id, all.map((l) => l.id));
  const next = all.find((l) => !done.has(l.id)) ?? all[0];
  redirect(`/learn/${slug}/${next.id}`);
}
