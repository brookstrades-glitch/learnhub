import Link from "next/link";
import { GraduationCap, LogOut } from "lucide-react";
import { getCurrentProfile, hasRole } from "@/lib/auth";
import { signOut } from "@/actions/auth";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export async function Nav() {
  const profile = await getCurrentProfile();

  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <GraduationCap size={20} aria-hidden />
            LearnHub
          </Link>
          <nav className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/courses" className="hover:text-foreground">
              Courses
            </Link>
            {profile && (
              <Link href="/dashboard" className="hover:text-foreground">
                My learning
              </Link>
            )}
            {profile && hasRole(profile, "instructor") && (
              <Link href="/instructor" className="hover:text-foreground">
                Teach
              </Link>
            )}
            {profile && hasRole(profile, "admin") && (
              <Link href="/admin" className="hover:text-foreground">
                Admin
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {profile ? (
            <>
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {profile.fullName || profile.email}
              </span>
              <form action={signOut}>
                <Button variant="ghost" size="sm" type="submit" aria-label="Sign out">
                  <LogOut size={16} aria-hidden />
                  <span className="hidden sm:inline">Sign out</span>
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
                Log in
              </Link>
              <Link href="/signup" className={cn(buttonVariants({ size: "sm" }))}>
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
