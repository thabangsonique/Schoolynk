import React from "react";
import { X } from "lucide-react";

export default function ViewTeacher({ teacher, onClose }) {
  const profile = teacher?.profiles;
  const assignedClass = teacher?.classes;
  const fullName =
    `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim() ||
    "Teacher";
  const status = profile?.status ?? "inactive";

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 px-4 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl overflow-hidden rounded-2xl border border-text-secondary/10 bg-card-2"
        onClick={(event) => event.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-center justify-between bg-background p-8">
          {/* left */}
          <div>
            <h1 className="text-2xl font-bold text-white">Teacher Profile</h1>
            <p className="mt-1 text-sm text-text-secondary">
              {teacher?.employee_number ?? "No employee number"}
            </p>
          </div>
          {/* right */}
          <button
            type="button"
            onClick={onClose}
            className="text-text-secondary transition-colors hover:text-white"
            aria-label="Close teacher profile"
          >
            <X size={24} />
          </button>
        </div>

        {/* teacher content */}
        <div className="px-8 py-4">
          <div className="flex flex-wrap items-start gap-6 rounded-2xl bg-background px-4 py-5">
            {/* profile image */}
            <div className="shrink-0 rounded-full">
              <img
                src="/user.png"
                alt={fullName}
                className="h-20 w-20 rounded-full border border-primary object-cover"
              />
            </div>

            {/* text */}
            <div className="min-w-48 flex-1">
              <h1 className="text-2xl font-bold text-white">{fullName}</h1>
              <p className="text-text-secondary">
                {assignedClass?.name
                  ? `Class Teacher for ${assignedClass.name}`
                  : "Teacher"}
              </p>
              <div
                className={`mt-5 flex max-w-40 items-center gap-3 rounded-xl border px-3 py-1 ${
                  status === "active"
                    ? "border-text-green/10 bg-text-green/10 text-text-green"
                    : "border-text-secondary/10 bg-text-secondary/10 text-text-secondary"
                }`}
              >
                <div
                  className={`h-3 w-3 rounded-full ${
                    status === "active"
                      ? "bg-text-green"
                      : "bg-text-secondary/40"
                  }`}
                />
                <p className="capitalize">{status} Staff</p>
              </div>
            </div>

            {/* teacher information */}

            {/* email */}
            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-text-secondary/10 p-3">
                <p className="text-sm text-text-secondary">Email</p>
                <p className="mt-1 wrap-break-word font-semibold text-white">
                  {profile?.email ?? "Not available"}
                </p>
              </div>

              {/* phone number */}

              <div className="rounded-xl border border-text-secondary/10 p-3">
                <p className="text-sm text-text-secondary">Phone</p>
                <p className="mt-1 font-semibold text-white">
                  {profile?.phone ?? "Not available"}
                </p>
              </div>

              <div className="rounded-xl border border-text-secondary/10 p-3">
                <p className="text-sm text-text-secondary">Assigned Class</p>
                <p className="mt-1 font-semibold text-white">
                  {assignedClass?.name
                    ? `${assignedClass.name}${assignedClass.grade ? ` (Grade ${assignedClass.grade})` : ""}`
                    : "Not assigned"}
                </p>
              </div>

              <div className="rounded-xl border border-text-secondary/10 p-3">
                <p className="text-sm text-text-secondary">Joined Date</p>
                <p className="mt-1 font-semibold text-white">
                  {profile?.created_at ?? "Not available"}
                </p>
              </div>
            </div>
          </div>

          {/* close button */}
          <button
            onClick={onClose}
            className="flex ml-auto bg-background mt-8 text-xl py-3 px-4 rounded-xl hover:cursor-pointer hover:scale-103 transition-all duration-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
