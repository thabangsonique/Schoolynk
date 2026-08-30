import React from "react";
import { useSelector } from "react-redux";
import { BookOpen, CalendarCheck, Layers } from "lucide-react";
import {
  useGetMyClassesQuery,
  useGetTodayAttendanceQuery,
} from "../../features/api";

export default function MyClass() {
  const isSidebarCollapsed = useSelector(
    (state) => state.global.isSidebarCollapsed,
  );

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

  //summary of today's attendance.
  const summary = attendanceData?.summary;
  const totalEnrolled = summary?.total_enrolled ?? 0;
  const present = summary?.present ?? 0;
  const attendancePercentage =
    totalEnrolled > 0
      ? Math.round((present / totalEnrolled) * 100)
      : 0;

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
          {classErrorInfo?.data?.message ??
            "Failed to load your class."}
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
            <p className="text-white font-bold text-5xl mb-4">
              {myClass.name}
            </p>
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
    </div>
  );
}