import React, { useState } from "react";
import {
  Clock,
  LogIn,
  LogOut,
  Loader2,
  CalendarCheck,
  Timer,
  Briefcase,
} from "lucide-react";
import {
  useClockInMutation,
  useClockOutMutation,
  useViewMyAttendanceQuery,
} from "../../features/api";

export default function MyAttendance() {
  const [clockMessage, setClockMessage] = useState(null); // {text, type}
  //local state flips the UI instantly after a successful clock in/out,
  //without waiting for the history query to refetch.
  const [localClock, setLocalClock] = useState("none"); // "none" | "in" | "out"

  const today = new Date().toDateString();

  const [clockIn, { isLoading: isClocking }] = useClockInMutation();
  const [clockOut, { isLoading: isClockingOut }] = useClockOutMutation();

  //teacher's staff attendance history - tells us today's real state.
  const { data: historyData, refetch: refetchHistory } =
    useViewMyAttendanceQuery();

  const todayISO = new Date().toISOString().split("T")[0];
  const todayRecord = (historyData?.records ?? []).find(
    (record) => record.date === todayISO,
  );

  //currently on shift = clocked in AND not clocked out yet.
  const hasClockedIn = Boolean(todayRecord?.clock_in) || localClock === "in";
  const hasClockedOut = Boolean(todayRecord?.clock_out) || localClock === "out";

  //three UI states: not started → Clock In, on shift → Clock Out, done → finished.
  const isOnShift = hasClockedIn && !hasClockedOut;
  const finishedToday = hasClockedOut;

  const summary = historyData?.summary;

  //month name for the header of the shift records table.
  const monthLabel = new Date().toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  //only the records belonging to the current month.
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const monthlyRecords = (historyData?.records ?? []).filter((record) => {
    const d = new Date(record.date);
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  });

  //format a timestamp as time only, e.g. "08:15 AM".
  const formatTime = (value) => {
    if (!value) return "—";
    return new Date(value).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleClockIn = async () => {
    //check for geo location coordinates.
    if (!navigator.geolocation) {
      setClockMessage({
        text: "Geolocation is not supported by this browser.",
        type: "error",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const result = await clockIn({ latitude, longitude }).unwrap();

          //flip the UI to "on shift" instantly + re-sync from the server.
          setLocalClock("in");
          refetchHistory();
          setClockMessage({ text: result.message, type: "success" });
        } catch (error) {
          setClockMessage({
            text:
              error?.data?.message ?? error?.message ?? "Failed to clock in.",
            type: "error",
          });
        }
      },
      (error) => {
        setClockMessage({
          text: `Unable to get your location: ${error?.message ?? "denied"}`,
          type: "error",
        });
      },
    );
  };

  const handleClockOut = async () => {
    try {
      const clockOutResult = await clockOut().unwrap();

      //flip the UI to "finished" instantly + re-sync from the server.
      setLocalClock("out");
      refetchHistory();

      setClockMessage({
        text: clockOutResult.hours_worked
          ? `${clockOutResult.message}. Hours worked: ${clockOutResult.hours_worked}h`
          : clockOutResult.message,
        type: "success",
      });
    } catch (error) {
      setClockMessage({
        text: error?.data?.message ?? error?.message ?? "Failed to clock out.",
        type: "error",
      });
    }
  };

  //three summary cards.
  const summaryCards = [
    {
      label: "Monthly Hours Worked",
      value: `${summary?.monthly_hours ?? 0}h`,
      Icon: <Clock className="text-primary" />,
    },
    {
      label: "On-Time Rate",
      value: `${summary?.on_time_rate ?? 0}%`,
      Icon: <Timer className="text-primary" />,
    },
    {
      label: "Completed Shift Days",
      value: summary?.completed_shifts ?? 0,
      Icon: <Briefcase className="text-primary" />,
    },
  ];

  return (
    <div className="text-white py-10 px-10">
      {/* header */}
      <div>
        <h1 className="text-white text-4xl font-bold">My Attendance</h1>
        <p className="text-text-secondary mt-3 text-lg">
          View your personal attendance records.
        </p>
      </div>

      {/* CLOCK IN/OUT SECTION - same as the teacher dashboard */}
      <div className="mt-6 flex flex-col lg:flex-row justify-between bg-primary/10 border border-primary rounded-2xl py-8 px-7 gap-5">
        {/* left side */}
        <div className="flex">
          <div className="bg-primary/10 p-4 rounded-2xl flex items-center h-15 w-15 justify-center text-primary">
            <Clock />
          </div>

          <div className="ml-5">
            <h1 className="uppercase text-text-secondary tracking-wide font-bold">
              Faculty time tracker
            </h1>
            <h1 className="text-white text-2xl lg:text-3xl font-bold">
              {finishedToday
                ? "Shift complete. Great job today!"
                : isOnShift
                  ? "Clocked in. Have a great shift!"
                  : "Ready to start your school shift?"}
            </h1>
            <p className="text-text-secondary mt-4">Today is {today}</p>

            {clockMessage && (
              <p
                className={`mt-3 font-semibold ${
                  clockMessage.type === "success"
                    ? "text-text-green"
                    : "text-red-500"
                }`}
              >
                {clockMessage.text}
              </p>
            )}
          </div>
        </div>

        {/* right side - one button per state: Clock In / Clock Out / Finished */}
        <div className="flex items-center">
          {!isOnShift && !finishedToday && (
            <button
              onClick={handleClockIn}
              disabled={isClocking}
              className="flex items-center text-black justify-center h-15 w-60 shadow-xl hover:scale-103 transition-all duration-300 hover:cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed bg-primary gap-3 rounded-2xl"
            >
              {isClocking ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  <LogIn />
                  Clock In Now
                </>
              )}
            </button>
          )}

          {isOnShift && (
            <button
              onClick={handleClockOut}
              disabled={isClockingOut}
              className="flex items-center justify-center h-15 w-60 shadow-xl hover:scale-103 transition-all duration-300 hover:cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed bg-primary gap-3 rounded-2xl"
            >
              {isClockingOut ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  <LogOut />
                  Clock Out Now
                </>
              )}
            </button>
          )}

          {finishedToday && (
            <div className="flex items-center justify-center h-15 w-60 rounded-2xl bg-primary/10 border border-primary/40 text-primary font-bold px-3 text-center">
              Clocked out for today
            </div>
          )}
        </div>
      </div>

      {/* THREE SUMMARY CARDS */}
      <div className="mt-7 gap-5 grid md:grid-cols-3">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="bg-card-2 p-6 rounded-2xl border border-text-secondary/10 hover:border-primary/40 transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <span className="text-text-secondary text-lg">{card.label}</span>
              <div className="bg-primary/10 p-4 rounded-xl">{card.Icon}</div>
            </div>
            <p className="text-white font-bold text-4xl mt-4">{card.value}</p>
          </div>
        ))}
      </div>

      {/* SHIFT RECORDS TABLE */}
      <div className="mt-8 bg-card-2 border border-text-secondary/10 rounded-2xl overflow-hidden">
        {/* header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-text-secondary/10">
          <div>
            <h2 className="text-white text-xl font-bold">
              Shift Records for {monthLabel}
            </h2>
            <p className="text-text-secondary text-sm mt-1">
              Your clock-in and clock-out history for the month.
            </p>
          </div>
          <div className="bg-primary/10 p-3 rounded-xl">
            <CalendarCheck className="text-primary" />
          </div>
        </div>

        <table className="w-full text-left">
          <thead className="border-b border-text-secondary/10">
            <tr>
              <th className="px-6 py-4 text-text-secondary font-semibold text-sm">
                Date
              </th>
              <th className="px-6 py-4 text-text-secondary font-semibold text-sm">
                Clock In
              </th>
              <th className="px-6 py-4 text-text-secondary font-semibold text-sm">
                Clock Out
              </th>
              <th className="px-6 py-4 text-text-secondary font-semibold text-sm">
                Duration
              </th>
              <th className="px-6 py-4 text-text-secondary font-semibold text-sm">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {monthlyRecords.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-10 text-center text-text-secondary"
                >
                  No shift records this month yet.
                </td>
              </tr>
            )}

            {monthlyRecords.map((record) => (
              <tr
                key={record.id}
                className="border-b border-text-secondary/10 hover:bg-text-secondary/5 transition-colors"
              >
                {/* Date */}
                <td className="px-6 py-4 text-text-secondary">
                  {new Date(record.date).toLocaleDateString("en-GB", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}
                </td>

                {/* Clock In */}
                <td className="px-6 py-4 text-text-secondary">
                  {formatTime(record.clock_in)}
                </td>

                {/* Clock Out */}
                <td className="px-6 py-4 text-text-secondary">
                  {formatTime(record.clock_out)}
                </td>

                {/* Duration */}
                <td className="px-6 py-4 text-text-secondary">
                  {record.hours_worked != null
                    ? `${record.hours_worked}h`
                    : "—"}
                </td>

                {/* Status */}
                <td className="px-6 py-4">
                  {record.hours_worked != null ? (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-text-green/10 text-text-green">
                      Completed
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                      Not clocked out yet
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
