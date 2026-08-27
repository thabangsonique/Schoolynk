import { supabase, supabaseAdmin } from "../config/supabaseClient.js";

export const staffOverview = async (req, res) => {
  try {
    const requestedDate =
      req.query.id || new Date().toISOString().split("T")[0];

    //grab all the active teachers.
    const { count: staffCount, error: errorStaff } = await supabaseAdmin
      .from("teachers")
      .select("id, profiles!inner(status)", { count: "exact", head: true })
      .eq("profiles.status", "active");

    if (errorStaff) {
      return res.status(400).json({
        message: "Failed to fetch staffCount",
        error: errorStaff.message,
      });
    }

    //fetch all active teacher records
    const { data: todayRecords, error: errorRecords } = await supabaseAdmin
      .from("staff_attendance")
      .select(
        "id,teacher_id,date,clock_in,clock_out,status,teachers(id,employee_number, profiles(id,first_name,last_name))",
      )
      .eq("date", requestedDate);

    if (errorRecords) {
      return res.status(400).json({
        message: "Failed to fetch teacher records for requested date",
        errorRecords,
      });
    }

    //filter each teacher status from the staff attendance records.
    const present = [];
    const absent = [];
    const late = [];

    for (const record of todayRecords ?? []) {
      const entry = {
        attendance_id: record.id,
        clock_in: record.clock_in,
        clock_out: record.clock_out,
        status: record.status,
        teacher: record.teachers
          ? {
              id: record.teachers.id,
              name: `${record.teachers.profiles.first_name} ${record.teachers.profiles.last_name}`,
              employee_number: record.teachers.employee_number,
            }
          : null,
      };

      if (
        record.status === "clocked_in" ||
        record.status === "clocked_out"
      ) {
        present.push(entry);
      } else if (record.status === "late") {
        late.push(entry);
      } else if (record.status === "absent") {
        absent.push(entry);
      }
    }

    //find pending staff- that havent clocked in.
    const clockedInStaff = new Set(
      (todayRecords ?? []).map((r) => r.teacher_id),
    );

    const pendingCount = Math.max(0, staffCount - clockedInStaff.size);

    return res.status(200).json({
      date: requestedDate,
      summary: {
        total_expected: staffCount,
        // Late staff have still arrived, so include them in the present count.
        currently_present: present.length + late.length,
        late: late.length,
        pending_clock_in: pendingCount,
        marked_absent: absent.length,
      },
      staff: {
        present,
        absent,
        late,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const learnerAttendance = async (req, res) => {
  try {
    const requestedDate =
      req.query.id || new Date().toISOString().split("T")[0];

    //fetch all learners.
    const { data: learners, error: learnersError } = await supabaseAdmin
      .from("learners")
      .select("id,student_number,first_name,last_name,classes(id,name,grade)");

    if (learnersError) {
      return res.status(400).json({
        message: "Failed to fetch learners for requested date",
        learnersError,
      });
    }

    //fetch learners from attendance.
    const { data: attendanceRecords, error: attendanceError } =
      await supabaseAdmin
        .from("learner_attendance")
        .select("id, learner_id, date, status")
        .eq("date", requestedDate);

    if (attendanceError) {
      return res.status(400).json({
        message: "Failed to fetch learner attendance",
        error: attendanceError.message,
      });
    }

    const attendanceMap = new Map(
      (attendanceRecords ?? []).map((record) => [record.learner_id, record]),
    );

    const present = [];
    const absent = [];
    const pending = [];

    for (const learner of learners ?? []) {
      //search for the learn using their learner id from the learner attendance records
      const attendance = attendanceMap.get(learner.id);

      const entry = {
        learner_id: learner.id,
        student_number: learner.student_number,
        name: `${learner.first_name} ${learner.last_name}`,
        class: learner.classes
          ? {
              id: learner.classes.id,
              name: learner.classes.name,
              grade: learner.classes.grade,
            }
          : null,
        attendance_id: attendance?.id ?? null,
        status: attendance?.status ?? "pending",
      };

      //filter learners by attendance.
      if (attendance?.status === "present") {
        present.push(entry);
      } else if (attendance?.status === "absent") {
        absent.push(entry);
      } else {
        pending.push(entry);
      }
    }

    const totalLearners = learners?.length ?? 0;
    const presentCount = present.length;
    const absentCount = absent.length;
    const pendingCount = pending.length;

    const attendancePercentage =
      totalLearners > 0
        ? Number(((presentCount / totalLearners) * 100).toFixed(1))
        : 0;

    //strustured data returned
    return res.status(200).json({
      date: requestedDate,
      summary: {
        total_enrolled: totalLearners,
        present_today: presentCount,
        absent_today: absentCount,
        pending_today: pendingCount,
        attendance_percentage: attendancePercentage,
        target_threshold: 95,
      },
      learners: { present, absent, pending },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error,
    });
  }
};

//weekly learners attendance.
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const weeklyLearnerAttendance = async (req, res) => {
  try {
    const today = new Date();

    // Monday is the first day of the displayed week.
    const monday = new Date(today);
    const dayOfWeek = today.getDay(); // Sunday = 0, Monday = 1
    const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    monday.setDate(today.getDate() - daysSinceMonday);
    monday.setHours(0, 0, 0, 0);

    // Build Monday–Sunday, with each date and its chart label.
    const week = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);

      return {
        date: formatDate(date),
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
      };
    });

    const todayString = formatDate(today);

    // The denominator: every learner currently enrolled at the school.
    const { count: totalEnrolled, error: learnersError } = await supabaseAdmin
      .from("learners")
      .select("*", { count: "exact", head: true });

    if (learnersError) {
      return res.status(400).json({
        message: "Failed to count learners",
        error: learnersError.message,
      });
    }

    // Fetch all attendance entries for the displayed week.
    const { data: records, error: attendanceError } = await supabaseAdmin
      .from("learner_attendance")
      .select("date, status")
      .gte("date", week[0].date)
      .lte("date", week[6].date);

    if (attendanceError) {
      return res.status(400).json({
        message: "Failed to fetch weekly attendance",
        error: attendanceError.message,
      });
    }

    // Count both submitted records and present learners for each date.
    // A date without records means its register has not been started yet;
    // it should be a chart gap, not a misleading 0% attendance rate.
    const presentByDate = {};
    const recordsByDate = {};

    for (const record of records ?? []) {
      recordsByDate[record.date] = (recordsByDate[record.date] ?? 0) + 1;

      if (record.status === "present") {
        presentByDate[record.date] = (presentByDate[record.date] ?? 0) + 1;
      }
    }

    const days = week.map(({ date, day }) => {
      const hasAttendanceRecords = (recordsByDate[date] ?? 0) > 0;

      // Do not show fake 0% values for future days or unstarted registers.
      if (date > todayString || !hasAttendanceRecords) {
        return { day, date, attendance: null };
      }

      const present = presentByDate[date] ?? 0;

      const attendance =
        totalEnrolled > 0
          ? Number(((present / totalEnrolled) * 100).toFixed(1))
          : 0;

      return { day, date, attendance };
    });

    const completedDays = days.filter((item) => item.attendance !== null);

    const weeklyAverage =
      completedDays.length > 0
        ? Number(
            (
              completedDays.reduce(
                (total, item) => total + item.attendance,
                0,
              ) / completedDays.length
            ).toFixed(1),
          )
        : 0;

    return res.status(200).json({
      days,
      weekly_average: weeklyAverage,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to get weekly attendance",
      error: error.message,
    });
  }
};
