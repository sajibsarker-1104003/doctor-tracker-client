"use client";

import { useState } from "react";
import Link from "next/link";
import { useDoctors, useDoctorFilterOptions, useDeleteDoctor } from "@/features/doctors/use-doctors";
import { Modal } from "@/components/ui/modal";
import { DoctorForm } from "@/features/doctors/doctor-form";
import type { Doctor } from "@/lib/types";

export default function DoctorsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  const { data, isLoading } = useDoctors({ page, limit: 10, search });
  const deleteMutation = useDeleteDoctor();

  const handleDelete = (id: string) => {
    if (confirm("Delete this doctor? All their patients will also be deleted.")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Doctors</h1>
        <div className="flex gap-2">
          <input
            placeholder="Search doctors…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="rounded-md border px-3 py-2 text-sm"
          />
          <button onClick={() => { setSelectedDoctor(null); setIsModalOpen(true); }} className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm">
            + Add Doctor
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Specialization</th>
              <th className="p-3 text-left">Hospital</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={4} className="p-6 text-center">Loading…</td></tr>}
            {data?.data.map((d) => (
              <tr key={d.id} className="border-t">
                <td className="p-3 font-medium">{d.name}</td>
                <td className="p-3">{d.specialization}</td>
                <td className="p-3">{d.hospital}</td>
                <td className="p-3 text-right space-x-3">
                  <Link href={`/dashboard/doctors/${d.id}`} className="text-blue-600 hover:underline">Patients</Link>
                  <button onClick={() => { setSelectedDoctor(d); setIsModalOpen(true); }} className="text-amber-600 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(d.id)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination controls same as before... */}
      
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedDoctor ? "Edit Doctor" : "Add New Doctor"}>
        <DoctorForm initialData={selectedDoctor || undefined} onSuccess={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
}