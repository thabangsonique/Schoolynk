import React from "react";
import { Plus } from "lucide-react";
import SubjectCard from "../../components/cards/SubjectCard";
import { useGetAllSubjectsQuery } from "../../features/api";

export default function Subjects() {
  const {
    data,
    isLoading,
    isError,
  } = useGetAllSubjectsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const subjects = data?.result ?? [];

  return (
    <div className="py-10 px-8">
      {/* header */}
      <div className="flex items-center justify-between">
        {/* left */}
        <div>
          <h1 className="text-white text-4xl font-bold">Subjects</h1>
          <p className="text-text-secondary text-lg mt-5">
            Manage subjects and their assigned classrooms.
          </p>
        </div>

        {/* right */}
        <button
          onClick={() => dispatch(setCreateClass(true))}
          className="flex items-center gap-3 bg-primary rounded-2xl py-3 px-4 hover:scale-103 hover:shadow-lg hover:cursor-pointer transition-all duration-300"
        >
          <Plus className="text-black" />
          <span className="text-black text-lg font-semibold">Add Subject</span>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-8 mt-8">
        {isLoading && <p className="text-text-secondary">Loading subjects...</p>}
        {isError && <p className="text-red-400">Failed to load subjects.</p>}
        {!isLoading && !isError && subjects.length === 0 && (
          <p className="text-text-secondary">No subjects found.</p>
        )}
        {!isLoading &&
          !isError &&
          subjects.map((subject) => (
            <SubjectCard key={subject.id} subject={subject} />
          ))}
      </div>
    </div>
  );
}
