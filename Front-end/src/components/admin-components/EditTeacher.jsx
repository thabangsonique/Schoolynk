import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useUpdateTeacherByIdMutation } from "../../features/api";

export default function EditTeacher({ teacher, onClose, classes = [] }) {
  const profile = teacher?.profiles;
  const currentClass = teacher?.classes;
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    employee_number: "",
    class_id: "",
    status: "active",
  });
  const [updateTeacher, { isLoading, error }] = useUpdateTeacherByIdMutation();

  useEffect(() => {
    setForm({
      first_name: profile?.first_name ?? "",
      last_name: profile?.last_name ?? "",
      email: profile?.email ?? "",
      employee_number: teacher?.employee_number ?? "",
      class_id: currentClass?.id ?? "",
      status: profile?.status ?? "inactive",
    });
  }, [currentClass?.id, profile, teacher?.employee_number]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previousForm) => ({ ...previousForm, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    await updateTeacher({
      id: teacher.id,
      teacherUpdate: {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        employee_number: form.employee_number.trim(),
        status: form.status,
      },
    }).unwrap();

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
            <h2 className="text-xl font-bold">Edit Teacher</h2>
            <p className="mt-1 text-sm text-text-secondary">
              Update staff member credentials and classroom assignment
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-text-secondary transition-colors hover:text-white"
            aria-label="Close edit teacher dialog"
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
              required
            />
          </label>

          <label className={labelClassName}>
            Email Address
            <input
              type="email"
              name="email"
              value={form.email}
              className={`${inputClassName} cursor-not-allowed opacity-70`}
              readOnly
            />
          </label>

          <label className={labelClassName}>
            Employee Number
            <input
              name="employee_number"
              value={form.employee_number}
              onChange={handleChange}
              className={inputClassName}
              required
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
              <option value="">
                {currentClass?.name ?? "No class assigned"}
              </option>
              {classes
                .filter((schoolClass) => schoolClass.id !== currentClass?.id)
                .map((schoolClass) => (
                  <option key={schoolClass.id} value={schoolClass.id}>
                    {schoolClass.name ?? `Grade ${schoolClass.grade}`}
                  </option>
                ))}
            </select>
          </label>

          <label className={labelClassName}>
            Status
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className={`${inputClassName} capitalize`}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
        </div>

        {error && (
          <p className="px-6 pb-2 text-sm text-red-400">
            Failed to update teacher. Please try again.
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
