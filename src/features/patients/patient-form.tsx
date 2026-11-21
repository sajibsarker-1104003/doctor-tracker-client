"use client";

import { useState } from "react";
import { useCreatePatient, useUpdatePatient } from "./use-patients";
import { useDoctors } from "@/features/doctors/use-doctors";
import type { Patient } from "@/lib/types";

type Gender = Patient["gender"];

type Props = {
  doctorId?: string;
  initialData?: Patient;
  onSuccess: () => void;
  onCancel?: () => void;
};

type Errors = Partial<Record<"doctor" | "name" | "age" | "condition" | "phone" | "email", string>>;

const GENDERS: { value: string; label: string }[] = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
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
const CakeIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...ico}>
    <rect x="4" y="11" width="16" height="9" rx="2" />
    <path d="M4 15c2 1.5 4 1.5 8 0s6-1.5 8 0M12 7v4M12 4v.01" />
  </svg>
);
const HeartPulseIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...ico}>
    <path d="M3 12h4l2-5 4 10 2-5h6" />
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
  optional,
  className = "",
  children,
}: {
  id: string;
  label: string;
  icon?: React.ReactNode;
  error?: string;
  optional?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 flex items-center justify-between text-sm font-medium text-slate-700">
        <span>{label}</span>
        {optional && <span className="text-xs font-normal text-slate-400">Optional</span>}
      </label>
      <div className="relative">
        {children}
        {icon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition peer-focus:text-teal-600">
            {icon}
          </span>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600">
          <AlertIcon className="h-3.5 w-3.5 shrink-0" /> {error}
        </p>
      )}
    </div>
  );
}

const inputClass = (hasError: boolean, withIcon = true) =>
  `peer block w-full rounded-xl border bg-slate-50/60 py-3 ${withIcon ? "pl-11" : "pl-4"} pr-4 text-[15px] text-slate-900 placeholder:text-slate-400 ` +
  "transition focus:bg-white focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 " +
  (hasError
    ? "border-red-300 focus:border-red-500 focus:ring-red-500/15"
    : "border-slate-200 focus:border-teal-500 focus:ring-teal-500/15");

const Chevron = () => (
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
);

/* ---------- Form ---------- */

