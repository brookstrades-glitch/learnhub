import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireProfile } from "@/lib/auth";
import { getDashboardCourses } from "@/lib/queries";
import { ProgressBar } from "@/components/progress-bar";

export const metadata = { title: "My learning" };

export default async function DashboardPage({ searchParams }: PageProps<"/dashboard">) {
  const profile = await requireProfile();
  const { error } = await searchParams;
  const items = await getDashboardCourses(profile.id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">Welcome back{profile.fullName ? `, ${profile.fullName.split(" ")[0]}` : ""}</h1>
      {error === "forbidden" && (
        <p className="mt-2 text-sm text-destructive">You don&apos;t have access to that page.</p>
      )}

      {items.length === 0 ? (
        <div className="mt-10 rounded-lg border p-10 text-center">
          <p className="text-muted-foreground">You haven&apos;t enrolled in any courses yet.</p>
          <Link href="/courses" className={buttonVariants({ className: "mt-4" })}>
            Browse courses
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(({ course, total, completed, percent }) => (
            <Card key={course.id}>
              <CardHeader>
                <CardTitle className="line-clamp-2">{course.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ProgressBar value={percent} />
                <p className="text-sm text-muted-foreground">
                  {completed} of {total} lessons · {percent}%
                </p>
                <Link href={`/learn/${course.slug}`} className={buttonVariants({ size: "sm" })}>
                  {percent === 100 ? "Review" : percent === 0 ? "Start" : "Continue"}
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
