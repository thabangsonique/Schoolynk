import React from "react";
import { Plus } from "lucide-react";
import SubjectCard from "../../components/cards/SubjectCard";
import { useSelector, useDispatch } from "react-redux";
import { setCreateSubject } from "../../features/globalSlice";
import {
  useGetAllClassesQuery,
  useGetAllSubjectsQuery,
  useGetTeachersQuery,
  useDeleteSubjectMutation,
} from "../../features/api";
import CreateSubject from "../../components/admin-components/CreateSubject";
import EditSubject from "../../components/admin-components/EditSubject";

export default function Subjects() {
  const dispatch = useDispatch();
  const createSubjectOpen = useSelector(
    (state) => state.global.isCreateSubjectOpen,
  );
  const [editingSubject, setEditingSubject] = React.useState(null);
  const [deleteSubject, { isLoading: isDeleting, error: deleteError }] =
    useDeleteSubjectMutation();
  const {
    data,
    isLoading,
    isError,
    refetch: refetchSubjects,
  } = useGetAllSubjectsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const { data: classesResponse } = useGetAllClassesQuery();
  const { data: teachers = [] } = useGetTeachersQuery();
  const subjects = data?.result ?? [];

  const handleDeleteSubject = async (subject) => {
    if (!window.confirm(`Are you sure you want to delete ${subject.name}?`)) {
      return;
    }

    try {
      await deleteSubject(subject.id).unwrap();
      await refetchSubjects();
    } catch {
      // The API error is displayed below the subject cards.
    }
  };

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
          onClick={() => dispatch(setCreateSubject(true))}
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
            <SubjectCard
              key={subject.id}
              subject={subject}
              onEdit={setEditingSubject}
              onDelete={handleDeleteSubject}
              isDeleting={isDeleting}
            />
          ))}
      </div>

      {deleteError && (
        <p className="mt-4 text-sm text-red-400">
          {deleteError?.data?.message ??
            "Failed to delete subject. Please try again."}
        </p>
      )}

      {createSubjectOpen && (
        <CreateSubject
          teachers={teachers}
          classes={classesResponse?.classes ?? []}
          onCreated={refetchSubjects}
          onClose={() => dispatch(setCreateSubject(false))}
        />
      )}

      {editingSubject && (
        <EditSubject
          subject={editingSubject}
          teachers={teachers}
          classes={classesResponse?.classes ?? []}
          onUpdated={refetchSubjects}
          onClose={() => setEditingSubject(null)}
        />
      )}
    </div>
  );
}
