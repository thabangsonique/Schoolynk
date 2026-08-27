import { Plus } from "lucide-react";
import React from "react";
import ClassesCard from "../../components/cards/ClassesCard";
import { useSelector, useDispatch } from "react-redux";
import { setCreateClass } from "../../features/globalSlice";
import {
  useGetAllClassesQuery,
  useGetTeachersQuery,
} from "../../features/api";
import CreateClass from "../../components/admin-components/CreateClass";

export default function Classes() {
  const dispatch = useDispatch();
  const createClassOpen = useSelector(
    (state) => state.global.isCreateClassOpen,
  );
  const {
    data: response,
    isLoading,
    isError,
    refetch: refetchClasses,
  } = useGetAllClassesQuery(undefined, { refetchOnMountOrArgChange: true });
  const { data: teachers = [] } = useGetTeachersQuery();
  const classes = response?.classes ?? [];

  return (
    <div className="py-10 px-8">
      {/* header */}
      <div className="flex items-center justify-between">
        {/* left */}
        <div>
          <h1 className=" text-white text-4xl font-bold">Classes</h1>
          <p className="text-text-secondary text-lg mt-5">
            Manage academic classrooms, grade sections, and educator
            assignments.
          </p>
        </div>

        {/* right */}
        <button onClick={() => dispatch(setCreateClass(true))} className="flex items-center gap-3 bg-primary rounded-2xl py-3 px-4 hover:scale-103 hover:shadow-lg hover:cursor-pointer transition-all duration-300">
          <Plus className="text-black" />
          <span className="text-black text-lg font-semibold">Create Class</span>
        </button>
      </div>

      {/* classes section */}
      <div className="grid grid-cols-3 gap-8 mt-8">
        {isLoading && <p className="text-text-secondary">Loading classes...</p>}
        {isError && <p className="text-red-400">Failed to load classes.</p>}
        {!isLoading && !isError && classes.length === 0 && (
          <p className="text-text-secondary">No classes found.</p>
        )}
        {!isLoading &&
          !isError &&
          classes.map((classroom) => (
            <ClassesCard key={classroom.id} classroom={classroom} />
          ))}
      </div>

      {createClassOpen && (
        <CreateClass
          teachers={teachers}
          onCreated={refetchClasses}
          onClose={() => dispatch(setCreateClass(false))}
        />
      )}
    </div>
  );
}
