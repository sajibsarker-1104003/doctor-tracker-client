"use client";

import { useState } from "react";
import { useCreateDoctor, useUpdateDoctor } from "./use-doctors";
import type { Doctor } from "@/lib/types";

type Props = {
  initialData?: Doctor;
  onSuccess: () => void;
  onCancel?: () => void;
};

type Values = {
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
};
type Errors = Partial<Record<keyof Values, string>>;

const SPECIALIZATIONS = [
  "Cardiology",
  "Dermatology",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
  "Psychiatry",
  "Radiology",
  "General Surgery",
  "Oncology",
  "Gynecology",
];

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
const UserIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...ico}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </svg>
);
const StethoscopeIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...ico}>
    <path d="M6 3v6a4 4 0 0 0 8 0V3" />
    <path d="M10 13v1a5 5 0 0 0 10 0v-2" />
    <circle cx="20" cy="10" r="2" />
  </svg>
);
const BuildingIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...ico}>
    <path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M16 10h2a2 2 0 0 1 2 2v9M2 21h20" />
    <path d="M8 8h4M8 12h4M8 16h4" />
  </svg>
);
const PhoneIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...ico}>
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
  </svg>
);
const MailIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...ico}>
    <rect x="3" y="5" width="18" height="14" rx="3" />
    <path d="m4 8 8 6 8-6" />
  </svg>
);
const AlertIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...ico}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5v5M12 16.5h.01" />
  </svg>
);
const Spinner = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 animate-spin" aria-hidden>
    <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeOpacity=".25" strokeWidth="3" />
    <path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

/* ---------- Field ---------- */

function Field({
  id,
  label,
  icon,
  error,
  hint,
  className = "",
  children,
}: {
  id: string;
  label: string;
  icon: React.ReactNode;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative">
        {children}
        <span className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition peer-focus:text-teal-600">
          {icon}
        </span>
      </div>
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600">
          <AlertIcon className="h-3.5 w-3.5 shrink-0" /> {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-slate-400">{hint}</p>
      )}
    </div>
  );
}

const inputClass = (hasError: boolean) =>
  "peer block w-full rounded-xl border bg-slate-50/60 py-3 pl-11 pr-4 text-[15px] text-slate-900 placeholder:text-slate-400 " +
  "transition focus:bg-white focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 " +
  (hasError
    ? "border-red-300 focus:border-red-500 focus:ring-red-500/15"
    : "border-slate-200 focus:border-teal-500 focus:ring-teal-500/15");

/* ---------- Form ---------- */

export function DoctorForm({ initialData, onSuccess, onCancel }: Props) {
  const isEditing = !!initialData;
  const createMutation = useCreateDoctor();
  const updateMutation = useUpdateDoctor();

  const [form, setForm] = useState<Values>({
    name: initialData?.name ?? "",
    specialization: initialData?.specialization ?? "",
    hospital: initialData?.hospital ?? "",
    phone: initialData?.phone ?? "",
    email: initialData?.email ?? "",
  });
  const [errors, setErrors] = useState<Errors>({});

  // If an existing doctor has a value outside the list, keep it selectable.
  const specializationOptions =
    form.specialization && !SPECIALIZATIONS.includes(form.specialization)
      ? [form.specialization, ...SPECIALIZATIONS]
      : SPECIALIZATIONS;

  const isPending = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error || updateMutation.error;

  const set = (key: keyof Values) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
  };

  function validate(): Errors {
    const er: Errors = {};
    if (form.name.trim().length < 2) er.name = "Enter the doctor's full name.";
    if (!form.specialization.trim()) er.specialization = "Select a specialization.";
    if (!form.hospital.trim()) er.hospital = "Enter the hospital or clinic.";
    if (form.phone.replace(/\D/g, "").length < 6) er.phone = "Enter a valid phone number.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) er.email = "Enter a valid email address.";
    return er;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const er = validate();
    setErrors(er);
    if (Object.keys(er).length) return;

    const data = {
      name: form.name.trim(),
      specialization: form.specialization.trim(),
      hospital: form.hospital.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
    };

    if (isEditing) {
      updateMutation.mutate({ id: initialData.id, data }, { onSuccess });
    } else {
      createMutation.mutate(data, { onSuccess });
    }
  };

  const err = (k: keyof Values) => ({
    "aria-invalid": !!errors[k],
    "aria-describedby": errors[k] ? `doctor-${k}-error` : undefined,
  });

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <Field id="doctor-name" label="Full name" icon={<UserIcon className="h-5 w-5" />} error={errors.name}>
        <input
          id="doctor-name"
          required
          type="text"
          autoComplete="off"
          placeholder="Dr. Amelia Rahman"
          value={form.name}
          onChange={set("name")}
          disabled={isPending}
          className={inputClass(!!errors.name)}
          {...err("name")}
        />
      </Field>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field
          id="doctor-specialization"
          label="Specialization"
          icon={<StethoscopeIcon className="h-5 w-5" />}
          error={errors.specialization}
        >
          <select
            id="doctor-specialization"
            required
            value={form.specialization}
            onChange={(e) => {
              setForm((f) => ({ ...f, specialization: e.target.value }));
              if (errors.specialization) setErrors((er) => ({ ...er, specialization: undefined }));
            }}
            disabled={isPending}
            className={`${inputClass(!!errors.specialization)} cursor-pointer appearance-none pr-10 ${
              form.specialization ? "" : "text-slate-400"
            }`}
            {...err("specialization")}
          >
            <option value="" disabled>
              Select specialization
            </option>
            {specializationOptions.map((s) => (
              <option key={s} value={s} className="text-slate-900">
                {s}
              </option>
            ))}
          </select>
          <svg
            viewBox="0 0 24 24"
            className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </Field>

        <Field
          id="doctor-hospital"
          label="Hospital / clinic"
          icon={<BuildingIcon className="h-5 w-5" />}
          error={errors.hospital}
        >
          <input
            id="doctor-hospital"
            required
            type="text"
            autoComplete="off"
            placeholder="City General Hospital"
            value={form.hospital}
            onChange={set("hospital")}
            disabled={isPending}
            className={inputClass(!!errors.hospital)}
            {...err("hospital")}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field id="doctor-phone" label="Phone" icon={<PhoneIcon className="h-5 w-5" />} error={errors.phone}>
          <input
            id="doctor-phone"
            required
            type="tel"
            inputMode="tel"
            autoComplete="off"
            placeholder="+880 1XXX-XXXXXX"
            value={form.phone}
            onChange={set("phone")}
            disabled={isPending}
            className={inputClass(!!errors.phone)}
            {...err("phone")}
          />
        </Field>

        <Field id="doctor-email" label="Email" icon={<MailIcon className="h-5 w-5" />} error={errors.email}>
          <input
            id="doctor-email"
            required
            type="email"
            inputMode="email"
            autoComplete="off"
            placeholder="doctor@hospital.org"
            value={form.email}
            onChange={set("email")}
            disabled={isPending}
            className={inputClass(!!errors.email)}
            {...err("email")}
          />
        </Field>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <AlertIcon className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{error.message}</span>
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-300/50 disabled:opacity-60"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-600/25 transition hover:from-teal-700 hover:to-cyan-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-500/40 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? (
            <>
              <Spinner /> Saving…
            </>
          ) : isEditing ? (
            "Update Doctor"
          ) : (
            "Create Doctor"
          )}
        </button>
      </div>
    </form>
  );
}