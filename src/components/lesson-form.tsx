"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateLesson, type ActionState } from "@/actions/courses";
import type { Lesson } from "@/db";

export function LessonForm({ courseId, lesson }: { courseId: string; lesson: Lesson }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    updateLesson.bind(null, courseId, lesson.id),
    undefined,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required defaultValue={lesson.title} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="videoUrl">Video URL (optional)</Label>
        <Input
          id="videoUrl"
          name="videoUrl"
          type="url"
          placeholder="YouTube link or direct .mp4 URL"
          defaultValue={lesson.videoUrl ?? ""}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="content">Lesson content (Markdown)</Label>
        <Textarea
          id="content"
          name="content"
          rows={18}
          className="font-mono text-sm"
          defaultValue={lesson.content}
          placeholder={"# Heading\n\nWrite your lesson here. **Bold**, _italic_, lists, links, and code all work."}
        />
      </div>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save lesson"}
      </Button>
    </form>
  );
}
