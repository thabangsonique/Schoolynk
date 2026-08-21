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
        `id, name, grade,created_at,teachers(id, employee_number, profiles(id, first_name, last_name,status,role))
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
