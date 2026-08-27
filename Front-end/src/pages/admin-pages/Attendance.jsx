import React, { useState } from "react";
import {
  CalendarDays,
  Check,
  GraduationCap,
  Search,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import {
  useGetLearnerAttendanceOverviewQuery,
  useGetStaffOverviewQuery,
} from "../../features/api";

const today = new Date().toISOString().split("T")[0];

const formatDate = (date) =>
  date ? new Date(`${date}T00:00:00`).toLocaleDateString() : "-";

const statusLabels = {
  clocked_in: "Clocked In",
  clocked_out: "Completed Shift",
  late: "Clocked In",
  absent: "Absent",
  pending: "Not Clocked In",
};

function SummaryCard({ label, value, color = "text-white", icon: Icon }) {
  return (
    <div className="rounded-xl border border-text-secondary/10 bg-card-2 px-5 py-4">
      <p className={`text-sm font-medium ${color}`}>{label}</p>
      <div className="mt-2 flex items-center justify-between">
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
        {Icon && <Icon size={21} className={color} />}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const isPresent = ["clocked_in", "clocked_out", "present"].includes(status);
  const isAbsent = status === "absent";
  const badgeClass = isPresent
    ? "border-text-green/30 bg-text-green/10 text-text-green"
    : isAbsent
      ? "border-red-400/30 bg-red-400/10 text-red-400"
      : "border-text-secondary/20 bg-text-secondary/10 text-text-secondary";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold ${badgeClass}`}>
      {isPresent ? <Check size={13} /> : isAbsent ? <X size={13} /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {statusLabels[status] ?? status}
    </span>
  );
}

export default function Attendance() {
  const [selectedDate, setSelectedDate] = useState(today);
  const [attendanceType, setAttendanceType] = useState("staff");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");

  const staffQuery = useGetStaffOverviewQuery(selectedDate);
  const learnerQuery = useGetLearnerAttendanceOverviewQuery(selectedDate);
  const staffData = staffQuery.data;
  const learnerData = learnerQuery.data;
  const staffSummary = staffData?.summary ?? {};
  const learnerSummary = learnerData?.summary ?? {};

  const staffRows = [
    ...(staffData?.staff?.present ?? []),
    ...(staffData?.staff?.late ?? []),
    ...(staffData?.staff?.absent ?? []),
  ];
  const learnerRows = [
    ...(learnerData?.learners?.present ?? []),
    ...(learnerData?.learners?.absent ?? []),
    ...(learnerData?.learners?.pending ?? []),
  ];

  const filteredStaff = staffRows.filter((record) => {
    const name = record.teacher?.name?.toLowerCase() ?? "";
    const matchesSearch = name.includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || record.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredLearners = learnerRows.filter((record) => {
    const query = search.toLowerCase();
    const matchesSearch =
      record.name?.toLowerCase().includes(query) ||
      record.student_number?.toLowerCase().includes(query);
    const matchesStatus = statusFilter === "all" || record.status === statusFilter;
    const matchesClass = classFilter === "all" || record.class?.id === classFilter;
    return matchesSearch && matchesStatus && matchesClass;
  });

  const classes = [...new Map(
    learnerRows.filter((record) => record.class).map((record) => [record.class.id, record.class]),
  ).values()];
  const isLoading = attendanceType === "staff" ? staffQuery.isLoading : learnerQuery.isLoading;
  const isError = attendanceType === "staff" ? staffQuery.isError : learnerQuery.isError;

  return (
    <div className="px-8 py-8 text-white">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 className="text-4xl font-bold">Attendance</h1>
          <p className="mt-3 text-lg text-text-secondary">
            Real-time faculty time tracking and student roll call records.
          </p>
        </div>
        <label className="flex items-center gap-3 rounded-lg border border-text-secondary/10 bg-card-2 px-3 py-2 shadow-lg">
          <CalendarDays size={18} className="text-text-secondary" />
          <input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} className="bg-transparent text-sm font-semibold text-white outline-none" aria-label="Select attendance date" />
        </label>
      </div>

      <div className="mt-8 inline-flex rounded-xl border border-text-secondary/10 bg-card-2 p-1">
        <button onClick={() => { setAttendanceType("staff"); setSearch(""); setStatusFilter("all"); }} className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold ${attendanceType === "staff" ? "bg-primary text-black" : "text-text-secondary"}`}>
          <UserCheck size={16} /> Staff Attendance
        </button>
        <button onClick={() => { setAttendanceType("learner"); setSearch(""); setStatusFilter("all"); }} className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold ${attendanceType === "learner" ? "bg-primary text-black" : "text-text-secondary"}`}>
          <GraduationCap size={16} /> Learner Attendance
        </button>
      </div>

      {attendanceType === "staff" ? (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard label="Total Expected" value={`${staffSummary.total_expected ?? 0} Staff`} icon={Users} />
            <SummaryCard label="Currently Present" value={`${staffSummary.currently_present ?? 0} Staff`} color="text-text-green" icon={UserCheck} />
            <SummaryCard label="Pending Clock-In" value={`${staffSummary.pending_clock_in ?? 0} Staff`} color="text-primary" icon={Users} />
            <SummaryCard label="Marked Absent" value={`${staffSummary.marked_absent ?? 0} Staff`} color="text-red-400" icon={X} />
          </div>

          <AttendanceToolbar search={search} setSearch={setSearch} statusFilter={statusFilter} setStatusFilter={setStatusFilter} options={["all", "clocked_in", "clocked_out", "pending", "absent"]} />
          <div className="mt-5 overflow-x-auto rounded-xl border border-text-secondary/10 bg-card-2 p-5">
            <table className="w-full min-w-200 text-left text-sm"><thead><tr className="border-b border-text-secondary/10 text-text-secondary"><th className="px-4 py-3">Staff Member</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Clock In</th><th className="px-4 py-3">Clock Out</th><th className="px-4 py-3">Duration</th><th className="px-4 py-3">Status</th></tr></thead><tbody>{renderState(isLoading, isError, filteredStaff.length, 6)}{!isLoading && !isError && filteredStaff.map((record) => <tr key={record.attendance_id} className="border-b border-text-secondary/10"><td className="px-4 py-4 font-semibold">{record.teacher?.name ?? "Unknown"}</td><td className="px-4 py-4 text-text-secondary">{formatDate(selectedDate)}</td><td className="px-4 py-4">{record.clock_in ? new Date(record.clock_in).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-"}</td><td className="px-4 py-4 text-text-secondary">{record.clock_out ? new Date(record.clock_out).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-"}</td><td className="px-4 py-4 text-text-secondary">{record.clock_out ? "Completed shift" : "Active shift"}</td><td className="px-4 py-4"><StatusBadge status={record.status} /></td></tr>)}</tbody></table>
          </div>
        </>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard label="Total Enrolled" value={`${learnerSummary.total_enrolled ?? 0} Learners`} icon={Users} />
            <SummaryCard label="Present Today" value={`${learnerSummary.present_today ?? 0} (${learnerSummary.attendance_percentage ?? 0}%)`} color="text-text-green" icon={Check} />
            <SummaryCard label="Absent Today" value={`${learnerSummary.absent_today ?? 0} Learners`} color="text-red-400" icon={X} />
            <SummaryCard label="Target Threshold" value={`${learnerSummary.target_threshold ?? 95}.0% Goal`} color="text-primary" icon={GraduationCap} />
          </div>

          <AttendanceToolbar search={search} setSearch={setSearch} statusFilter={statusFilter} setStatusFilter={setStatusFilter} classFilter={classFilter} setClassFilter={setClassFilter} classes={classes} options={["all", "present", "absent", "pending"]} />
          <div className="mt-5 overflow-x-auto rounded-xl border border-text-secondary/10 bg-card-2 p-5"><table className="w-full min-w-212.5 text-left text-sm"><thead><tr className="border-b border-text-secondary/10 text-text-secondary"><th className="px-4 py-3">Learner</th><th className="px-4 py-3">Class</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Recorded By</th><th className="px-4 py-3">Timestamp</th><th className="px-4 py-3">Status</th></tr></thead><tbody>{renderState(isLoading, isError, filteredLearners.length, 6)}{!isLoading && !isError && filteredLearners.map((record) => <tr key={record.learner_id} className="border-b border-text-secondary/10"><td className="px-4 py-4 font-semibold">{record.name}</td><td className="px-4 py-4"><span className="rounded bg-background px-2 py-1 text-xs font-semibold">{record.class?.name ?? "-"}</span></td><td className="px-4 py-4 text-text-secondary">{formatDate(selectedDate)}</td><td className="px-4 py-4 text-text-secondary">-</td><td className="px-4 py-4 text-text-secondary">-</td><td className="px-4 py-4"><StatusBadge status={record.status} /></td></tr>)}</tbody></table></div>
        </>
      )}
    </div>
  );
}

function AttendanceToolbar({ search, setSearch, statusFilter, setStatusFilter, options, classFilter, setClassFilter, classes = [] }) {
  return (
    <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-2 rounded-lg border border-text-secondary/10 bg-card-2 px-3 py-2.5"><Search size={17} className="text-text-secondary" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search attendance records..." className="w-64 bg-transparent text-sm text-white outline-none placeholder:text-text-secondary/60" /></div>
      <div className="flex flex-wrap items-center gap-3 text-sm"><span className="text-text-secondary">{classes.length > 0 && "Class:"}</span>{classes.length > 0 && <select value={classFilter} onChange={(event) => setClassFilter(event.target.value)} className="rounded-lg border border-text-secondary/10 bg-card-2 px-3 py-2 text-white outline-none"><option value="all">All Classes</option>{classes.map((classroom) => <option key={classroom.id} value={classroom.id}>{classroom.name}</option>)}</select>}<span className="text-text-secondary">Status:</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-lg border border-text-secondary/10 bg-card-2 px-3 py-2 text-white outline-none">{options.map((option) => <option key={option} value={option}>{option === "all" ? "All Statuses" : statusLabels[option]}</option>)}</select></div>
    </div>
  );
}

function renderState(isLoading, isError, rowCount, columnCount) {
  if (isLoading) return <tr><td colSpan={columnCount} className="px-4 py-8 text-center text-text-secondary">Loading attendance...</td></tr>;
  if (isError) return <tr><td colSpan={columnCount} className="px-4 py-8 text-center text-red-400">Failed to load attendance.</td></tr>;
  if (rowCount === 0) return <tr><td colSpan={columnCount} className="px-4 py-8 text-center text-text-secondary">No attendance records found.</td></tr>;
  return null;
}
