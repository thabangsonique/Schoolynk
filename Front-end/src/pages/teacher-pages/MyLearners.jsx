import React, { useState } from "react";
import { Search } from "lucide-react";
import { useGetMyLearnersQuery } from "../../features/api";

export default function MyLearners() {
  //fetch only this teacher's learners via the teacher endpoint.
  const { data: response, isLoading, isError } = useGetMyLearnersQuery();

  //backend returns { teacherLearners: [...] }.
  const learners = response?.teacherLearners ?? [];

  //search state — match against the student ID or their name.
  const [search, setSearch] = useState("");

  const getInitials = (firstName, lastName) => {
    const first = firstName?.[0] ?? "";
    const last = lastName?.[0] ?? "";
    return `${first}${last}`.toUpperCase() || "??";
  };

  const searchedLearners = learners.filter((learner) => {
    if (!search) return true;
    const query = search.toLowerCase();
    const fullName =
      `${learner.first_name ?? ""} ${learner.last_name ?? ""}`.toLowerCase();
    const studentId = (learner.student_number ?? "").toLowerCase();
    return fullName.includes(query) || studentId.includes(query);
  });

  return (
    <div className="text-white py-10 px-10">
      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-4xl font-bold">My Learners</h1>
          <p className="text-text-secondary mt-3 text-lg">
            Manage the learners enrolled in your class.
          </p>
        </div>
      </div>

      {/* search bar */}
      <div className="mt-8">
        <div className="bg-card-2 flex items-center border border-text-secondary/10 rounded-2xl w-100 py-3 px-4">
          <Search className="text-text-secondary" size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name or ID..."
            className="w-full ml-3 bg-transparent outline-none text-white placeholder-text-secondary/50"
          />
        </div>
      </div>

      {/* learner table */}
      <div className="mt-6 bg-card-2 border border-text-secondary/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="border-b border-text-secondary/10">
            <tr>
              <th className="px-6 py-4 text-text-secondary font-semibold text-sm">
                Student
              </th>
              <th className="px-6 py-4 text-text-secondary font-semibold text-sm">
                Student ID
              </th>
              <th className="px-6 py-4 text-text-secondary font-semibold text-sm">
                Date of Birth
              </th>
              <th className="px-6 py-4 text-text-secondary font-semibold text-sm">
                Guardian
              </th>
              <th className="px-6 py-4 text-text-secondary font-semibold text-sm">
                Parent Contact
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-10 text-center text-text-secondary"
                >
                  Loading learners...
                </td>
              </tr>
            )}

            {isError && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-red-500">
                  Failed to load learners.
                </td>
              </tr>
            )}

            {!isLoading && !isError && searchedLearners.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-10 text-center text-text-secondary"
                >
                  {search
                    ? "No learners match your search."
                    : "No learners in your class yet."}
                </td>
              </tr>
            )}

            {!isLoading &&
              !isError &&
              searchedLearners.map((learner) => {
                const fullName =
                  `${learner.first_name ?? ""} ${learner.last_name ?? ""}`.trim();
                const guardianName = learner.parents
                  ? `${learner.parents.first_name ?? ""} ${learner.parents.last_name ?? ""}`.trim()
                  : "—";
                const guardianPhone = learner.parents?.phone_number ?? "—";

                return (
                  <tr
                    key={learner.id}
                    className="border-b border-text-secondary/10 hover:bg-text-secondary/5 transition-colors"
                  >
                    {/* Student — avatar + name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
                          {getInitials(learner.first_name, learner.last_name)}
                        </div>
                        <span className="text-white font-medium">
                          {fullName}
                        </span>
                      </div>
                    </td>

                    {/* Student ID */}
                    <td className="px-6 py-4 text-text-secondary font-mono text-sm">
                      {learner.student_number}
                    </td>

                    {/* Date of Birth */}
                    <td className="px-6 py-4 text-text-secondary">
                      {learner.date_of_birth
                        ? new Date(learner.date_of_birth).toLocaleDateString()
                        : "—"}
                    </td>

                    {/* Guardian */}
                    <td className="px-6 py-4 text-text-secondary">
                      {guardianName}
                    </td>

                    {/* Parent Contact */}
                    <td className="px-6 py-4 text-text-secondary">
                      {guardianPhone}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>

        {/* footer */}
        {!isLoading && !isError && searchedLearners.length > 0 && (
          <div className="px-6 py-4 border-t border-text-secondary/10 flex justify-between items-center text-sm text-text-secondary">
            <span>
              Showing {searchedLearners.length} of {learners.length} learners
            </span>
            <span>School Year 2026-2027</span>
          </div>
        )}
      </div>
    </div>
  );
}