export function PatientForm({ doctorId, initialData, onSuccess, onCancel }: Props) {
  const isEditing = !!initialData;
  const createMutation = useCreatePatient();
  const updateMutation = useUpdatePatient();

  // Fetch doctors for the dropdown if no specific doctorId is provided
  const { data: doctorsData, isLoading: doctorsLoading } = useDoctors({ limit: 100 });

  const [form, setForm] = useState({
    name: initialData?.name ?? "",
    age: initialData?.age ?? 0,
    gender: initialData?.gender ?? "MALE",
    phone: initialData?.phone ?? "",
    email: initialData?.email ?? "",
    condition: initialData?.condition ?? "",
    notes: initialData?.notes ?? "",
    selectedDoctorId: doctorId || initialData?.doctorId || "",
  });
  const [errors, setErrors] = useState<Errors>({});

  const showDoctorSelect = !isEditing && !doctorId;
  const isPending = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error || updateMutation.error;

  const clear = (k: keyof Errors) => errors[k] && setErrors((er) => ({ ...er, [k]: undefined }));

  function validate(): Errors {
    const er: Errors = {};
    if (showDoctorSelect && !form.selectedDoctorId) er.doctor = "Please select a doctor.";
    if (form.name.trim().length < 2) er.name = "Enter the patient's full name.";
    if (!(form.age >= 0 && form.age <= 120) || !form.age) er.age = "Enter a valid age.";
    if (!form.condition.trim()) er.condition = "Enter the patient's condition.";
    if (form.phone.replace(/\D/g, "").length < 6) er.phone = "Enter a valid phone number.";
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      er.email = "Enter a valid email address.";
    return er;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const er = validate();
    setErrors(er);
    if (Object.keys(er).length) return;

    const { selectedDoctorId, ...patientPayload } = form;

    if (isEditing) {
      updateMutation.mutate({ id: initialData.id, data: patientPayload }, { onSuccess });
    } else {
      createMutation.mutate({ doctorId: selectedDoctorId, data: patientPayload }, { onSuccess });
    }
  };

  const aria = (k: keyof Errors) => ({
    "aria-invalid": !!errors[k],
    "aria-describedby": errors[k] ? `patient-${k}-error` : undefined,
  });

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Doctor (only when not pre-assigned) */}
      {showDoctorSelect && (
        <Field
          id="patient-doctor"
          label="Assign to doctor"
          icon={<StethoscopeIcon className="h-5 w-5" />}
          error={errors.doctor}
        >
          <select
            id="patient-doctor"
            required
            value={form.selectedDoctorId}
            onChange={(e) => {
              setForm({ ...form, selectedDoctorId: e.target.value });
              clear("doctor");
            }}
            disabled={isPending || doctorsLoading}
            className={`${inputClass(!!errors.doctor)} cursor-pointer appearance-none pr-10 ${
              form.selectedDoctorId ? "" : "text-slate-400"
            }`}
            {...aria("doctor")}
          >
            <option value="" disabled>
              {doctorsLoading ? "Loading doctors…" : "Select a doctor…"}
            </option>
            {doctorsData?.data.map((d) => (
              <option key={d.id} value={d.id} className="text-slate-900">
                {d.name} ({d.specialization})
              </option>
            ))}
          </select>
          <Chevron />
        </Field>
      )}

      {/* Name */}
      <Field id="patient-name" label="Full name" icon={<UserIcon className="h-5 w-5" />} error={errors.name}>
        <input
          id="patient-name"
          required
          type="text"
          autoComplete="off"
          placeholder="Rahim Uddin"
          value={form.name}
          onChange={(e) => {
            setForm({ ...form, name: e.target.value });
            clear("name");
          }}
          disabled={isPending}
          className={inputClass(!!errors.name)}
          {...aria("name")}
        />
      </Field>

      {/* Age + gender */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-[9rem_1fr]">
        <Field id="patient-age" label="Age" icon={<CakeIcon className="h-5 w-5" />} error={errors.age}>
          <input
            id="patient-age"
            required
            type="number"
            inputMode="numeric"
            min={0}
            max={120}
            placeholder="34"
            value={form.age === 0 ? "" : form.age}
            onChange={(e) => {
              setForm({ ...form, age: Number(e.target.value) });
              clear("age");
            }}
            disabled={isPending}
            className={inputClass(!!errors.age)}
            {...aria("age")}
          />
        </Field>

        <div>
          <span id="gender-label" className="mb-1.5 block text-sm font-medium text-slate-700">
            Gender
          </span>
          <div
            role="radiogroup"
            aria-labelledby="gender-label"
            className="grid grid-cols-3 gap-1 rounded-xl border border-slate-200 bg-slate-50/60 p-1"
          >
            {GENDERS.map((g) => (
              <label key={g.value} className="cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value={g.value}
                  checked={form.gender === g.value}
                  onChange={() => setForm({ ...form, gender: g.value as Gender })}
                  disabled={isPending}
                  className="peer sr-only"
                />
                <span className="flex items-center justify-center rounded-lg px-2 py-2 text-sm font-medium text-slate-500 transition hover:text-slate-800 peer-checked:bg-white peer-checked:text-teal-700 peer-checked:shadow-sm peer-checked:ring-1 peer-checked:ring-teal-600/20 peer-focus-visible:ring-2 peer-focus-visible:ring-teal-500 peer-disabled:opacity-60">
                  {g.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Condition */}
      <Field
        id="patient-condition"
        label="Condition"
        icon={<HeartPulseIcon className="h-5 w-5" />}
        error={errors.condition}
      >
        <input
          id="patient-condition"
          required
          type="text"
          autoComplete="off"
          placeholder="e.g. Hypertension"
          value={form.condition}
          onChange={(e) => {
            setForm({ ...form, condition: e.target.value });
            clear("condition");
          }}
          disabled={isPending}
          className={inputClass(!!errors.condition)}
          {...aria("condition")}
        />
      </Field>

      {/* Phone + email */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field id="patient-phone" label="Phone" icon={<PhoneIcon className="h-5 w-5" />} error={errors.phone}>
          <input
            id="patient-phone"
            required
            type="tel"
            inputMode="tel"
            autoComplete="off"
            placeholder="+880 1XXX-XXXXXX"
            value={form.phone}
            onChange={(e) => {
              setForm({ ...form, phone: e.target.value });
              clear("phone");
            }}
            disabled={isPending}
            className={inputClass(!!errors.phone)}
            {...aria("phone")}
          />
        </Field>

        <Field
          id="patient-email"
          label="Email"
          optional
          icon={<MailIcon className="h-5 w-5" />}
          error={errors.email}
        >
          <input
            id="patient-email"
            type="email"
            inputMode="email"
            autoComplete="off"
            placeholder="name@email.com"
            value={form.email}
            onChange={(e) => {
              setForm({ ...form, email: e.target.value });
              clear("email");
            }}
            disabled={isPending}
            className={inputClass(!!errors.email)}
            {...aria("email")}
          />
        </Field>
      </div>

      {/* Notes */}
      <Field id="patient-notes" label="Notes" optional>
        <textarea
          id="patient-notes"
          rows={3}
          placeholder="Allergies, history, or anything the care team should know…"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          disabled={isPending}
          className={`${inputClass(false, false)} resize-none`}
        />
      </Field>

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
            "Update Patient"
          ) : (
            "Create Patient"
          )}
        </button>
      </div>
    </form>
  );
}