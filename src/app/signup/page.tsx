import { AuthForm } from "@/components/auth-form";

export const metadata = { title: "Sign up" };

export default function SignupPage() {
  return (
    <div className="px-4">
      <AuthForm mode="signup" />
    </div>
  );
}
