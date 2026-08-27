import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Plus, Search, Eye, Pencil, Trash2 } from "lucide-react";
import { setCreateTeacher } from "../../features/globalSlice";
import {
  useDeleteTeacherMutation,
  useGetAllClassesQuery,
  useGetTeachersQuery,
} from "../../features/api";
import { setViewTeacher } from "../../features/globalSlice";
import ViewTeacher from "../../components/admin-components/ViewTeacher";
import EditTeacher from "../../components/admin-components/EditTeacher";
import AddTeacher from "../../components/admin-components/AddTeacher";

export default function Teachers() {
  const dispatch = useDispatch();
  const [selected, setSelected] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [editTeacherOpen, setEditTeacherOpen] = useState(false);
  const [deleteTeacher, { isLoading: isDeleting, error: deleteError }] =
    useDeleteTeacherMutation();

  //viewing the teacher.
  const viewTeacher = useSelector((state) => state.global.viewTeacherOpen);
  const createTeacherOpen = useSelector(
    (state) => state.global.isCreateTeacherOpen,
  );
  const {
    data: teachers,
    isLoading,
    isError,
    refetch: refetchTeachers,
  } = useGetTeachersQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const { data: classesResponse } = useGetAllClassesQuery();
  const classes = classesResponse?.classes ?? [];

  const handleDeleteTeacher = async (teacher) => {
    const fullName =
      `${teacher.profiles?.first_name ?? ""} ${teacher.profiles?.last_name ?? ""}`.trim() ||
      "this teacher";

    if (!window.confirm(`Are you sure you want to delete ${fullName}?`)) {
      return;
    }

    try {
      await deleteTeacher(teacher.id).unwrap();
      await refetchTeachers();
    } catch {
      // The API error is displayed below the table.
    }
  };

  const filteredTeachers = (teachers ?? []).filter((t) => {
    const status = t.profiles?.status;
    if (selected === "active") return status === "active";
    if (selected === "inactive") return status !== "active";
    return true;
  });

  const searchedTeachers = filteredTeachers.filter((t) => {
    if (!search) return true;
    const fullName =
      `${t.profiles?.first_name ?? ""} ${t.profiles?.last_name ?? ""}`.toLowerCase();
    const empNumber = (t.employee_number ?? "").toLowerCase();
    const className = (t.classes?.name ?? "").toLowerCase();
    const query = search.toLowerCase();
    return (
      fullName.includes(query) ||
      empNumber.includes(query) ||
      className.includes(query)
    );
  });

  const getInitials = (firstName, lastName) => {
    const first = firstName?.[0] ?? "";
    const last = lastName?.[0] ?? "";
    return `${first}${last}`.toUpperCase() || "??";
  };

  const getStatusClasses = (status) => {
    if (status === "active") {
      return "bg-text-green/10 text-text-green";
    }
    return "bg-text-secondary/10 text-text-secondary/50";
  };

  const getStatusDot = (status) => {
    if (status === "active") return "bg-text-green";
    return "bg-text-secondary/40";
  };

  return (
    <div className="text-white py-10 px-10">
      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-4xl font-bold">Teachers</h1>
          <p className="text-text-secondary mt-3 text-lg">
            Manage all teachers and staff members.
          </p>
        </div>

        <button
          onClick={() => dispatch(setCreateTeacher(true))}
          className="flex items-center gap-3 bg-primary rounded-2xl py-3 px-4 hover:scale-103 hover:shadow-lg hover:cursor-pointer transition-all duration-300"
        >
          <Plus className="text-black" />
          <span className="text-black text-lg font-semibold">Add Teacher</span>
        </button>
      </div>
      {/* search + filter bar */}
      <div className="flex items-center justify-between mt-8">
        <div className="bg-card-2 flex items-center border border-text-secondary/10 rounded-2xl w-100 py-3 px-4">
          <Search className="text-text-secondary" size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, employee #, class..."
            className="w-full ml-3 bg-transparent outline-none text-white placeholder-text-secondary/50"
          />
        </div>

        <div className="flex items-center gap-3">
          <p className="text-text-secondary text-lg">Status:</p>
          <div className="bg-card-2 border border-text-secondary/10 p-1 rounded-xl flex items-center gap-1">
            <button
              onClick={() => setSelected("all")}
              className={`py-2 px-4 rounded-lg transition-all ${
                selected === "all"
                  ? "text-primary bg-primary/10"
                  : "text-text-secondary/50"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelected("active")}
              className={`py-2 px-4 rounded-lg transition-all ${
                selected === "active"
                  ? "text-primary bg-primary/10"
                  : "text-text-secondary/50"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setSelected("inactive")}
              className={`py-2 px-4 rounded-lg transition-all ${
                selected === "inactive"
                  ? "text-primary bg-primary/10"
                  : "text-text-secondary/50"
              }`}
            >
              Inactive
            </button>
          </div>
        </div>
      </div>
      {/* table */}
      <div className="mt-6 bg-card-2 border border-text-secondary/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="border-b border-text-secondary/10">
            <tr>
              <th className="px-6 py-4 text-text-secondary font-semibold text-sm">
                Teacher
              </th>
              <th className="px-6 py-4 text-text-secondary font-semibold text-sm">
                Employee Number
              </th>
              <th className="px-6 py-4 text-text-secondary font-semibold text-sm">
                Assigned Class
              </th>
              <th className="px-6 py-4 text-text-secondary font-semibold text-sm">
                Email
              </th>
              <th className="px-6 py-4 text-text-secondary font-semibold text-sm">
                Status
              </th>
              <th className="px-6 py-4 text-text-secondary font-semibold text-sm">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-10 text-center text-text-secondary"
                >
                  Loading teachers...
                </td>
              </tr>
            )}

            {isError && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-red-500">
                  Failed to load teachers.
                </td>
              </tr>
            )}

            {!isLoading && !isError && searchedTeachers.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-10 text-center text-text-secondary"
                >
                  No teachers found.
                </td>
              </tr>
            )}

            {!isLoading &&
              !isError &&
              searchedTeachers.map((teacher) => {
                const status = teacher.profiles?.status ?? "inactive";
                const fullName =
                  `${teacher.profiles?.first_name ?? ""} ${teacher.profiles?.last_name ?? ""}`.trim();

                return (
                  <tr
                    key={teacher.id}
                    className="border-b border-text-secondary/10 hover:bg-text-secondary/5 transition-colors"
                  >
                    {/* Teacher — avatar + name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {teacher.profiles?.avatar_url ? (
                          <img
                            src={teacher.profiles.avatar_url}
                            alt={fullName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
                            {getInitials(
                              teacher.profiles?.first_name,
                              teacher.profiles?.last_name,
                            )}
                          </div>
                        )}
                        <span className="text-white font-medium">
                          {fullName}
                        </span>
                      </div>
                    </td>

                    {/* Employee Number */}
                    <td className="px-6 py-4 text-text-secondary font-mono text-sm">
                      {teacher.employee_number}
                    </td>

                    {/* Assigned Class */}
                    <td className="px-6 py-4">
                      <span className="bg-card-2 border border-text-secondary/20 px-3 py-1 rounded-full text-sm text-white">
                        {teacher.classes?.grade
                          ? `Grade ${teacher.classes.grade}`
                          : "—"}
                      </span>
                    </td>

                    {/* Email */}
                    <td className="px-6 py-4 text-text-secondary">
                      {teacher.profiles?.email ?? "—"}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-2 ${getStatusClasses(status)}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${getStatusDot(status)}`}
                        />
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 text-text-secondary/60">
                        <button
                          onClick={() => {
                            setSelectedTeacher(teacher);
                            dispatch(setViewTeacher(true));
                          }}
                          className="hover:text-primary transition-colors"
                          title="View"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedTeacher(teacher);
                            setEditTeacherOpen(true);
                          }}
                          className="hover:text-primary transition-colors"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteTeacher(teacher)}
                          disabled={isDeleting}
                          className="hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>

        {deleteError && (
          <p className="border-t border-text-secondary/10 px-6 py-3 text-sm text-red-400">
            {deleteError?.data?.message ??
              "Failed to delete teacher. Please try again."}
          </p>
        )}

        {/* footer */}
        {!isLoading && !isError && searchedTeachers.length > 0 && (
          <div className="px-6 py-4 border-t border-text-secondary/10 flex justify-between items-center text-sm text-text-secondary">
            <span>
              Showing {searchedTeachers.length} of {teachers?.length ?? 0}{" "}
              teachers
            </span>
            <span>School Year 2026-2027</span>
          </div>
        )}
      </div>
      {/* TEACHER VIEW MODAL */}
      {viewTeacher && selectedTeacher && (
        <ViewTeacher
          teacher={selectedTeacher}
          onClose={() => {
            setSelectedTeacher(null);
            dispatch(setViewTeacher(false));
          }}
        />
      )}

      {editTeacherOpen && selectedTeacher && (
        <EditTeacher
          teacher={selectedTeacher}
          classes={classes}
          onClose={() => {
            setEditTeacherOpen(false);
            setSelectedTeacher(null);
          }}
        />
      )}

      {createTeacherOpen && (
        <AddTeacher
          classes={classes}
          onCreated={refetchTeachers}
          onClose={() => dispatch(setCreateTeacher(false))}
        />
      )}
    </div>
  );
}
