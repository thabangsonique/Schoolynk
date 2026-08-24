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
        "id,date,clock_in,clock_out,status,teachers(id,employee_number, profiles(id,first_name,last_name))",
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
              emplpyee_number: record.teachers.emplpyee_number,
            }
          : null,
      };

      if (record.status === "present") {
        present.push(entry);
      } else if (record.status === "late") {
        late.push(entry);
      } else {
        absent.push(entry);
      }
    }

    //find pending staff- that havent clocked in.
    const clockedInStaff = new Set(
      (todayRecords ?? []).map((r) => r.teacher_id),
    );

    const pendingCount = staffCount - (clockedInStaff?.length ?? 0);

    return res.status(200).json({
      date: requestedDate,
      summary: {
        total_expected: staffCount,
        currently_present: present.length,
        late: late.legnth,
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
