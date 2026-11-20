"use client";

import { useState } from "react";
import { usePatients, useDeletePatient } from "@/features/patients/use-patients";
import { Modal } from "@/components/ui/modal";
import { PatientForm } from "@/features/patients/patient-form";
import type { Patient } from "@/lib/types";

export default function PatientsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const { data, isLoading } = usePatients({ page, limit: 10, search });
  const deleteMutation = useDeletePatient();

  const handleDelete = (id: string) => {
    if (confirm("Delete this patient?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">All Patients</h1>
        <div className="flex gap-2">
          <input
            placeholder="Search patients…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="rounded-md border px-3 py-2 text-sm"
          />
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm"
          >
            + Add Patient
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Condition</th>
              <th className="p-3 text-left">Doctor</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={4} className="p-6 text-center">
                  Loading…
                </td>
              </tr>
            )}
            {data?.data.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3 font-medium">{p.name}</td>
                <td className="p-3">{p.condition}</td>
                <td className="p-3 text-muted-foreground">
                  {p.doctor?.name ?? "—"}
                </td>
                <td className="p-3 text-right space-x-3">
                  <button
                    onClick={() => setSelectedPatient(p)}
                    className="text-amber-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Page {data?.meta.page ?? 1} of {data?.meta.totalPages ?? 1}
        </span>
        <div className="flex gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-md border px-3 py-1 text-sm disabled:opacity-40"
          >
            Prev
          </button>
          <button
            disabled={!!data && page >= data.meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-md border px-3 py-1 text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add New Patient"
      >
        <PatientForm onSuccess={() => setIsCreateModalOpen(false)} />
      </Modal>

      <Modal
        isOpen={!!selectedPatient}
        onClose={() => setSelectedPatient(null)}
        title="Edit Patient"
      >
        {selectedPatient && (
          <PatientForm
            initialData={selectedPatient}
            onSuccess={() => setSelectedPatient(null)}
          />
        )}
      </Modal>
    </div>
  );
}