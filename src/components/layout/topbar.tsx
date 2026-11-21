// src/components/layout/topbar.tsx
"use client";

import { useState } from "react";
import { useAuth } from "@/features/auth/auth-provider";
import { Sidebar } from "./sidebar";

export function Topbar() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-card/95 backdrop-blur px-3 sm:px-4 md:px-6">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileOpen(true)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted md:hidden"
            aria-label="Open menu"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <p className="text-sm font-semibold md:hidden">Doctor Tracker</p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {user && (
            <span className="hidden text-sm sm:inline">
              {user.name} <span className="text-muted-foreground text-xs">({user.role})</span>
            </span>
          )}
          <button
            onClick={logout}
            className="rounded-lg border px-2.5 py-1.5 text-sm hover:bg-muted"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-card shadow-2xl">
            <div className="flex h-14 items-center justify-between border-b px-4">
              <p className="font-semibold">Menu</p>
              <button
                onClick={() => setMobileOpen(false)}
                className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-muted"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <Sidebar onLinkClick={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}