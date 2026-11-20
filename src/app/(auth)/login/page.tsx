// src/app/(auth)/login/page.tsx
import { LoginForm } from "@/features/auth/login-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-muted">
      <div className="rounded-xl border bg-card p-8 shadow-sm">
        <h1 className="mb-1 text-2xl font-semibold">Doctor Tracker</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Sign in to manage doctors and patients.
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
