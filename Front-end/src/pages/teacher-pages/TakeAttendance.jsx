import React, { useState } from "react";
import { CalendarCheck, UserCheck, UserX, Users } from "lucide-react";
import {
  useGetTodayAttendanceQuery,
  useMarkLearnerAttendanceMutation,
  useBulkMarkLearnerAttendanceMutation,
} from "../../features/api";

export default function TakeAttendance() {
  //fetch today's attendance roll (learners + their current status).
  const {
    data: attendanceData,
    isLoading,
    isError,
    error: attendanceErrorInfo,
  } = useGetTodayAttendanceQuery();

  //mutation that upserts a single learner's status for today.
  const [markLearnerAttendance] = useMarkLearnerAttendanceMutation();

  //mutation that marks the whole class present or absent.
  const [bulkMarkLearnerAttendance, { isLoading: isBulkSaving }] =
    useBulkMarkLearnerAttendanceMutation();

  const [feedback, setFeedback] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const summary = attendanceData?.summary;
  const roll = attendanceData?.roll ?? [];

  const getInitials = (firstName, lastName) => {
    const first = firstName?.[0] ?? "";
    const last = lastName?.[0] ?? "";
    return `${first}${last}`.toUpperCase() || "??";
  };

  //summary cards shown in the header (left).
  const summaryCards = [
    { label: "Total Enrolled", value: summary?.total_enrolled ?? 0 },
    { label: "Present", value: summary?.present ?? 0, color: "text-text-green" },
    { label: "Absent", value: summary?.absent ?? 0, color: "text-red-500" },
  ];

  const handleToggle = async (learner, status) => {
    setFeedback(null);
    setErrorMsg(null);

    try {
      await markLearnerAttendance({
        learner_id: learner.learner_id,
        status,
      }).unwrap();

      setFeedback(
        `${learner.first_name} ${learner.last_name} marked ${status}`,
      );
    } catch (err) {
      setErrorMsg(
        err?.data?.message ??
          "Failed to update attendance. Please try again.",
      );
    }
  };

  const handleBulk = async (status) => {
    setFeedback(null);
    setErrorMsg(null);

    try {
      await bulkMarkLearnerAttendance({ status }).unwrap();
      setFeedback(`Whole class marked ${status}`);
    } catch (err) {
      setErrorMsg(
        err?.data?.message ?? `Failed to mark all ${status}. Try again.`,
      );
    }
  };

  return (
    <div className="text-white py-10 px-10">
      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-4xl font-bold">Take Attendance</h1>
          <p className="text-text-secondary mt-3 text-lg">
            Mark your learners present or absent for today.
          </p>
        </div>

        <div className="bg-card-2 border border-text-secondary/10 rounded-2xl px-5 py-3 flex items-center gap-3">
          <CalendarCheck className="text-primary" />
          <span className="text-text-secondary">
            {attendanceData?.date ?? "—"}
          </span>
        </div>
      </div>

      {/* summary + bulk actions */}
      <div className="mt-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* summary cards (left) */}
        <div className="flex flex-wrap items-center gap-4">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className="bg-card-2 border border-text-secondary/10 rounded-2xl px-6 py-4 flex items-center gap-4"
            >
              <div className="bg-primary/10 p-3 rounded-xl">
                <Users className="text-primary" size={20} />
              </div>
              <div>
                <p className="text-text-secondary text-sm">{card.label}</p>
                <p
                  className={`text-2xl font-bold ${
                    card.color ?? "text-white"
                  }`}
                >
                  {card.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* bulk actions (right) */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleBulk("absent")}
            disabled={isBulkSaving}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white rounded-2xl px-5 py-3 text-sm font-semibold transition-colors"
          >
            <UserX size={16} />
            Mark All Absent
          </button>
          <button
            onClick={() => handleBulk("present")}
            disabled={isBulkSaving}
            className="flex items-center gap-2 bg-text-green hover:opacity-90 text-white rounded-2xl px-5 py-3 text-sm font-semibold transition-colors"
          >
            <UserCheck size={16} />
            Mark All Present
          </button>
        </div>
      </div>

      {/* inline feedback */}
      {feedback && (
        <p className="mt-4 bg-text-green/10 border border-text-green/20 text-text-green rounded-xl px-4 py-3">
          {feedback}
        </p>
      )}
      {errorMsg && (
        <p className="mt-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl px-4 py-3">
          {errorMsg}
        </p>
      )}

      {/* learner table */}
      <div className="mt-6 bg-card-2 border border-text-secondary/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="border-b border-text-secondary/10">
            <tr>
              <th className="px-6 py-4 text-text-secondary font-semibold text-sm">
                #
              </th>
              <th className="px-6 py-4 text-text-secondary font-semibold text-sm">
                Student
              </th>
              <th className="px-6 py-4 text-text-secondary font-semibold text-sm">
                Student ID
              </th>
              <th className="px-6 py-4 text-text-secondary font-semibold text-sm">
                Guardian Contact
              </th>
              <th className="px-6 py-4 text-text-secondary font-semibold text-sm">
                Attendance Status
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
                  {attendanceErrorInfo?.data?.message ??
                    "Failed to load attendance."}
                </td>
              </tr>
            )}

            {!isLoading && !isError && roll.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-10 text-center text-text-secondary"
                >
                  No learners in your class yet.
                </td>
              </tr>
            )}

            {!isLoading &&
              !isError &&
              roll.map((learner) => (
                <tr
                  key={learner.learner_id}
                  className="border-b border-text-secondary/10 hover:bg-text-secondary/5 transition-colors"
                >
                  {/* number */}
                  <td className="px-6 py-4 text-text-secondary">
                    {learner.index}
                  </td>

                  {/* Student — avatar + name */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
                        {getInitials(learner.first_name, learner.last_name)}
                      </div>
                      <span className="text-white font-medium">
                        {learner.first_name} {learner.last_name}
                      </span>
                    </div>
                  </td>

                  {/* Student ID */}
                  <td className="px-6 py-4 text-text-secondary font-mono text-sm">
                    {learner.student_number}
                  </td>

                  {/* Guardian Contact */}
                  <td className="px-6 py-4 text-text-secondary text-sm">
                    {learner.guardian && learner.guardian_phone
                      ? `${learner.guardian} (${learner.guardian_phone})`
                      : "—"}
                  </td>

                  {/* Attendance Status toggle */}
                  <td className="px-6 py-4">
                    <div className="bg-background border border-text-secondary/10 rounded-xl p-1 flex items-center gap-1 w-fit">
                      <button
                        onClick={() => handleToggle(learner, "present")}
                        disabled={learner.status === "present"}
                        className={`px-4 py-1.5 rounded-lg text-sm font-semibold inline-flex items-center gap-2 transition-colors ${
                          learner.status === "present"
                            ? "bg-text-green text-white"
                            : "text-text-secondary hover:text-white hover:bg-text-secondary/10"
                        }`}
                      >
                        <UserCheck size={15} />
                        Present
                      </button>
                      <button
                        onClick={() => handleToggle(learner, "absent")}
                        disabled={learner.status === "absent"}
                        className={`px-4 py-1.5 rounded-lg text-sm font-semibold inline-flex items-center gap-2 transition-colors ${
                          learner.status === "absent"
                            ? "bg-red-500 text-white"
                            : "text-text-secondary hover:text-white hover:bg-text-secondary/10"
                        }`}
                      >
                        <UserX size={15} />
                        Absent
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
