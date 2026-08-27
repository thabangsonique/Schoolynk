import React, { useState } from "react";
import { X } from "lucide-react";
import { useCreateTeacherMutation } from "../../features/api";

const initialForm = {
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  employee_number: "",
  class_id: "",
};

export default function AddTeacher({ onClose, classes = [], onCreated }) {
  const [form, setForm] = useState(initialForm);
  const [createTeacher, { isLoading, error }] = useCreateTeacherMutation();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previousForm) => ({ ...previousForm, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    await createTeacher({
      email: form.email.trim(),
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      password: form.password,
      employee_number: form.employee_number.trim() || undefined,
      class_id: form.class_id || undefined,
    }).unwrap();

    if (onCreated) {
      await onCreated();
    }

    setForm(initialForm);
    onClose();
  };

  const inputClassName =
    "mt-1 w-full rounded-lg border border-text-secondary/10 bg-background px-3 py-3 text-sm text-white outline-none transition-colors focus:border-primary";
  const labelClassName = "text-sm font-semibold text-white";

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 px-4 backdrop-blur-md"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-text-secondary/20 bg-card-2 text-white shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-text-secondary/10 bg-background px-6 py-4">
          <div>
            <h2 className="text-xl font-bold">Add Teacher</h2>
            <p className="mt-1 text-sm text-text-secondary">
              Register a new educator into EduCore
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-text-secondary transition-colors hover:text-white"
            aria-label="Close add teacher dialog"
          >
            <X size={21} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 px-6 py-6 sm:grid-cols-2">
          <label className={labelClassName}>
            First Name
            <input
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              className={inputClassName}
              placeholder="Sarah"
              required
            />
          </label>

          <label className={labelClassName}>
            Last Name
            <input
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              className={inputClassName}
              placeholder="Johnson"
              required
            />
          </label>

          <label className={labelClassName}>
            Email Address
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className={inputClassName}
              placeholder="s.johnson@educore.edu"
              required
            />
          </label>

          <label className={labelClassName}>
            Employee Number
            <input
              name="employee_number"
              value={form.employee_number}
              onChange={handleChange}
              className={inputClassName}
              placeholder="EMP-2024-009"
            />
          </label>

          <label className={labelClassName}>
            Assigned Class
            <select
              name="class_id"
              value={form.class_id}
              onChange={handleChange}
              className={inputClassName}
            >
              <option value="">No class assigned</option>
              {classes.map((schoolClass) => (
                <option key={schoolClass.id} value={schoolClass.id}>
                  {schoolClass.name ?? `Grade ${schoolClass.grade}`}
                </option>
              ))}
            </select>
          </label>

          <label className={labelClassName}>
            Password
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className={inputClassName}
              placeholder="Temporary password"
              minLength={6}
              required
            />
          </label>
        </div>

        {error && (
          <p className="px-6 pb-2 text-sm text-red-400">
            {error?.data?.message ??
              "Failed to create teacher. Please try again."}
          </p>
        )}

        <div className="flex justify-end gap-4 border-t border-text-secondary/10 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-text-secondary transition-colors hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Saving..." : "Save Teacher"}
          </button>
        </div>
      </form>
    </div>
  );
}
