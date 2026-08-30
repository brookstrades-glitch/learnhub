"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { signIn, signUp, signInWithGoogle, type AuthState } from "@/actions/auth";

export function AuthForm({ mode, next }: { mode: "login" | "signup"; next?: string }) {
  const action = mode === "login" ? signIn : signUp;
  const [state, formAction, pending] = useActionState<AuthState, FormData>(action, undefined);

  return (
    <Card className="mx-auto mt-16 w-full max-w-sm">
      <CardHeader>
        <CardTitle>{mode === "login" ? "Log in" : "Create your account"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form action={formAction} className="space-y-3">
          {next && <input type="hidden" name="next" value={next} />}
          {mode === "signup" && (
            <div className="space-y-1">
              <Label htmlFor="fullName">Name</Label>
              <Input id="fullName" name="fullName" required autoComplete="name" />
            </div>
          )}
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </div>
          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
          {state?.message && <p className="text-sm text-muted-foreground">{state.message}</p>}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Please wait…" : mode === "login" ? "Log in" : "Sign up"}
          </Button>
        </form>

        <form action={signInWithGoogle}>
          <Button type="submit" variant="outline" className="w-full">
            Continue with Google
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {mode === "login" ? (
            <>
              No account?{" "}
              <Link href="/signup" className="underline">
                Sign up
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link href="/login" className="underline">
                Log in
              </Link>
            </>
          )}
        </p>
      </CardContent>
    </Card>
  );
}
