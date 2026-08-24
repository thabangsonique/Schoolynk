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
      guardian_id, //if the guardian of this learner was found in search
      guardian, //if guardian was not found. this contains new guardian information.
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

    //if class and student information is sufficient, check guardian entry.
    let finalGaurdianId = guardian_id;

    if (!finalGaurdianId) {
      //use of new guardian info to create guardian.
      if (
        !guardian ||
        !guardian.first_name ||
        !guardian.last_name ||
        !guardian.phone_number ||
        !guardian.relationship
      ) {
        return res.status(400).json({
          message:
            "Please provide all required guardian infomation or select existing guardian",
        });
      }

      //add new guardian.
      const { data: newGaurdian, error: newGaurdianError } = await supabaseAdmin
        .from("parents")
        .insert({
          first_name: guardian.first_name,
          last_name: guardian.last_name,
          email: guardian.email || null,
          phone_number: guardian.phone_number,
          relationship: guardian.relationship,
        })
        .select("id")
        .single();

      if (newGaurdianError) {
        return res
          .status(400)
          .json({ message: "Failed to add new guardian", newGaurdianError });
      }

      finalGaurdianId = newGaurdian.id;
    }

    //else if user selected guardian from existing gaurdians. then ...
    //create the learner.
    const learnerPayload = {
      first_name,
      last_name,
      date_of_birth,
      address: address || null,
      class_id,
      guardian_id: finalGaurdianId,
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

//VIEW LEARNERS.
//support both admini viewing learners by classID or viewing learners for the whole school.
export const getLearners = async (req, res) => {
  try {
    const { class_id } = req.query;

    //fetching all the learners first.
    let query = supabaseAdmin
      .from("learners")
      .select(
        `id, student_number,first_name, last_name,date_of_birth,address,updated_at,classes(id,name,grade),parents(id,first_name,last_name,phone_number,relationship)`,
      );

    if (class_id) {
      query = query.eq("class_id", class_id);
    }

    //send the query.
    const { data: learners, error } = await query;

    if (error) {
      return res.status(400).json({ message: "Failed to fetch learners" });
    }

    return res
      .status(200)
      .json({ message: "Learners fetched successfully", learners });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error fetching learners",
      error: error.message,
    });
  }
};

//UPDATE LEARNER.
export const updateLearner = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      class_id,
      address,
      guardian, //guardian update information
      guardian_id,
    } = req.body;

    const learnerId = req.params.id;

    //validate learner id.
    if (!learnerId) {
      return res.status(400).json({ message: "LearnerId is required" });
    }

    //update the learners table.
    const learnerUpdate = {};

    if (first_name !== undefined) learnerUpdate.first_name = first_name;
    if (last_name !== undefined) learnerUpdate.last_name = last_name;
    if (class_id !== undefined) learnerUpdate.class_id = class_id;
    if (address !== undefined) learnerUpdate.address = address;

    //update the table.
    const { data: updatedLearner, error } = await supabaseAdmin
      .from("learners")
      .update(learnerUpdate)
      .eq("id", learnerId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ message: "Failed to update learner" });
    }

    let updatedParent = null;

    if (guardian && guardian_id) {
      //update the learner's gaurdian information.
      const guardianUpdate = {};

      if (guardian) {
        if (guardian.first_name !== undefined)
          guardianUpdate.first_name = guardian.first_name;
        if (guardian.last_name !== undefined)
          guardianUpdate.last_name = guardian.last_name;
        if (guardian.email !== undefined) guardianUpdate.email = guardian.email;
        if (guardian.phone_number !== undefined)
          guardianUpdate.phone_number = guardian.phone_number;
      }
      //first check if the guardian exists.
      const { data: parentExists } = await supabaseAdmin
        .from("parents")
        .select("id")
        .eq("id", guardian_id)
        .maybeSingle();

      if (!parentExists) {
        return res.status(404).json({ message: "Parent not found" });
      }

      const { data: updatedParent, error: parentError } = await supabaseAdmin
        .from("parents")
        .update(guardianUpdate)
        .eq("id", guardian_id)
        .select()
        .single();

      if (parentError) {
        return res.status(400).json({
          messgae: "Failed to update guardain",
          parentError: parentError.message,
        });
      }
    }

    return res.status(201).json({
      message: "Learner updated successfully",
      updatedLearner,
      updatedParent,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error fetching learners",
      error: error.message,
    });
  }
};

//DELETING A LEARNER.
export const deleteLearner = async (req, res) => {
  try {
    const learnerId = req.params.id;
    const { error } = await supabaseAdmin
      .from("learners")
      .delete()
      .eq("id", learnerId);

    return res.status(200).json({ message: "Learner deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete learner" });
  }
};
