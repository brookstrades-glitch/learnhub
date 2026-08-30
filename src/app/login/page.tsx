import { AuthForm } from "@/components/auth-form";

export const metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next, error } = await searchParams;
  return (
    <div className="px-4">
      {error && (
        <p className="mx-auto mt-6 max-w-sm text-center text-sm text-destructive">
          {String(error)}
        </p>
      )}
      <AuthForm mode="login" next={typeof next === "string" ? next : undefined} />
    </div>
  );
}
