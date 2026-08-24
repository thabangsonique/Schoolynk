import { supabaseAdmin } from "../config/supabaseClient.js";

//marking single learner present or upsent.
export const markLearnerAttendance = async (req, res) => {
  try {
    const userId = req.user.id;
    const { learner_id, status } = req.body;

    if (!learner_id || !status) {
      return res.status(400).json({
        message: "learner_id and status are required",
      });
    }

    //validate status input.
    const validateStatus = ["present", "absent"];

    if (!validateStatus.includes(status)) {
      return res.status(400).json({
        message: `status must be one of: ${validStatuses.join(", ")}`,
      });
    }

    //check if teacher exists.
    const { data: teacher, error } = await supabaseAdmin
      .from("teachers")
      .select("id, profiles(first_name, last_name)")
      .eq("profile_id", userId)
      .single();

    if (error) {
      return res.status(400).json({
        message: "Failed to fetch teacher Records",
        error,
      });
    }

    if (!teacher) {
      return res.status(404).json({
        message: "Teacher not found.",
      });
    }

    //fetch the teacher's class and learners.
    //check if theres a class assign to teacher.
    const { data: teacherClass, error: classError } = await supabaseAdmin
      .from("classes")
      .select("id,name,grade")
      .eq("teacher_id", teacher.id)
      .maybeSingle();

    if (classError) {
      return res.status(400).json({
        message: "Failed to fetch teacher's class",
        error,
      });
    }

    if (!teacherClass) {
      return res.status(400).json({
        message: "No class assigned to this teacher",
      });
    }

    //verify if learner belong to this teacher's class.
    //grab the learner from learners table
    const { data: learner, error: learnerError } = await supabaseAdmin
      .from("learners")
      .select("id, class_id, first_name, last_name")
      .eq("id", learner_id)
      .single();

    if (learnerError) {
      return res.status(400).json({
        message: "Failed to fetch learner",
        error,
      });
    }

    if (!learner) {
      return res.status(400).json({
        message: "Learner not found",
      });
    }

    if (learner.class_id !== teacherClass.id) {
      return res.status(403).json({
        message: "You can only mark attendance for learners in your own class",
      });
    }

    //learner is found in teacher's class-update attendance record.
    const today = new Date().toISOString().split("T")[0];

    const { data, error: AttendanceError } = await supabaseAdmin
      .from("learner_attendance")
      .upsert(
        {
          learner_id,
          date: today,
          status,
          recorded_by: teacher.id,
        },
        { onConflict: "learner_id,date" }, //dont create new entry if learner already recorded.
      )
      .select()
      .single();

    if (AttendanceError) {
      return res.status(400).json({
        message: "Failed to save learner's attendance",
        error: error.message,
      });
    }

    return res.status(200).json({
      message: `${learner.first_name} ${learner.last_name} marked ${status}`,
      record: data,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

//GET ALL LEARNER ATTENDANCE OF TEACHER'S CLASS.
export const getTodayAttendance = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split("T")[0];

    //check teacher exists in record and has a class assigned.
    const { data: teacher, error } = await supabaseAdmin
      .from("teachers")
      .select("id, profiles(first_name, last_name)")
      .eq("profile_id", userId)
      .single();

    if (error) {
      return res.status(400).json({
        message: "Failed to fetch teacher Records",
        error,
      });
    }

    if (!teacher) {
      return res.status(404).json({
        message: "Teacher not found.",
      });
    }

    //fetch the teacher's class and learners.
    //check if theres a class assign to teacher.
    const { data: teacherClass, error: classError } = await supabaseAdmin
      .from("classes")
      .select("id,name,grade")
      .eq("teacher_id", teacher.id)
      .maybeSingle();

    if (classError) {
      return res.status(400).json({
        message: "Failed to fetch teacher's class",
        classError,
      });
    }

    if (!teacherClass) {
      return res.status(400).json({
        message: "No class assigned to this teacher",
      });
    }

    //fetch learners belonging to the teacher's class.
    const { data: learners, error: learnersError } = await supabaseAdmin
      .from("learners")
      .select(
        `id, student_number, first_name, last_name,
         parents(id, first_name, last_name, phone_number)`,
      )
      .eq("class_id", teacherClass.id)
      .order("last_name", { ascending: true });

    if (learnersError) {
      return res.status(400).json({
        message: "Failed to fetch learners",
        error: learnersError.message,
      });
    }

    //today's attendance for teacher's class.
    const learnerIds = (learners ?? []).map((l) => l.id);

    let attendanceMap = {};

    if (learnerIds.length > 0) {
      //attendance records of these learners
      const { data: attendanceRecords, error: attError } = await supabaseAdmin
        .from("learner_attendance")
        .select("id, learner_id, status, created_at")
        .eq("date", today)
        .in("learner_id", learnerIds);

      if (attError) {
        return res.status(400).json({
          message: "Failed to fetch attendance records",
          error: attError.message,
        });
      }

      for (const record of attendanceRecords ?? []) {
        attendanceMap[record.learner_id] = record;
      }
    }

    //merge teacher's learners with their attendance status's
    const roll = (learners ?? []).map((learner, index) => {
      const record = attendanceMap[learner.id];
      //return data structure for each learner.
      return {
        index: index + 1,
        learner_id: learner.id,
        student_number: learner.student_number,
        first_name: learner.first_name,
        last_name: learner.last_name,
        guardian: learner.parents
          ? `${learner.parents.first_name} ${learner.parents.last_name}`
          : null,
        guardian_phone: learner.parents?.phone_number ?? null,
        attendance_id: record?.id ?? null,
        status: record?.status ?? "unmarked",
        marked_at: record?.created_at ?? null,
      };
    });

    //summary
    const totalEnrolled = roll.length;
    const present = roll.filter(
      (rollRecord) => rollRecord.status === "present",
    ).length;
    const absent = roll.filter(
      (rollRecord) => rollRecord.status === "absent",
    ).length;
    const unmarked = roll.filter(
      (rollRecord) => rollRecord.status === "unmarked",
    ).length;

    return res.status(200).json({
      message: "Attendance sheet loaded",
      date: today,
      class: teacherClass,
      teacher: `${teacher.profiles.first_name} ${teacher.profiles.last_name}`,
      summary: {
        total_enrolled: totalEnrolled,
        present,
        absent,
        unmarked,
      },

      //list of all students attendance.
      roll: roll,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

//MARK ALL LEARNERS PRESENT OR ABSENT.

export const bulkMarkAttendance = async (req, res) => {
  try {
    const userId = req.user.id; //teacher's UUID
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        message: "status is required (present or absent)",
      });
    }

    //validate status value parameters.
    const validStatuses = ["present", "absent"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `status must be one of: ${validStatuses.join(", ")}`,
      });
    }

    //check teacher exists in record and has a class assigned.
    const { data: teacher, error } = await supabaseAdmin
      .from("teachers")
      .select("id, profiles(first_name, last_name)")
      .eq("profile_id", userId)
      .single();

    if (error) {
      return res.status(400).json({
        message: "Failed to fetch teacher Records",
        error,
      });
    }

    if (!teacher) {
      return res.status(404).json({
        message: "Teacher not found.",
      });
    }

    //fetch the teacher's class and learners.
    //check if theres a class assign to teacher.
    const { data: teacherClass, error: classError } = await supabaseAdmin
      .from("classes")
      .select("id,name,grade")
      .eq("teacher_id", teacher.id)
      .maybeSingle();

    if (classError) {
      return res.status(400).json({
        message: "Failed to fetch teacher's class",
        classError,
      });
    }

    if (!teacherClass) {
      return res.status(400).json({
        message: "No class assigned to this teacher",
      });
    }

    //get teacher's learners.
    const { data: learners, error: learnersError } = await supabaseAdmin
      .from("learners")
      .select("id")
      .eq("class_id", teacherClass.id);

    if (learnersError) {
      return res.status(400).json({
        message: "Failed to fetch learners",
        error: learnersError.message,
      });
    }

    if (!learners || learners.length === 0) {
      return res.status(404).json({ message: "No learners in this class" });
    }

    const today = new Date().toISOString().split("T")[0];

    const row = learners.map((learner) => ({
      learner_id: learner.id,
      date: today,
      status: status,
      recorded_by: teacher.id,
    }));

    //upsert the learner attendance table.
    const { data, error: upsertError } = await supabaseAdmin
      .from("learner_attendance")
      .upsert(row, { onConflict: "learner_id, date" })
      .select();

    if (upsertError) {
      return res.status(400).json({
        message: "Failed to bulk mark attendance",
        error: error.message,
      });
    }

    return res.status(200).json({
      message: `All ${data.length} learners are marked ${status}`,
      update: `${data.length}`,
      record: data,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

//FINAL ATTENDANCE REGISTER SUBMIT.
export const submitDailyAttendance = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split("T")[0];

    // 1. Resolve teacher + class
    const { data: teacher, error: teacherError } = await supabaseAdmin
      .from("teachers")
      .select("id, profiles(first_name, last_name)")
      .eq("profile_id", userId)
      .single();

    if (teacherError || !teacher) {
      return res.status(403).json({ message: "Teacher record not found" });
    }

    const { data: teacherClass, error: classError } = await supabaseAdmin
      .from("classes")
      .select("id, name")
      .eq("teacher_id", teacher.id)
      .maybeSingle();

    if (classError || !teacherClass) {
      return res
        .status(400)
        .json({ message: "No class assigned to this teacher" });
    }

    //get all learners that belong to that class.
    const { data: learners, error: learnersError } = await supabaseAdmin
      .from("learners")
      .select("id,first_name, last_name")
      .eq("class_id", teacherClass.id);

    if (learnersError) {
      return res.status(400).json({
        message: "Failed to fetch learners",
        error: learnersError.message,
      });
    }

    const learnerIds = learners.map((l) => l.id);

    //check if already submitted.
    const { data: alreadySubmitted } = await supabaseAdmin
      .from("learner_attendance")
      .select("id")
      .eq("date", today)
      .in("learner_id", learnerIds)
      .not("submitted_at", "is", null)
      .limit(1)
      .maybeSingle();

    //reject if already submitted
    if (alreadySubmitted) {
      return res.status(409).json({
        message:
          "Attendance for today has already been submitted and is locked.",
      });
    }

    //if not yet submitted-check unmarked learners.
    //fetch all learners from attendance record.
  } catch (error) {}
};
