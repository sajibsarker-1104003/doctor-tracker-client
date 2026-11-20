// src/components/layout/topbar.tsx
"use client";

import { useAuth } from "@/features/auth/auth-provider";

export function Topbar() {
  const { user, logout } = useAuth();
  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-6">
      <div />
      <div className="flex items-center gap-3">
        {user && (
          <span className="text-sm">
            {user.name} <span className="text-muted-foreground">({user.role})</span>
          </span>
        )}
        <button
          onClick={logout}
          className="rounded-md border px-3 py-1 text-sm hover:bg-muted"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
