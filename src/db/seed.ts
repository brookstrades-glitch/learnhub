import "./load-env";
import { eq } from "drizzle-orm";
import { db, profiles, courses, modules, lessons } from "./index";

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) throw new Error("Set ADMIN_EMAIL in .env.local first");

  const admin = await db.query.profiles.findFirst({ where: eq(profiles.email, adminEmail) });
  if (!admin) {
    throw new Error(
      `No profile for ${adminEmail}. Sign up in the app with that email once, then run the seed again.`,
    );
  }

  const existing = await db.query.courses.findFirst({ where: eq(courses.slug, "getting-started") });
  if (existing) {
    console.log("Sample course already exists, skipping.");
    return;
  }

  const [course] = await db
    .insert(courses)
    .values({
      slug: "getting-started",
      title: "Getting Started with LearnHub",
      description:
        "A short sample course that shows how modules, lessons, video, and progress tracking work. Edit or delete it from the Teach page.",
      instructorId: admin.id,
      published: true,
    })
    .returning();

  const [m1] = await db
    .insert(modules)
    .values({ courseId: course.id, title: "Welcome", position: 0 })
    .returning();
  const [m2] = await db
    .insert(modules)
    .values({ courseId: course.id, title: "Building your first course", position: 1 })
    .returning();

  await db.insert(lessons).values([
    {
      moduleId: m1.id,
      title: "How this platform works",
      position: 0,
      content: `# Welcome

This is a **sample lesson**. Lessons are written in Markdown, so you can use:

- Headings, lists, and links
- \`inline code\` and code blocks
- Bold and _italic_ text

Click **Mark complete** at the bottom when you're done.`,
    },
    {
      moduleId: m1.id,
      title: "Adding a video",
      position: 1,
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      content: `Paste a YouTube link into the **Video URL** field and it embeds automatically. Direct \`.mp4\` links work too.`,
    },
    {
      moduleId: m2.id,
      title: "Creating courses as an instructor",
      position: 0,
      content: `1. Go to **Teach** in the top menu.
2. Click **New course**, give it a title and description.
3. Add modules, then add lessons inside each module.
4. Click **Publish** when it's ready for students.`,
    },
    {
      moduleId: m2.id,
      title: "Managing users as an admin",
      position: 1,
      content: `Admins can promote students to **instructor** (or admin) from the **Admin** page. New sign-ups are students by default.`,
    },
  ]);

  console.log(`Seeded sample course: /courses/${course.slug}`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
