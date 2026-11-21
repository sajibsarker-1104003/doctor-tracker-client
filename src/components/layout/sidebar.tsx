// src/components/layout/sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/doctors", label: "Doctors" },
  { href: "/dashboard/patients", label: "Patients" },
];

export function Sidebar({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-card p-4">
      <div className="mb-8">
        <p className="text-lg font-bold tracking-tight">Doctor Tracker</p>
        <p className="text-xs text-muted-foreground mt-0.5">Clinical Dashboard</p>
      </div>

      <nav className="space-y-1.5">
        {links.map((l) => {
          const active =
            l.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(l.href);

          return (
            <Link
              key={l.href}
              href={l.href}
              onClick={onLinkClick}
              className={`flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}