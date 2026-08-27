import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  ChevronDown,
  Check,
} from "lucide-react";
import { setCreateLearner } from "../../features/globalSlice";
import { useGetLearnersQuery, useGetAllClassesQuery } from "../../features/api";
import AddLearner from "../../components/admin-components/AddLearner";
import { useSelector } from "react-redux";
export default function Learners() {
  const dispatch = useDispatch();
  const [statusFilter, setStatusFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("All Classes");
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const createLearnerOpen = useSelector(
    (state) => state.global.isCreateLearnerOpen,
  );

  //fetch all learners.
  const {
    data: response,
    isLoading,
    isError,
    refetch: refetchLearners,
  } = useGetLearnersQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  //fetch all classes for the dropdown.
  const { data: classesResponse } = useGetAllClassesQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  // backend returns { message, learners: [...] }
  const learners = response?.learners ?? [];

  // build class options from the classes endpoint
  const classOptions = [
    "All Classes",
    ...(classesResponse?.classes ?? []).map((c) => `Grade ${c.grade}`),
  ];

  // close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // filter by status
  const statusFiltered = learners.filter((learner) => {
    if (statusFilter === "all") return true;
    return statusFilter === learner.status;
  });

  // filter by class
  const classFiltered = statusFiltered.filter((learner) => {
    if (classFilter === "All Classes") return true;
    const learnerClass = learner.classes?.grade
      ? `Grade ${learner.classes.grade}`
      : null;
    return learnerClass === classFilter;
  });

  // filter by search
  const searchedLearners = classFiltered.filter((learner) => {
    if (!search) return true;
    const fullName =
      `${learner.first_name ?? ""} ${learner.last_name ?? ""}`.toLowerCase();
    const studentNumber = (learner.student_number ?? "").toLowerCase();
    const className = (learner.classes?.name ?? "").toLowerCase();
    const query = search.toLowerCase();
    return (
      fullName.includes(query) ||
      studentNumber.includes(query) ||
      className.includes(query)
    );
  });

  const getInitials = (firstName, lastName) => {
    const first = firstName?.[0] ?? "";
    const last = lastName?.[0] ?? "";
    return `${first}${last}`.toUpperCase() || "??";
  };

  return (
    <div className="text-white py-10 px-10">
      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-4xl font-bold">Learners</h1>
          <p className="text-text-secondary mt-3 text-lg">
            Manage and organize all learners across elementary grade levels.
          </p>
        </div>

        <button
          onClick={() => dispatch(setCreateLearner(true))}
          className="flex items-center gap-3 bg-primary rounded-2xl py-3 px-4 hover:scale-103 hover:shadow-lg hover:cursor-pointer transition-all duration-300"
        >
          <Plus className="text-black" />
          <span className="text-black text-lg font-semibold">Add Learner</span>
        </button>
      </div>

      {/* search + filter bar */}
      <div className="flex items-center justify-between mt-8 gap-4">
        <div className="bg-card-2 flex items-center border border-text-secondary/10 rounded-2xl w-100 py-3 px-4">
          <Search className="text-text-secondary" size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, student #, class..."
            className="w-full ml-3 bg-transparent outline-none text-white placeholder-text-secondary/50"
          />
        </div>

        <div className="flex items-center gap-4">
          {/* Status pills */}
          <div className="flex items-center gap-3">
            <p className="text-text-secondary">Status:</p>
            <div className="bg-card-2 border border-text-secondary/10 p-1 rounded-xl flex items-center gap-1">
              {["all", "active", "inactive"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`py-2 px-4 rounded-lg transition-all capitalize ${
                    statusFilter === status
                      ? "text-primary bg-primary/10"
                      : "text-text-secondary/50"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Class dropdown */}
          <div className="flex items-center gap-3">
            <p className="text-text-secondary">Class:</p>
            <div className="relative w-48" ref={dropdownRef}>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between bg-card-2 border rounded-lg px-3 py-2 transition-colors ${
                  isOpen
                    ? "border-primary"
                    : "border-text-secondary/10 hover:border-text-secondary/30"
                }`}
              >
                <span className="text-white text-sm">{classFilter}</span>
                <ChevronDown
                  size={16}
                  className={`text-text-secondary transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-full bg-card-2 border border-text-secondary/10 rounded-lg overflow-hidden z-50 shadow-xl max-h-80 overflow-y-auto">
                  {classOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setClassFilter(option);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${
                        classFilter === option
                          ? "bg-primary text-black"
                          : "text-text-secondary hover:bg-text-secondary/10"
                      }`}
                    >
                      <span>{option}</span>
                      {classFilter === option && (
                        <Check size={14} className="text-black" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* table */}
      <div className="mt-6 bg-card-2 border border-text-secondary/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="border-b border-text-secondary/10">
            <tr>
              <th className="px-6 py-4 text-text-secondary font-semibold text-sm">
                Learner
              </th>
              <th className="px-6 py-4 text-text-secondary font-semibold text-sm">
                Student Number
              </th>
              <th className="px-6 py-4 text-text-secondary font-semibold text-sm">
                Class
              </th>
              <th className="px-6 py-4 text-text-secondary font-semibold text-sm">
                Date of Birth
              </th>
              <th className="px-6 py-4 text-text-secondary font-semibold text-sm">
                Guardian
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
                  Loading learners...
                </td>
              </tr>
            )}

            {isError && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-red-500">
                  Failed to load learners.
                </td>
              </tr>
            )}

            {!isLoading && !isError && searchedLearners.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-10 text-center text-text-secondary"
                >
                  No learners found.
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

                return (
                  <tr
                    key={learner.id}
                    className="border-b border-text-secondary/10 hover:bg-text-secondary/5 transition-colors"
                  >
                    {/* Learner — avatar + name */}
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

                    {/* Student Number */}
                    <td className="px-6 py-4 text-text-secondary font-mono text-sm">
                      {learner.student_number}
                    </td>

                    {/* Class */}
                    <td className="px-6 py-4">
                      <span className="bg-card-2 border border-text-secondary/20 px-3 py-1 rounded-full text-sm text-white">
                        {learner.classes?.name ??
                          (learner.classes?.grade
                            ? `Grade ${learner.classes.grade}`
                            : "—")}
                      </span>
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

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 text-text-secondary/60">
                        <button
                          className="hover:text-primary transition-colors"
                          title="View"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="hover:text-primary transition-colors"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
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

      {createLearnerOpen && (
        <AddLearner
          classes={classesResponse?.classes ?? []}
          onCreated={refetchLearners}
          onClose={() => dispatch(setCreateLearner(false))}
        />
      )}
    </div>
  );
}
