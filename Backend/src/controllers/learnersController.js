import { SupabaseClient } from "@supabase/supabase-js";
import { supabase, supabaseAdmin } from "../config/supabaseClient.js";

export const createLearner = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      date_of_birth,
      address,
      class_id,
      gaurdian_id, //if the gaurdian of this learner was found in search
      gaurdian, //if gaurdian was not found. this contains new gaurdian information.
    } = req.body;

    //check if important fields are given.
    if (!first_name || !last_name || !date_of_birth || !class_id) {
      return res.status(400).json({
        message: "First name, last name, date of birth, and class are required",
      });
    }

    //check if the class to recieve this new learner actually exists.

    const { data: classExist, error: classExistError } = await supabaseAdmin
      .from("classes")
      .select("id, name, grade")
      .eq("id", class_id);

    if (!classExist || classExistError) {
      return res.status(404).json({ message: "Class not found" });
    }

    //if class and student information is sufficient, check gaurdian entry.
    let finalGaurdianId = gaurdian_id;

    if (!finalGaurdianId) {
      //use of new gaurdian info to create gaurdian.
      if (
        !gaurdian ||
        !gaurdian.first_name ||
        !gaurdian.last_name ||
        !gaurdian.phone_number ||
        !gaurdian.relationship
      ) {
        return res.status(400).json({
          message:
            "Please provide all required gaurdian infomation or select existing gaurdian",
        });
      }

      //add new gaurdian.
      const { data: newGaurdian, error: newGaurdianError } = await supabaseAdmin
        .from("parents")
        .insert({
          first_name: gaurdian.first_name,
          last_name: gaurdian.last_name,
          email: gaurdian.email || null,
          phone_number: gaurdian.phone_number,
          relation: gaurdian.relationship,
        })
        .select("id")
        .single();

      if (newGaurdianError) {
        return res
          .status(400)
          .json({ message: "Failed to add new gaurdian", newGaurdianError });
      }

      finalGaurdianId = newGaurdian.id;
    }

    //else if user selected gaurdian from existing gaurdians. then ...
    //create the learner.
    const learnerPayload = {
      first_name,
      last_name,
      date_of_birth,
      address: address || null,
      class_id,
      gaurdian_id: finalGaurdianId,
    };

    const { data: newLearner, error: learnerError } = await supabaseAdmin
      .from("learners")
      .insert(learnerPayload)
      .select(
        `id, 
        student_number,
         first_name, 
         last_name,date_of_birth, 
         classes(
         id,
         name,
         grade),
         parents
         (id,first_name,last_name,phone_number)`,
      )
      .single();

    if (learnerError) {
      return res
        .status(400)
        .json({ message: "Failed to create new learner", learnerError });
    }

    return res
      .status(201)
      .json({ message: "Learner created successfully.", newLearner });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error Gaurdian",
      error: error.message,
    });
  }
};
