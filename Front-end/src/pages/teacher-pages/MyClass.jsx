import React from "react";
import { useSelector } from "react-redux";
import { BookOpen, CalendarCheck, Layers } from "lucide-react";
import {
  useGetMyClassesQuery,
  useGetTodayAttendanceQuery,
} from "../../features/api";
import { useState } from "react";

//STATES.
export default function MyClass() {
  const isSidebarCollapsed = useSelector(
    (state) => state.global.isSidebarCollapsed,
  );

  const [isSelected, setIsSelected] = useState("overview");

  //fetch the class assigned to this teacher.
  const {
    data: classData,
    isLoading: classLoading,
    isError: classError,
    error: classErrorInfo,
  } = useGetMyClassesQuery();

  //fetch today's attendance for this teacher's class.
  const {
    data: attendanceData,
    isLoading: attendanceLoading,
    isError: attendanceError,
    error: attendanceErrorInfo,
  } = useGetTodayAttendanceQuery();

  //the class lives inside "response" from the my-classes endpoint.
  const myClass = classData?.response;
  const activeSubjects = myClass?.subjects ?? [];

  //class teacher (single or array).
  const teacher = Array.isArray(myClass?.teachers)
    ? myClass.teachers[0]
    : myClass?.teachers;
  const teacherName = teacher?.profiles
    ? `${teacher.profiles.first_name ?? ""} ${teacher.profiles.last_name ?? ""}`.trim()
    : null;

  //rows for the classroom information card.
  const infoRows = [
    { label: "Class Teacher", value: teacherName ?? "—" },
    { label: "Assigned Room", value: myClass?.room_number ?? "—" },
    {
      label: "Grade & Section",
      value: myClass ? `Grade ${myClass.grade} – Section ${myClass.name}` : "—",
    },
    { label: "Class Representative", value: "—" },
  ];

  //summary of today's attendance.
  const summary = attendanceData?.summary;
  const totalEnrolled = summary?.total_enrolled ?? 0;
  const present = summary?.present ?? 0;
  const attendancePercentage =
    totalEnrolled > 0 ? Math.round((present / totalEnrolled) * 100) : 0;

  //rolled up list of learners with today's + overall attendance.
  const roll = attendanceData?.roll ?? [];

  //initials for the circular badge, e.g. "Jane Smith" -> "JS".
  const getInitials = (first, last) =>
    `${(first?.[0] ?? "").toUpperCase()}${(last?.[0] ?? "").toUpperCase()}`.trim();

  //colored pill for today's attendance status.
  const renderStatus = (status) => {
    if (status === "present") {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-text-green/10 text-text-green">
          Present
        </span>
      );
    }
    if (status === "absent") {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-500">
          Absent
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-text-secondary/10 text-text-secondary">
        Unmarked
      </span>
    );
  };

  return (
    <div className={`${isSidebarCollapsed ? "pl-30 pr-10" : "px-10"} py-10`}>
      {/* header section */}
      <div>
        <h1 className="text-white text-4xl font-bold">My Class</h1>
        <p className="text-lg text-text-secondary mt-4">
          Overview of your assigned class for today.
        </p>
      </div>

      {/* loading / error states */}
      {classLoading && (
        <p className="text-text-secondary mt-7">Loading your class...</p>
      )}

      {classError && (
        <p className="text-red-500 mt-7">
          {classErrorInfo?.data?.message ?? "Failed to load your class."}
        </p>
      )}

      {!classLoading && !classError && myClass && (
        <div className="mt-7 gap-5 grid md:grid-cols-3">
          {/* CARD 1 - MY CLASS */}
          <div className="bg-card-2 p-6 rounded-2xl border border-text-secondary/10 hover:border-primary/40 transition-all duration-300">
            <div className="flex items-start justify-between">
              <span className="text-text-secondary text-lg">My Class</span>
              <div className="bg-primary/10 p-4 rounded-xl">
                <Layers className="text-primary" />
              </div>
            </div>
            <p className="text-white font-bold text-5xl mb-4">{myClass.name}</p>
            <p className="text-text-secondary/40">Grade {myClass.grade}</p>
          </div>

          {/* CARD 2 - TODAY'S ATTENDANCE */}
          <div className="bg-card-2 p-6 rounded-2xl border border-text-secondary/10 hover:border-primary/40 transition-all duration-300">
            <div className="flex items-start justify-between">
              <span className="text-text-secondary text-lg">
                Today's Attendance
              </span>
              <div className="bg-primary/10 p-4 rounded-xl">
                <CalendarCheck className="text-primary" />
              </div>
            </div>

            {attendanceError && (
              <p className="text-red-500 text-lg">
                {attendanceErrorInfo?.data?.message ??
                  "Failed to load attendance."}
              </p>
            )}

            <p className="text-white font-bold text-5xl mb-4">
              {attendanceLoading ? (
                <span className="text-3xl">...</span>
              ) : (
                `${present} / ${totalEnrolled}`
              )}
            </p>
            <p className="text-text-secondary/40 text-sm">
              {attendanceLoading ? (
                "Loading attendance..."
              ) : (
                <>
                  <span className="text-text-green font-semibold">
                    {attendancePercentage}%
                  </span>{" "}
                  present in Grade {myClass.grade}
                </>
              )}
            </p>
          </div>

          {/* CARD 3 - MY ACTIVE SUBJECTS */}
          <div className="bg-card-2 p-6 rounded-2xl border border-text-secondary/10 hover:border-primary/40 transition-all duration-300">
            <div className="flex items-start justify-between">
              <span className="text-text-secondary text-lg">
                My Active Subjects
              </span>
              <div className="bg-primary/10 p-4 rounded-xl">
                <BookOpen className="text-primary" />
              </div>
            </div>

            {activeSubjects.length === 0 ? (
              <p className="text-text-secondary/40 mt-4">
                No subjects assigned to this class.
              </p>
            ) : (
              <div className="mt-4 flex flex-wrap gap-3">
                {activeSubjects.map((subject) => (
                  <span
                    key={subject.id}
                    className="bg-primary/10 border border-primary/30 text-white font-semibold px-4 py-2 rounded-full"
                  >
                    {subject.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Overview + Learners section */}
      {/* toggle header */}
      <div className="border-b border-text-secondary/10 mt-5 space-x-8 pb-3">
        <button
          onClick={() => setIsSelected("overview")}
          className={`${isSelected === "overview" ? "border-primary border-b-3" : "border-transparent"} hover:cursor-pointer hover:scale-103 transition-all duration-300 border-b  text-primary py-5 font-bold text-lg tracking-wide`}
        >
          Overview
        </button>
        <button
          onClick={() => setIsSelected("learners")}
          className={`${isSelected === "learners" ? "border-primary border-b-3" : "border-transparent"} hover:cursor-pointer hover:scale-103 transition-all duration-300 border-b  text-primary py-5 font-bold text-lg tracking-wide`}
        >
          Learners
        </button>
      </div>

      {/* OVERVIEW SECTION (shown when the Overview tab is selected) */}
      {isSelected === "overview" && (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CLASSROOM INFORMATION */}
          <div className="bg-card-2 rounded-xl p-6 border border-text-secondary/10 hover:bg-[#2A2A2A] transition-colors duration-200">
            <h2 className="text-white font-bold text-xl tracking-wide">
              Classroom Information
            </h2>

            <div className="mt-5">
              {infoRows.map((row, idx) => (
                <div
                  key={idx}
                  className={`flex justify-between items-center py-3 px-4 ${
                    idx < infoRows.length - 1
                      ? "border-b border-text-secondary/10"
                      : ""
                  }`}
                >
                  <span className="text-text-secondary">{row.label}</span>
                  <span className="text-white font-bold text-right">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ASSIGNED SUBJECTS & MODULES */}
          <div className="bg-card-2 rounded-xl p-6 border border-text-secondary/10 hover:bg-[#2A2A2A] transition-colors duration-200">
            <h2 className="text-white font-bold text-xl tracking-wide">
              Assigned Subjects & Modules
            </h2>

            <div className="mt-5 space-y-3">
              {activeSubjects.length === 0 ? (
                <p className="text-text-secondary">
                  No subjects assigned to this class.
                </p>
              ) : (
                activeSubjects.map((subject) => (
                  <div
                    key={subject.id}
                    className="flex items-center gap-4 p-4 rounded-xl bg-background border border-text-secondary/10 hover:bg-[#2A2A2A] transition-colors duration-200"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold">{subject.name}</p>
                      <p className="text-text-secondary text-sm mt-1">
                        {subject.weekly_hours ?? 0} hours per week
                      </p>
                    </div>

                    {/* module tag */}
                    <span className="shrink-0 bg-[#064E3B] text-text-green rounded-md px-3 py-1 text-xs font-semibold inline-flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-text-green" />
                      {subject.code ?? "MODULE"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* LEARNERS SECTION (shown when the Learners tab is selected) */}
      {isSelected === "learners" && (
        <div className="mt-6 bg-card-2 rounded-xl border border-text-secondary/10 hover:bg-[#2A2A2A] transition-colors duration-200">
          <div className="p-6 pb-0">
            <div className="flex items-start justify-between">
              <h2 className="text-white font-bold text-xl tracking-wide">
                Student Attendance
              </h2>
              <div className="bg-primary/10 p-3 rounded-xl">
                <CalendarCheck className="text-primary" />
              </div>
            </div>
            <p className="text-text-secondary mt-2 text-sm">
              Attendance for {attendanceData?.date}
            </p>
          </div>

          {/* table header (desktop only) */}
          <div className="hidden md:grid grid-cols-[1.5fr_1fr_1.2fr_1fr_1.5fr] items-center gap-4 px-4 py-3 border-t border-text-secondary/10 mt-5">
            <span className="text-text-secondary font-bold text-sm">
              Student
            </span>
            <span className="text-text-secondary font-bold text-sm">
              Student ID
            </span>
            <span className="text-text-secondary font-bold text-sm">
              Today's Attendance
            </span>
            <span className="text-text-secondary font-bold text-sm">
              Overall Attendance
            </span>
            <span className="text-text-secondary font-bold text-sm text-right">
              Parent Contact
            </span>
          </div>

          {/* rows */}
          {attendanceLoading ? (
            <p className="text-text-secondary p-6">Loading learners...</p>
          ) : attendanceError ? (
            <p className="text-red-500 p-6">
              {attendanceErrorInfo?.data?.message ??
                "Failed to load attendance."}
            </p>
          ) : roll.length === 0 ? (
            <p className="text-text-secondary p-6">
              No learners in your class yet.
            </p>
          ) : (
            roll.map((learner) => (
              <div
                key={learner.learner_id}
                className="flex flex-col gap-2 md:grid md:grid-cols-[1.5fr_1fr_1.2fr_1fr_1.5fr] md:items-center md:gap-4 px-6 md:px-4 py-4 border-t border-text-secondary/10 hover:bg-[#2A2A2A] transition-colors duration-200"
              >
                {/* student */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="shrink-0 w-10 h-10 rounded-full bg-[#FFD54F] text-white font-bold text-sm flex items-center justify-center">
                    {getInitials(learner.first_name, learner.last_name) || "—"}
                  </div>
                  <span className="text-white font-bold truncate">
                    {learner.first_name} {learner.last_name}
                  </span>
                </div>

                {/* student id */}
                <div className="flex items-center gap-2">
                  <span className="md:flex-1 text-text-secondary text-sm truncate">
                    {learner.student_number || "—"}
                  </span>
                </div>

                {/* today's attendance */}
                <div>{renderStatus(learner.status)}</div>

                {/* overall attendance */}
                <span className="text-text-green font-semibold">
                  {learner.overall_attendance != null
                    ? `${learner.overall_attendance}%`
                    : "—"}
                </span>

                {/* parent contact */}
                <span className="text-text-secondary text-sm md:text-right truncate">
                  {learner.guardian && learner.guardian_phone
                    ? `${learner.guardian} (${learner.guardian_phone})`
                    : "—"}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
