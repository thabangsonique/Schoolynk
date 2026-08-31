import React from "react";
import { BookOpen, GraduationCap, Users } from "lucide-react";

export default function ClassesCard({ classroom }) {
  const teacher = classroom?.teachers;
  const learners = classroom?.learners ?? [];
  const subjects = (classroom?.class_subjects ?? [])
    .map((assignment) => assignment.subjects)
    .filter(Boolean);
  const teacherName = teacher?.profiles
    ? `${teacher.profiles.first_name ?? ""} ${teacher.profiles.last_name ?? ""}`.trim()
    : "No teacher assigned";

  return (
    <article className="overflow-hidden rounded-2xl border border-text-secondary/10 bg-card-2 text-white shadow-lg">
      <div className="flex items-start justify-between border-b border-text-secondary/10 bg-background px-5 py-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Grade {classroom?.grade ?? "-"}
          </p>
          <h2 className="mt-1 text-xl font-bold">
            {classroom?.name ?? "Unnamed class"}
          </h2>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          Capacity 32
        </span>
      </div>

      <div className="space-y-5 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Users size={19} />
          </div>
          <div>
            <p className="text-xs text-text-secondary">Class teacher</p>
            <p className="font-semibold">{teacherName}</p>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-text-secondary">
              <GraduationCap size={17} /> Learners
            </span>
            <span className="font-semibold">{learners.length} / 32</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-text-secondary/10">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{
                width: `${Math.min((learners.length / 32) * 100, 100)}%`,
              }}
            />
          </div>
        </div>

        <div>
          <p className="mb-2 flex items-center gap-2 text-sm text-text-secondary">
            <BookOpen size={17} /> Subjects
          </p>
          {subjects.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {subjects.map((subject) => (
                <span
                  key={subject.id}
                  className="rounded-lg border border-text-secondary/10 bg-background px-2.5 py-1 text-xs font-medium"
                >
                  {subject.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-secondary">No subjects assigned</p>
          )}
        </div>
      </div>
    </article>
  );
}
