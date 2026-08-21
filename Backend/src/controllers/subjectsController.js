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
          class_subjects (
            id,
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
  } catch {}
};
