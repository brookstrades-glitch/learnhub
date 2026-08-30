"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createCourse, updateCourse, type ActionState } from "@/actions/courses";
import type { Course } from "@/db";

export function CourseForm({ course }: { course?: Course }) {
  const action = course ? updateCourse.bind(null, course.id) : createCourse;
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required defaultValue={course?.title} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" rows={5} defaultValue={course?.description} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="coverImageUrl">Cover image URL (optional)</Label>
        <Input
          id="coverImageUrl"
          name="coverImageUrl"
          type="url"
          placeholder="https://…"
          defaultValue={course?.coverImageUrl ?? ""}
        />
      </div>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : course ? "Save changes" : "Create course"}
      </Button>
    </form>
  );
}
