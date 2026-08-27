import { SupabaseClient } from "@supabase/supabase-js";
import { supabase, supabaseAdmin } from "../config/supabaseClient.js";

export const createClass = async (req, res) => {
  try {
    const { name, grade, room_number, student_capacity, teacher_id } = req.body;

    if (!name || !grade) {
      return res.json({
        message: "Missing required fields. Enter class name and grade",
      });
    }

    //create the class.
    const { data: newClass, error: newClassError } = await supabaseAdmin
      .from("classes")
      .insert({
        name,
        grade,
        student_capacity: student_capacity || null,
        room_number: room_number || null, //optional
        teacher_id: teacher_id || null, //optional. no need to assign teacher immediatley
      })
      .select(
        `   id,
        name,
        grade,
        room_number,
        student_capacity,
        teachers (
          id,
          employee_number,
          profiles (first_name, last_name)
        )`,
      )
      .single();

    if (newClassError) {
      return res
        .status(400)
        .json({ message: "Failed to create class", newClassError });
    }

    return res
      .status(201)
      .json({ message: "New class created successfully.", newClass });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error class", error: error.message });
  }
};

//VIEWING ALL CLASSES.
export const getAllClasses = async (req, res) => {
  try {
    const { data: classes, error: fetchError } = await supabaseAdmin
      .from("classes")
      .select(
        `id, name, grade,created_at,
        teachers(id, employee_number, profiles(id, first_name, last_name,status,role)),
        learners(id, first_name, last_name, student_number),
        class_subjects(id, subjects(id, name, code))
      `,
      );

    if (fetchError) {
      return res
        .status(400)
        .json({ message: "Error fetching classes", fetchError });
    }

    return res
      .status(200)
      .json({ message: "Successfully fetched all classes", classes });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error, fetch classes",
      error: error.message,
    });
  }
};

// ADMIN DASHBOARD: classroom attendance and enrolment summary for one day.
export const getClassroomOverview = async (req, res) => {
  try {
    const requestedDate =
      req.query.date || new Date().toISOString().split("T")[0];

    const { data: classes, error: classesError } = await supabaseAdmin
      .from("classes")
      .select(
        "id,name,grade,teachers(id,profiles(first_name,last_name))",
      )
      .order("grade", { ascending: true })
      .order("name", { ascending: true });

    if (classesError) {
      return res.status(400).json({
        message: "Failed to fetch classes for overview",
        error: classesError.message,
      });
    }

    const { data: learners, error: learnersError } = await supabaseAdmin
      .from("learners")
      .select("id,class_id");

    if (learnersError) {
      return res.status(400).json({
        message: "Failed to fetch learners for class overview",
        error: learnersError.message,
      });
    }

    const { data: attendanceRecords, error: attendanceError } =
      await supabaseAdmin
        .from("learner_attendance")
        .select("learner_id,status")
        .eq("date", requestedDate);

    if (attendanceError) {
      return res.status(400).json({
        message: "Failed to fetch attendance for class overview",
        error: attendanceError.message,
      });
    }

    const learnersByClass = new Map();
    for (const learner of learners ?? []) {
      const classLearners = learnersByClass.get(learner.class_id) ?? [];
      classLearners.push(learner);
      learnersByClass.set(learner.class_id, classLearners);
    }

    const attendanceByLearner = new Map(
      (attendanceRecords ?? []).map((record) => [record.learner_id, record]),
    );

    const overview = (classes ?? []).map((classroom) => {
      const classLearners = learnersByClass.get(classroom.id) ?? [];
      let presentCount = 0;
      let absentCount = 0;
      let pendingCount = 0;

      for (const learner of classLearners) {
        const status = attendanceByLearner.get(learner.id)?.status;

        if (status === "present") presentCount += 1;
        else if (status === "absent") absentCount += 1;
        else pendingCount += 1;
      }

      const learnerCount = classLearners.length;
      const teacherProfile = classroom.teachers?.profiles;

      return {
        id: classroom.id,
        name: classroom.name,
        grade: classroom.grade,
        teacher_name: teacherProfile
          ? `${teacherProfile.first_name} ${teacherProfile.last_name}`
          : null,
        learner_count: learnerCount,
        present_count: presentCount,
        absent_count: absentCount,
        pending_count: pendingCount,
        attendance_percentage:
          learnerCount > 0
            ? Number(((presentCount / learnerCount) * 100).toFixed(1))
            : 0,
      };
    });

    return res.status(200).json({
      date: requestedDate,
      total_classes: overview.length,
      classes: overview,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error fetching classroom overview",
      error: error.message,
    });
  }
};

//UPDATE A CLASS.
export const updateClass = async (req, res) => {
  try {
    const classId = req.params.id;

    const { name, grade, teacher_id } = req.body;

    if (!classId) {
      return res.status(400).json({ message: "Class id is required" });
    }

    //first check if class exists.
    const { data: classExists } = await supabaseAdmin
      .from("classes")
      .select("id")
      .eq("id", classId)
      .single();

    if (!classExists) {
      return res.status(400).json({ message: "Class not found!" });
    }

    let classUpdate = {};
    if (name !== undefined) classUpdate.name = name;
    if (grade !== undefined) classUpdate.grade = grade;
    if (teacher_id !== undefined) classUpdate.teacher_id = teacher_id;

    //update class
    const { data: finalClassUpdate, error } = await supabaseAdmin
      .from("classes")
      .update(classUpdate)
      .select()
      .eq("id", classId)
      .single();

    if (error) {
      return res.status(400).json({ message: "Failed to update class", error });
    }

    return res
      .status(201)
      .json({ message: "Classe updated successfully", finalClassUpdate });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error class update",
      error: error.message,
    });
  }
};

//DELETe CLASS.

export const deleteClass = async (req, res) => {
  try {
    const classId = req.params.id;

    const { error } = await supabaseAdmin
      .from("classes")
      .delete()
      .eq("id", classId);

    if (error) {
      return res.status(400).json({ message: "Failed to delete class" });
    }

    return res.status(200).json({ message: "Class deleted successfully" });
  } catch (error) {
    return res.status(200).json({
      message: "Internal server error class delete",
      error: error.message,
    });
  }
};
