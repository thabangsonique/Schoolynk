import { SupabaseClient } from "@supabase/supabase-js";
import { supabase, supabaseAdmin } from "../config/supabaseClient.js";

export const createClass = async (req, res) => {
  try {
    const { name, grade, teacher_id } = req.body;

    if (!name || !grade) {
      return res.json({
        message: "Missing required fields. Enter name and email",
      });
    }

    //create the class.
    const { data: newClass, error: newClassError } = await supabaseAdmin
      .from("classes")
      .insert({
        name,
        grade,
        teacher_id: teacher_id || null,
      })
      .select(
        `   id,
        name,
        grade,
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
  } catch {}
};
