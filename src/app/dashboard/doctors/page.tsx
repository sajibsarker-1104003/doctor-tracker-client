// src/app/dashboard/doctors/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useDoctors, useDeleteDoctor } from "@/features/doctors/use-doctors";
import { Modal } from "@/components/ui/modal";
import { DoctorForm } from "@/features/doctors/doctor-form";
import { useConfirm } from "@/components/ui/confirm-dialog";
import type { Doctor } from "@/lib/types";

const LIMIT = 10;

/* ---------- Icons ---------- */

type IconProps = { className?: string };
const ico = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const SearchIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...ico}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);
const PlusIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...ico} strokeWidth={2.2}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const UsersIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...ico}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
    <path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.5a6.5 6.5 0 0 1 3.5 5.5" />
  </svg>
);
const EditIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...ico}>
    <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4Z" />
    <path d="m13.5 6.5 4 4" />
  </svg>
);
const TrashIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...ico}>
    <path d="M4 7h16M10 11v6M14 11v6" />
    <path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
  </svg>
);
const BuildingIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...ico}>
    <path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M16 10h2a2 2 0 0 1 2 2v9M2 21h20" />
    <path d="M8 8h4M8 12h4M8 16h4" />
  </svg>
);
const ChevronIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...ico} strokeWidth={2.2}>
    <path d="m9 6 6 6-6 6" />
  </svg>
);
const StethoscopeIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...ico}>
    <path d="M6 3v6a4 4 0 0 0 8 0V3" />
    <path d="M10 13v1a5 5 0 0 0 10 0v-2" />
    <circle cx="20" cy="10" r="2" />
  </svg>
);

/* ---------- Helpers ---------- */

const AVATAR_TONES = [
  "from-teal-500 to-teal-700",
  "from-cyan-500 to-sky-600",
  "from-emerald-500 to-emerald-700",
  "from-indigo-500 to-violet-600",
  "from-rose-500 to-pink-600",
];

function initials(name: string) {
  const parts = name.replace(/^dr\.?\s+/i, "").trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "D";
}

function tone(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % 997;
  return AVATAR_TONES[h % AVATAR_TONES.length];
}

function Avatar({ name }: { name: string }) {
  return (
    <span
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-sm font-semibold text-white shadow-sm ${tone(name)}`}
    >
      {initials(name)}
    </span>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700 ring-1 ring-inset ring-teal-600/15">
      {children}
    </span>
  );
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-slate-200/70 ${className}`} />;
}

const actionBase =
  "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition focus:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50";

/* ---------- Page ---------- */

