import React from "react";
import { BookOpen, Clock, Pencil, Trash2 } from "lucide-react";

export default function SubjectCard({ subject, onEdit, onDelete, isDeleting }) {
  const classes = subject?.classes ?? [];
  const leadTeacher = classes.find(
    (classroom) => classroom.subject_teacher,
  )?.subject_teacher;
  const leadTeacherName = leadTeacher
    ? `${leadTeacher.first_name ?? ""} ${leadTeacher.last_name ?? ""}`.trim()
    : "No lead teacher assigned";

  return (
    <article className="overflow-hidden rounded-2xl border border-primary/60 bg-card-2 text-white shadow-lg">
      <div className="flex items-start justify-between px-5 py-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary">
            <BookOpen size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold">
              {subject?.name ?? "Unnamed subject"}
            </h2>
            {subject?.code && (
              <p className="mt-1 text-xs uppercase tracking-wide text-text-secondary">
                {subject.code}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 text-text-secondary/70">
          <button
            type="button"
            title="Edit subject"
            onClick={() => onEdit(subject)}
            className="hover:text-primary"
          >
            <Pencil size={17} />
          </button>
          <button
            type="button"
            title="Delete subject"
            onClick={() => onDelete(subject)}
            disabled={isDeleting}
            className="hover:text-red-400"
          >
            <Trash2 size={17} />
          </button>
        </div>
      </div>

      <div className="px-5 pb-5">
        <p className="min-h-12 text-sm leading-5 text-text-secondary">
          {subject?.description ?? "No description available."}
        </p>

        <div className="mt-4 border-t border-text-secondary/10 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
            Assigned Classrooms ({classes.length})
          </p>
          {classes.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {classes.map((classroom) => (
                <span
                  key={classroom.assignment_id ?? classroom.id}
                  className="rounded-lg bg-background px-2 py-1 text-xs font-semibold text-white"
                >
                  {classroom.name ?? `Grade ${classroom.grade}`}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-text-secondary">
              No classes assigned
            </p>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-text-secondary/10 pt-4 text-sm">
          <span className="text-text-secondary">
            Lead: <strong className="text-white">{leadTeacherName}</strong>
          </span>
          <span className="flex items-center gap-1 font-semibold text-primary">
            <Clock size={15} /> {subject?.weekly_hours ?? 0} hrs/wk
          </span>
        </div>
      </div>
    </article>
  );
}
