import React, { useState } from "react";
import { X } from "lucide-react";
import { useCreateLearnerMutation } from "../../features/api";

const initialForm = {
  first_name: "",
  last_name: "",
  student_number: "",
  date_of_birth: "",
  class_id: "",
  status: "active",
  parent_name: "",
  parent_phone: "",
};

export default function AddLearner({ onClose, classes = [], onCreated }) {
  const [form, setForm] = useState(initialForm);
  const [createLearner, { isLoading, error }] = useCreateLearnerMutation();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previousForm) => ({ ...previousForm, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const parentName = form.parent_name.trim().split(/\s+/);

    await createLearner({
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      date_of_birth: form.date_of_birth,
      class_id: form.class_id,
      guardian: {
        first_name: parentName[0],
        last_name: parentName.slice(1).join(" ") || parentName[0],
        phone_number: form.parent_phone.trim(),
        relationship: "Parent",
      },
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
            <h2 className="text-xl font-bold">Add Learner</h2>
            <p className="mt-1 text-sm text-text-secondary">
              Enroll a new elementary school student
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-text-secondary transition-colors hover:text-white"
            aria-label="Close add learner dialog"
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
              placeholder="Smith"
              required
            />
          </label>
          <label className={labelClassName}>
            Student Number
            <input
              name="student_number"
              value={form.student_number}
              onChange={handleChange}
              className={inputClassName}
              placeholder="STU-2024-435"
            />
          </label>
          <label className={labelClassName}>
            Date of Birth
            <input
              type="date"
              name="date_of_birth"
              value={form.date_of_birth}
              onChange={handleChange}
              className={inputClassName}
              required
            />
          </label>
          <label className={labelClassName}>
            Class
            <select
              name="class_id"
              value={form.class_id}
              onChange={handleChange}
              className={inputClassName}
              required
            >
              <option value="">Select a class</option>
              {classes.map((schoolClass) => (
                <option key={schoolClass.id} value={schoolClass.id}>
                  {schoolClass.name ?? `Grade ${schoolClass.grade}`}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClassName}>
            Enrollment Status
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className={`${inputClassName} capitalize`}
            >
              <option value="active">Active / Enrolled</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
        </div>

        <div className="mx-6 border-t border-text-secondary/10 pt-4">
          <p className="text-xs font-bold uppercase tracking-wide text-text-secondary">
            Parent / Guardian Information
          </p>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className={labelClassName}>
              Parent Name
              <input
                name="parent_name"
                value={form.parent_name}
                onChange={handleChange}
                className={inputClassName}
                placeholder="Mark Smith"
                required
              />
            </label>
            <label className={labelClassName}>
              Parent Phone
              <input
                type="tel"
                name="parent_phone"
                value={form.parent_phone}
                onChange={handleChange}
                className={inputClassName}
                placeholder="+1 (555) 290-2096"
                required
              />
            </label>
          </div>
        </div>

        {error && (
          <p className="px-6 pt-4 text-sm text-red-400">
            {error?.data?.message ??
              "Failed to create learner. Please try again."}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-4 border-t border-text-secondary/10 px-6 py-4">
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
            {isLoading ? "Saving..." : "Save Learner"}
          </button>
        </div>
      </form>
    </div>
  );
}