export default function DoctorsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  const { data, isLoading } = useDoctors({ page, limit: LIMIT, search });
  const deleteMutation = useDeleteDoctor();
  const { ask, dialog } = useConfirm();

  const rows: Doctor[] = data?.data ?? [];
  const hasNext = rows.length === LIMIT;
  const deletingId = deleteMutation.isPending
    ? (deleteMutation.variables as string)
    : null;

  const handleDelete = (doctor: Doctor) => {
    ask({
      title: "Delete this doctor?",
      itemName: doctor.name,
      description:
        "All their patients will also be deleted. Their record will be permanently removed. This can't be undone.",
      confirmLabel: "Delete doctor",
      tone: "danger",
      onConfirm: () => deleteMutation.mutateAsync(doctor.id),
    });
  };

  const openAdd = () => {
    setSelectedDoctor(null);
    setIsModalOpen(true);
  };

  const openEdit = (d: Doctor) => {
    setSelectedDoctor(d);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Confirm Dialog */}
      {dialog}

      {/* Header */}
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-teal-700">
            Care team
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Doctors
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage physicians, their specializations and affiliated hospitals.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative sm:w-72">
            <input
              type="search"
              placeholder="Search doctors…"
              aria-label="Search doctors"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="peer w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/15"
            />
            <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition peer-focus:text-teal-600" />
          </div>
          <button
            onClick={openAdd}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-700 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-600/25 transition hover:from-teal-700 hover:to-cyan-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-500/40 active:scale-[0.98]"
          >
            <PlusIcon className="h-4 w-4" />
            Add Doctor
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        {/* Desktop / tablet table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-6 py-3.5">Doctor</th>
                <th className="px-6 py-3.5">Specialization</th>
                <th className="px-6 py-3.5">Hospital</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-xl" />
                        <Skeleton className="h-4 w-36" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-6 w-28 rounded-full" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-40" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="ml-auto h-8 w-48" />
                    </td>
                  </tr>
                ))}

              {rows.map((d) => (
                <tr key={d.id} className="transition hover:bg-teal-50/40">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={d.name} />
                      <span className="font-medium text-slate-900">{d.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge>{d.specialization}</Badge>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{d.hospital}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/dashboard/doctors/${d.id}`}
                        className={`${actionBase} text-teal-700 hover:bg-teal-50 focus-visible:ring-teal-500`}
                      >
                        <UsersIcon className="h-4 w-4" /> Patients
                      </Link>
                      <button
                        onClick={() => openEdit(d)}
                        className={`${actionBase} text-amber-700 hover:bg-amber-50 focus-visible:ring-amber-500`}
                      >
                        <EditIcon className="h-4 w-4" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(d)}
                        disabled={deletingId === d.id}
                        className={`${actionBase} text-red-600 hover:bg-red-50 focus-visible:ring-red-500`}
                      >
                        <TrashIcon className="h-4 w-4" />
                        {deletingId === d.id ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <ul className="divide-y divide-slate-100 md:hidden">
          {isLoading &&
            Array.from({ length: 4 }).map((_, i) => (
              <li key={i} className="space-y-3 p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-11 w-11 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-8 w-full" />
              </li>
            ))}

          {rows.map((d) => (
            <li key={d.id} className="p-4">
              <div className="flex items-start gap-3">
                <Avatar name={d.name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-slate-900">{d.name}</p>
                  <div className="mt-1.5">
                    <Badge>{d.specialization}</Badge>
                  </div>
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
                    <BuildingIcon className="h-4 w-4 shrink-0 text-slate-400" />
                    <span className="truncate">{d.hospital}</span>
                  </p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <Link
                  href={`/dashboard/doctors/${d.id}`}
                  className={`${actionBase} justify-center bg-teal-50 py-2.5 text-teal-700 focus-visible:ring-teal-500`}
                >
                  <UsersIcon className="h-4 w-4" /> Patients
                </Link>
                <button
                  onClick={() => openEdit(d)}
                  className={`${actionBase} justify-center bg-amber-50 py-2.5 text-amber-700 focus-visible:ring-amber-500`}
                >
                  <EditIcon className="h-4 w-4" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(d)}
                  disabled={deletingId === d.id}
                  className={`${actionBase} justify-center bg-red-50 py-2.5 text-red-600 focus-visible:ring-red-500`}
                >
                  <TrashIcon className="h-4 w-4" />
                  {deletingId === d.id ? "…" : "Delete"}
                </button>
              </div>
            </li>
          ))}
        </ul>

        {/* Empty state */}
        {!isLoading && rows.length === 0 && (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
              <StethoscopeIcon className="h-7 w-7" />
            </span>
            <h3 className="mt-4 text-base font-semibold text-slate-900">
              {search ? "No doctors match your search" : "No doctors yet"}
            </h3>
            <p className="mt-1 max-w-xs text-sm text-slate-500">
              {search
                ? "Try a different name, specialization or hospital."
                : "Add your first doctor to start building the care team."}
            </p>
            {!search && (
              <button
                onClick={openAdd}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
              >
                <PlusIcon className="h-4 w-4" /> Add Doctor
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {(page > 1 || hasNext) && (
          <nav
            aria-label="Pagination"
            className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-4 py-3 sm:px-6"
          >
            <p className="text-sm text-slate-500">
              Page <span className="font-semibold text-slate-900">{page}</span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronIcon className="h-4 w-4 rotate-180" /> Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!hasNext}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next <ChevronIcon className="h-4 w-4" />
              </button>
            </div>
          </nav>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedDoctor ? "Edit Doctor" : "Add New Doctor"}
      >
        <DoctorForm
          initialData={selectedDoctor || undefined}
          onSuccess={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}