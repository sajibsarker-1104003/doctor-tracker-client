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

  // Redirect if truly logged out, but never block the UI from rendering.
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        const hasCookie = document.cookie.includes("refreshToken") || document.cookie.includes("session");
        if (!hasCookie) {
          window.location.href = "/login";
        }
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  return (
    <div className="flex min-h-screen">
      {/* Suspense is required by Next.js 16 to allow usePathname in Sidebar during build */}
      <Suspense fallback={<div className="w-56 border-r bg-card p-4" />}>
        <Sidebar />
      </Suspense>
      <div className="flex flex-1 flex-col">
        <Topbar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}