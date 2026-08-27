import { supabase, supabaseAdmin } from "../config/supabaseClient.js";

export const getAllSubjects = async (req, res) => {
  try {
    const { data: subjects, error } = await supabaseAdmin
      .from("subjects")
      .select(
        `
          id,
          name,
          description,
          code,
          class_subjects (
            id,
            weekly_hours,
            classes (
              id,
              name,
              grade,
              teachers (
                id,
                profiles (
                  id,
                  first_name,
                  last_name
                )
              )
            )
          )
        `,
      )
      .order("name"); //alphabetical order

    if (error) {
      return res.status(400).json({
        message: "Failed to fetch subjects",
        error: error.message,
      });
    }

    //grab onject dispay, show subject, class of the subject, and teacher of the subject.
    const result = (subjects ?? []).map((subject) => ({
      id: subject.id,
      name: subject.name,
      description: subject.description,
      code: subject.code,
      weekly_hours: subject.class_subjects?.[0]?.weekly_hours ?? 0,
      classes: (subject.class_subjects ?? []).map((cs) => ({
        assignment_id: cs.id,
        weekly_hours: cs.weekly_hours,
        ...cs.classes,
        // cs.classes.teachers is whoever teaches THIS subject to THIS class
        subject_teacher: cs.classes?.teachers
          ? {
              id: cs.classes.teachers.id,
              ...cs.classes.teachers.profiles,
            }
          : null,
      })),
    }));

    return res
      .status(200)
      .json({ message: "Subjects fetched successfully", result });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

//ADDING OR CREATING A NEW SUBJECT.
export const createSubject = async (req, res) => {
  try {
    const {
      name,
      description,
      code,
      lead_teacher_id,
      weekly_hours = 0,
      classroom_ids = [],
    } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ message: "Name is required to create subject" });
    }

    //create the subject in the subjects table.
    const { data: subject, error: subjectError } = await supabaseAdmin
      .from("subjects")
      .insert({
        name,
        description: description || null,
        code: code || null,
        lead_teacher_id: lead_teacher_id || null,
      })
      .select()
      .single();

    if (subjectError) {
      return res
        .status(400)
        .json({ message: "Failed to create subject", subjectError });
    }

    //assign created subject to the select classrooms.
    //check classrooms were selected.
    let classSubjectAssignments = []; //class_ids

    if (classroom_ids.length >= 0) {
      const classRows = classroom_ids.map((class_id) => ({
        class_id,
        subject_id: subject.id,
        teacher_id: lead_teacher_id || null,
        weekly_hours,
      }));

      //assign subjects to the selected classes.
      const { data, error: assignError } = await supabaseAdmin
        .from("class_subjects")
        .upsert(classRows, { onConflict: "class_id, subject_id" }).select(`id,
           weekly_hours,
           classes(id, name, grade),
           subjects(id, name, description, code),
           teachers(id, profiles(id, first_name, last_name))`);

      if (assignError) {
        return res.status(400).json({
          message: "Subject created but failed to assign to classrooms",
          error: assignError.message,
        });
      }

      classSubjectAssignments = data ?? [];
    }

    return res.status(201).json({
      message: "Subject created successfully",
      subject,
      classSubjectAssignments,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const updateSubject = async (req, res) => {
  try {
    const {
      name,
      description,
      code,
      lead_teacher_id,
      weekly_hours = 0,
      classroom_ids = [],
    } = req.body;

    const subjectId = req.params.id;

    let subjectUpdate = {};

    if (name !== undefined) subjectUpdate.name = name;
    if (description !== undefined) subjectUpdate.description = description;
    if (code !== undefined) subjectUpdate.code = code;

    if (lead_teacher_id !== undefined)
      subjectUpdate.lead_teacher_id = lead_teacher_id;

    const { data: updateSubject, error } = await supabaseAdmin
      .from("subjects")
      .update(subjectUpdate)
      .eq("id", subjectId)
      .select()
      .maybeSingle();

    if (error) {
      return res.status(400).json({
        message: "Failed to update subject",
        error: error.message,
      });
    }

    const { error: deleteAssignmentsError } = await supabaseAdmin
      .from("class_subjects")
      .delete()
      .eq("subject_id", subjectId);

    if (deleteAssignmentsError) {
      return res.status(400).json({
        message: "Failed to update classroom assignments",
        error: deleteAssignmentsError.message,
      });
    }

    if (classroom_ids.length > 0) {
      const assignments = classroom_ids.map((class_id) => ({
        class_id,
        subject_id: subjectId,
        teacher_id: lead_teacher_id || null,
        weekly_hours,
      }));
      const { error: assignmentError } = await supabaseAdmin
        .from("class_subjects")
        .insert(assignments);

      if (assignmentError) {
        return res.status(400).json({
          message: "Subject updated but classroom assignments failed",
          error: assignmentError.message,
        });
      }
    }

    return res.status(200).json({
      message: "Subject updated successfully",
      updateSubject,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

//DELETING A CLASS SUBJECT.
export const deleteSubject = async (req, res) => {
  try {
    const subjectId = req.params.id;

    //check subject exists.
    const { data: subject, error: findError } = await supabaseAdmin
      .from("subjects")
      .select("id, name")
      .eq("id", subjectId)
      .maybeSingle();

    if (findError) {
      return res.status(400).json({
        message: "Error looking up subject",
        error: findError.message,
      });
    }

    if (!subject) {
      return res.status(404).json({ message: "Subject not found." });
    }

    // Remove classroom assignments before deleting the subject itself.
    const { error: assignmentsError } = await supabaseAdmin
      .from("class_subjects")
      .delete()
      .eq("subject_id", subjectId);

    if (assignmentsError) {
      return res.status(400).json({
        message: "Failed to remove subject classroom assignments",
        error: assignmentsError.message,
      });
    }

    //delete subject from subjects table.
    const { error: deleteError } = await supabaseAdmin
      .from("subjects")
      .delete()
      .eq("id", subjectId);

    if (deleteError) {
      return res.status(400).json({
        message: "Failed to delete subject",
        error: deleteError.message,
      });
    }

    return res.status(200).json({ message: "Subject deleted successfully." });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error:", error: error.message });
  }
};
