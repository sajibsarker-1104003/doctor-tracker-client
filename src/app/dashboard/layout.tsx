// src/app/dashboard/layout.tsx
"use client";

import { Suspense, useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { useAuth } from "@/features/auth/auth-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        const hasCookie =
          document.cookie.includes("refreshToken") ||
          document.cookie.includes("session");
        if (!hasCookie) {
          window.location.href = "/login";
        }
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  return (
    <div className="flex min-h-screen bg-background overflow-x-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:block shrink-0">
        <Suspense fallback={<div className="h-full w-64 border-r bg-card p-4" />}>
          <Sidebar />
        </Suspense>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-x-hidden p-3 sm:p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}