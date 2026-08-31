import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useAuth } from "../../context/authContext";
import Button from "../../components/global/Button";
import {
  setCreateTeacher,
  setCreateLearner,
  setCreateClass,
} from "../../features/globalSlice";
import AddTeacher from "../../components/admin-components/AddTeacher";
import AddLearner from "../../components/admin-components/AddLearner";
import CreateClass from "../../components/admin-components/CreateClass";
import {
  CalendarCheck,
  ChevronRight,
  GraduationCap,
  Layers,
  Loader,
  Loader2,
  Plus,
  UserPlus,
  Users,
} from "lucide-react";
import AdminStatsCard from "../../components/cards/AdminStatsCard";
import AttendanceChart from "../../components/charts/AttendanceChart";
import RecentActivity from "../../components/admin-components/RecentActivity";
import ClassOverview from "../../components/admin-components/ClassOverview";
import {
  useGetAllClassesQuery,
  useGetLearnerAttendanceOverviewQuery,
  useGetLearnersQuery,
  useGetStaffOverviewQuery,
  useGetTeachersQuery,
} from "../../features/api";

export default function AdminDashboardHome() {
  const [selected, setSelected] = useState("Add Teacher");
  const { user, profile, loading, role } = useAuth();
  const dispatch = useDispatch();
  const isSidebarCollapsed = useSelector(
    (state) => state.global.isSidebarCollapsed,
  );
  const createTeacherOpen = useSelector(
    (state) => state.global.isCreateTeacherOpen,
  );
  const createLearnerOpen = useSelector(
    (state) => state.global.isCreateLearnerOpen,
  );
  const createClassOpen = useSelector(
    (state) => state.global.isCreateClassOpen,
  );

  //fetch all teachers.
  const {
    data: teachers,
    error,
    isError,
    isLoading,
    refetch: refetchTeachers,
  } = useGetTeachersQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  //fetch all learners.
  const {
    data: learners = [],
    error: errorLearners,
    isError: isErrorLearners,
    isLoading: isloadingLearners,
    refetch: refetchLearners,
  } = useGetLearnersQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  //fetch all classes.
  const {
    data: classes = [],
    error: errorClasses,
    isError: isErrorClasses,
    isLoading: isloadingClasses,
    refetch: refetchClasses,
  } = useGetAllClassesQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  //fetch all learner attendance.
  const {
    data: attendanceOverview,
    isError: attendError,
    isLoading: attendLoading,
  } = useGetLearnerAttendanceOverviewQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const {
    data: staffOverview,
    isError: staffError,
    isLoading: staffLoading,
  } = useGetStaffOverviewQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const staffAttendancePercentage = staffOverview?.summary?.total_expected
    ? Number(
        (
          (staffOverview.summary.currently_present /
            staffOverview.summary.total_expected) *
          100
        ).toFixed(1),
      )
    : 0;

  const presentTeachers = staffOverview?.summary?.currently_present ?? 0;
  const totalTeachers = staffOverview?.summary?.total_expected ?? 0;
  const notClockedIn = staffOverview?.summary?.pending_clock_in ?? 0;

  const learnerSummary = attendanceOverview?.summary;

  const attendancePercentage =
    attendanceOverview?.summary?.attendance_percentage;

  console.log("here is THE FETCHGED DATA", staffOverview);
  return (
    <div className={`${isSidebarCollapsed ? "pl-30 pr-10" : "px-10"} py-10`}>
      {/* header section */}
      <div className="flex justify-between items-center">
        {/* left-side */}
        <div>
          <h1 className="text-white text-4xl font-bold">
            Good morning, <span className="capitalize">{role} 👋</span>{" "}
          </h1>
          <p className="text-lg text-text-secondary mt-4">
            Here's whats happening at your school today.
          </p>
        </div>

        {/* right-side */}
        <div className="flex gap-4">
          <Button
            onClick={() => dispatch(setCreateTeacher(true))}
            selected={selected}
            setSelected={setSelected}
            Icon={
              <Plus
                className={`${selected === "Add Teacher" ? "text-black" : "text-primary"}`}
              />
            }
            title="Add Teacher"
          />
          <Button
            onClick={() => dispatch(setCreateLearner(true))}
            selected={selected}
            setSelected={setSelected}
            Icon={
              <UserPlus
                className={`${selected === "Add Learner" ? "text-black" : "text-primary"}`}
              />
            }
            title="Add Learner"
          />
          <Button
            onClick={() => dispatch(setCreateClass(true))}
            selected={selected}
            setSelected={setSelected}
            Icon={
              <Layers
                className={`${selected === "Create Class" ? "text-black" : "text-primary"}`}
              />
            }
            title="Create Class"
          />
        </div>
      </div>

      {/* CONTENT DASHBOARD */}
      <div className="mt-7 gap-5 grid md:grid-cols-4">
        {/* teachers */}
        <AdminStatsCard
          value={
            isLoading ? (
              <Loader2 className="animate-spin" />
            ) : isError ? (
              <P className="text-primary text-lg">Failed to load teachers.</P>
            ) : (
              (teachers?.length ?? 0)
            )
          }
          title="Total Teachers"
          description={
            isLoading ? (
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce"></span>
              </div>
            ) : (
              `${teachers?.length} active staff members`
            )
          }
          Icon={<Users className="text-primary" />}
        />

        {/* learners */}
        <AdminStatsCard
          value={
            isloadingLearners ? (
              <Loader2 className="animate-spin" />
            ) : isError ? (
              <P className="text-primary text-lg">Failed to load learners.</P>
            ) : (
              (learners.learners?.length ?? 0)
            )
          }
          title="Total Learners"
          description={
            isloadingLearners ? (
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce"></span>
              </div>
            ) : (
              `${learners.learners?.length} enrolled students`
            )
          }
          Icon={<GraduationCap className="text-primary" />}
        />

        {/* classes */}
        <AdminStatsCard
          value={
            isloadingLearners ? (
              <Loader2 className="animate-spin" />
            ) : isError ? (
              <P className="text-primary text-lg">Failed to load classes.</P>
            ) : (
              (classes.classes?.length ?? 0)
            )
          }
          title="Total Classes"
          description={
            isloadingClasses ? (
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce"></span>
              </div>
            ) : (
              `${classes.classes?.length} classrooms active`
            )
          }
          Icon={<Layers className="text-primary" />}
        />

        {/* attendance */}
        <AdminStatsCard
          value={
            attendLoading ? (
              <Loader2 className="animate-spin" />
            ) : isError ? (
              <P className="text-primary text-lg">Failed to load attendance.</P>
            ) : (
              (`${attendanceOverview?.summary?.attendance_percentage}` ?? 0)
            )
          }
          title="Today's Attendance"
          description={
            attendLoading ? (
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce"></span>
              </div>
            ) : (
              `${attendanceOverview?.summary?.attendance_percentage}% Schoolwide overall`
            )
          }
          Icon={<CalendarCheck className="text-primary" />}
        />
      </div>

      {/* CHART STATS */}
      <div className="mt-7 grid grid-cols-[2fr_1fr] gap-8">
        <AttendanceChart />
        {/* Today's staff attendance */}
        <div className="flex flex-col">
          {/* first card */}
          <div className="bg-card-2 rounded-2xl px-6 py-7  border border-text-secondary/10">
            {/* header */}
            <div className="flex justify-between">
              {" "}
              <h1 className="text-white text-xl font-semibold tracking-wide">
                Today's Staff Attendance
              </h1>
              <button className="flex text-lg text-primary hover:scale-110 hover:cursor-pointer transition-all duration-300">
                View <ChevronRight />
              </button>
            </div>

            {/* stats */}
            <div className="grid grid-cols-3 mt-4 gap-4">
              <div className="bg-text-green/5 border border-text-green/10 rounded-2xl p-5">
                <p className="text-text-green">Present</p>
                <h2 className="text-2xl font-bold text-text-green mt-5">
                  {presentTeachers}
                </h2>
              </div>
              {/* second-card */}
              <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5">
                <p className="text-primary">Not Clocked</p>
                <h2 className="text-primary text-2xl font-bold mt-auto">
                  {notClockedIn}
                </h2>
              </div>
              <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-5">
                <p className="text-red-500">Absent</p>
                <h2 className="text-red-500 text-2xl font-bold mt-5">
                  {staffOverview?.summary?.marked_absent ?? 0}
                </h2>
              </div>
            </div>

            {/*small line */}
            <div className="w-full h-0.25 bg-text-secondary/10 mt-4" />

            <div className="flex justify-between mt-5">
              <span className="text-text-secondary">
                Expected Staff: {teachers?.length}
              </span>
              <span className="text-text-green">
                {staffAttendancePercentage}% currently on premises
              </span>
            </div>
          </div>

          {/* second card */}
          <div className="bg-card-2 border border-text-secondary/10 rounded-2xl p-5 mt-5">
            {/* header */}
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-white ">
                Today's Learner Attendance
              </h1>
              <span className="text-primary text-lg font-bold">
                {" "}
                {attendLoading ? (
                  <Loader2 className="animate-spin" />
                ) : attendError ? (
                  "—"
                ) : (
                  `${attendancePercentage}%`
                )}
              </span>
            </div>

            {/* progress bar */}
            <div className="h-4 w-full rounded-full mt-4 overflow-hidden bg-red-500/60">
              {/* filler bar */}
              <div
                className="h-full  bg-text-green"
                style={{ width: `${attendancePercentage}` }}
              />
            </div>

            {/* target values */}
            <div className="flex justify-between mt-2 text-text-secondary/50 ">
              <p>0%</p>
              <p>Target: 95%</p>
              <p>100%</p>
            </div>

            {/*small line */}
            <div className="w-full h-0.25 bg-text-secondary/10 mt-4" />
            {/* present/ absent */}
            <div className="flex gap-20">
              <div className="mt-4 flex items-center gap-3">
                <div className=" bg-text-green h-3 w-3 rounded-full" />
                <p className="text-text-secondary">
                  Present:
                  <span className="ml-2 text-white font-bold text-lg">
                    {" "}
                    {attendLoading
                      ? "..."
                      : (learnerSummary?.present_today ?? 0)}
                  </span>
                </p>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <div className=" bg-red-500 h-3 w-3 rounded-full" />
                <p className="text-text-secondary">
                  Absent:
                  <span className="ml-2 text-white font-bold text-lg">
                    {" "}
                    {attendLoading
                      ? "..."
                      : (learnerSummary?.absent_today ?? 0)}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RECENT ACTIVITY */}
      <div className="grid grid-cols-2 mt-8 gap-8">
        {" "}
        <RecentActivity />
        <ClassOverview />
      </div>

      {/* MODALS */}
      {createTeacherOpen && (
        <AddTeacher
          classes={classes?.classes ?? []}
          onCreated={refetchTeachers}
          onClose={() => dispatch(setCreateTeacher(false))}
        />
      )}
      {createLearnerOpen && (
        <AddLearner
          classes={classes?.classes ?? []}
          onCreated={refetchLearners}
          onClose={() => dispatch(setCreateLearner(false))}
        />
      )}
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
