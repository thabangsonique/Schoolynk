import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useAuth } from "../../context/authContext";
import {
  BookOpen,
  Users,
  CalendarCheck,
  Clock,
  LogIn,
  Loader2,
} from "lucide-react";
import AdminStatsCard from "../../components/cards/AdminStatsCard";
import Login from "../Login";
import { useGetMyClassesQuery } from "../../features/api";
import { useClockInMutation } from "../../features/api";
import { useGetTodayAttendanceQuery } from "../../features/api";
import { useViewMyAttendanceQuery } from "../../features/api";
import { isAction } from "@reduxjs/toolkit";

export default function TeacherDashboardHome() {
  const { user, profile } = useAuth();
  const isSidebarCollapsed = useSelector(
    (state) => state.global.isSidebarCollapsed,
  );
  const firstName = profile?.first_name ?? "Teacher";
  const [isClocked, setIsClockedIn] = useState(false);
  const [clockMessage, setClockMessage] = useState(null); // {text, type}

  const today = new Date().toDateString();

  //queries
  const { data, isLoading, isError, error } = useGetMyClassesQuery();
  const [clockIn, { isLoading: isClocking }] = useClockInMutation();
  const [clockOut, { isLoading: isClockingOut }] = useClockInMutation();

  //check the backend for whether the teacher already clocked in TODAY.
  const { data: historyData } = useViewMyAttendanceQuery();
  const todayISO = new Date().toISOString().split("T")[0];
  const todayHasClockedIn = (historyData?.records ?? []).some(
    (record) => record.date === todayISO && record.clock_in,
  );

  //already clocked in = set on this page OR already on the backend.
  const alreadyClockedIn = isClocked || todayHasClockedIn;

  //fetch today's attendance for the teacher's class.
  const { data: attendanceData, isLoading: attendanceLoading } =
    useGetTodayAttendanceQuery();

  const myClass = data?.response;
  console.log("CLASS DATA:", myClass);

  const summary = attendanceData?.summary;
  const present = summary?.present ?? 0;
  const totalEnrolled = summary?.total_enrolled ?? 0;
  const attendancePercentage =
    totalEnrolled > 0 ? Math.round((present / totalEnrolled) * 100) : 0;

  const activeSubjects = myClass?.subjects ?? [];
  const learnerCount = myClass?.learners?.length ?? 0;

  //sample timetable - swap for a real timetable endpoint when available.
  const todaySchedule = [
    {
      subject: "Mathematics",
      topic: "Fractions & Mixed Numbers",
      period: "Period 1 (08:30 – 09:30)",
      room: "Room 204",
    },
    {
      subject: "English",
      topic: "Parts of Speech",
      period: "Period 2 (09:40 – 10:40)",
      room: "Room 204",
    },
    {
      subject: "Science",
      topic: "States of Matter",
      period: "Period 3 (11:00 – 12:00)",
      room: "Room 204",
    },
    {
      subject: "Geography",
      topic: "Map Reading",
      period: "Period 4 (12:10 – 13:10)",
      room: "Room 204",
    },
  ];

  //formatted date like "Tuesday, 18 Aug".
  const scheduleDate = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });

  //teacher's assuigned class.
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

          //mark as clocked in so the button disables straight away.
          setIsClockedIn(true);
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

      setIsClockedIn(false);
      setClockMessage({ text: clockOutResult.message, type: "success" });
    } catch (error) {
      setClockMessage({
        text: error?.data?.message ?? error?.message ?? "Failed to clock in.",
        type: "error",
      });
    }
  };

  return (
    <div className={`${isSidebarCollapsed ? "pl-30 pr-10" : "px-10"} py-10`}>
      {/* header section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-white text-4xl font-bold">
            Good morning, <span className="capitalize">{firstName} 👋</span>
          </h1>
          <p className="text-lg text-text-secondary mt-4">
            Here's whats happening in your class today.
          </p>
        </div>
      </div>

      {/* CLOCK IN SECTION */}
      <div className="flex mt-5 justify-between bg-primary/10 border border-primary rounded-2xl py-10 px-7">
        {/* left side */}
        <div className="flex">
          {/* icon */}
          <div className="bg-primary/10 p-4 rounded-2xl flex items-center h-15 w-15 justify-center text-primary">
            <Clock />
          </div>

          {/* text */}
          <div className="ml-5">
            <div>
              <h1 className="uppercase text-text-secondary tracking-wide font-bold">
                Faculty time tracker
              </h1>
            </div>
            <h1 className="text-white text-3xl font-bold ">
              Ready to start your school shift?
            </h1>
            <p className="text-text-secondary mt-4">Today is {today}</p>

            {/* feedback message */}
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

        {/* right side */}
        {/* clockin button */}
        {!alreadyClockedIn && (
          <button
            onClick={handleClockIn}
            disabled={isClocking || alreadyClockedIn}
            className="flex items-center justify-center h-15 w-60 shadow-xl hover:scale-103 transition-all duration-300 hover:cursor-pointer bg-primary gap-3 rounded-2xl"
          >
            {isClocking ? (
              <Loader2 className="animate-spin" />
            ) : alreadyClockedIn ? (
              "Clocked in for today."
            ) : (
              <>
                {" "}
                <LogIn />
                Clock In Now
              </>
            )}
          </button>
        )}

        {alreadyClockedIn && (
          <button
            onClick={handleClockOut}
            disabled={isClockingOut}
            className="flex items-center justify-center h-15 w-60 shadow-xl hover:scale-103 transition-all duration-300 hover:cursor-pointer bg-primary gap-3 rounded-2xl px-3"
          >
            {isClocking ? (
              <Loader2 className="animate-spin" />
            ) : alreadyClockedIn ? (
              <p className="text-black/50">
                Clocked in for today. <br />
                <span className="font-bold text-lg ml-2 text-black">
                  Clock Out.
                </span>{" "}
              </p>
            ) : (
              <>
                {" "}
                <LogIn />
                Clock In Now
              </>
            )}
          </button>
        )}
      </div>

      {/* CONTENT DASHBOARD */}
      <div className="mt-7 gap-5 grid md:grid-cols-3">
        <AdminStatsCard
          value={myClass?.name ?? "-"}
          isError={isError}
          loadingClass={isLoading}
          title="My Assigned Class"
          description={`${learnerCount} learners enrolled in your class`}
          Icon={<Users className="text-primary" />}
        />
        <AdminStatsCard
          value={attendanceLoading ? "..." : `${present} / ${totalEnrolled}`}
          isError={isError}
          title="Today's Attendance"
          description={
            attendanceLoading ? (
              "Loading attendance..."
            ) : (
              <>
                <span className="text-text-green font-semibold">
                  {attendancePercentage}%
                </span>{" "}
                present today
              </>
            )
          }
          Icon={<CalendarCheck className="text-primary" />}
        />
        <AdminStatsCard
          value={activeSubjects.length}
          isError={isError}
          title="My Active Subjects"
          description={
            activeSubjects.length > 0
              ? activeSubjects.map((subject) => subject.name).join(", ")
              : "No subjects assigned to your class"
          }
          Icon={<BookOpen className="text-primary" />}
        />
      </div>

      {/* TODAY'S TEACHING SCHEDULE */}
      <div className="mt-8 [font-family:Poppins,sans-serif]">
        {/* header row */}
        <div className="flex justify-between items-center">
          <h2 className="text-[#E0E0E0] text-xl font-bold">
            Today's Teaching Schedule
          </h2>
          <span className="text-[#FFD54F] font-bold">{scheduleDate}</span>
        </div>

        {/* schedule items */}
        <div className="mt-5 flex flex-col gap-4">
          {todaySchedule.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-4 p-4 mb-3 rounded-2xl bg-card-2 border border-text-secondary/10 hover:bg-[#2A2A2A] transition-colors duration-200"
            >
              {/* numbered badge */}
              <span className="bg-[#FFD54F] text-white font-bold text-sm w-8 h-8 flex items-center justify-center rounded-lg shrink-0">
                {idx + 1}
              </span>

              {/* subject + topic + period/room */}
              <div className="flex-1 min-w-0">
                <p className="text-[#E0E0E0] font-bold text-lg">
                  {item.subject}
                  <span className="text-[#9CA3AF] font-normal">
                    {" "}
                    — {item.topic}
                  </span>
                </p>
                <p className="text-[#9CA3AF] text-sm mt-1">
                  {item.period} • {item.room}
                </p>
              </div>

              {/* status button */}
              <button className="shrink-0 border border-gray-600 text-gray-300 px-3 py-1 rounded-lg text-sm">
                Scheduled
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
