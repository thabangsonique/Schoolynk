import { supabase, supabaseAdmin } from "../config/supabaseClient.js";

// ======================
// ADMIN CONTROL.
// ======================

//CREATE A TEACHER
export const createTeacher = async (req, res) => {
  console.log(req.userRole);
  console.log(req.supabase);
  try {
    //grab info entry to create teacher form rq.body(frontend)
    const {
      email,
      first_name,
      last_name,
      password,
      employee_number,
      class_id,
      teacher_id,
    } = req.body;

    if (!email || !first_name || !last_name || !password) {
      return res.status(400).json({
        message: "First name, last name, email and password are required",
      });
    }

    //  CREATE TEACHER FROM AUTHENTICATION SIDE
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authError) {
      return res.status(400).json({
        message: "failed to create teacher auth",
        error: authError.message,
      });
    }

    //add teacher to the profiles table.
    const { data: teacherProfile, error } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: authData.user.id,
        first_name,
        last_name,
        status: "active",
        role: "teacher",
      })
      .select()
      .single();

    if (!teacherProfile || error) {
      return res
        .status(400)
        .json({ message: "Failed to create teacher", error: error.message });
    }

    //add the teacher into the teachers table
    const { data: teacherRecord, error: teacherError } = await supabaseAdmin
      .from("teachers")
      .insert({
        profile_id: authData.user.id,
        employee_number: employee_number || `EMP-${Date.now()}`,
      })
      .select()
      .single();

    if (teacherError) {
      return res.json({
        message: "Failed to add teacher in the teacher table",
      });
    }

    //OPTIONAL ASSIGNING TEACHER TO A CLASS if class id exists.
    if (class_id) {
      const { error: assignError } = await supabaseAdmin
        .from("classes")
        .update({ teacher_id: teacherRecord.id })
        .eq("id", class_id);

      if (assignError) {
        return res.status(400).json({
          message: "Teacher created but failed to assign to class",
          error: assignError.message,
        });
      }
    }
    //ASSIGN teacher to class subjects table

    //RETURN ENTIRE TEACHER DATA .including assigned class.
    const { data: completeTeacher } = await supabaseAdmin
      .from("teachers")
      .select(
        `id, employee_number, profiles(id,first_name,last_name,status,role), classes(id,name,grade)`,
      )
      .eq("id", teacherRecord.id)
      .single();

    return res.status(201).json({
      message: "Teacher created successfully.",
      newTeacher: completeTeacher,
    });
  } catch (error) {
    console.log("FAILED TO CREATE TEACHER:", error);
    return res.status(500).json({
      message: "Internal server",
      error: error.message,
    });
  }
};

//VIEW ALL TEACHERS
export const getTeachers = async (req, res) => {
  try {
    const { data: teachers, error } = await supabaseAdmin
      .from("teachers")
      .select(
        `id, employee_number, profiles(id,first_name, last_name, status, role), classes(id, name, grade)`,
      )
      .eq("profiles.status", "active");

    if (error) {
      return res
        .status(400)
        .json({ message: "Error fetching teachers", error });
    }

    return res.status(200).json(teachers);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
};

//GET SINGLE TEACHER BY ID.
export const getTeacherById = async (req, res) => {
  try {
    //grab teacher id
    const teacherId = req.params.id;

    const { data: teacher, error } = await supabaseAdmin
      .from("teachers")
      .select(
        `id, employee_number, profiles(id, first_name,last_name,status,role), classes(id,name,grade)`,
      )
      .eq("id", teacherId)
      .maybeSingle(); //use maybeSingle() to handle if teacher is not found

    if (error) {
      return res.status(400).json({ message: "Error fetching teacher" });
    }

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found", error });
    }

    return res.status(200).json({ message: "Here is the teacher:", teacher });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error teacher", error: error.message });
  }
};

//admin UPDATE TEACHER
export const updateTeacherById = async (req, res) => {
  //grab the teacher id
  try {
    const teacherId = req.params.id; //actual teacher Id from the teachers table not the authenticated user ID
    const { employee_number, first_name, last_name, status } = req.body;

    //check if teacher exists.
    const { data: teacher, error: teacherError } = await supabaseAdmin
      .from("teachers")
      .select("id , profile_id")
      .eq("id", teacherId)
      .single();

    if (!teacher || teacherError) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    //UPDATE TEACHER INFORMATION
    //profiles table.
    //check feilds that need an update.
    const profileUpdates = {};
    if (first_name !== undefined) profileUpdates.first_name = first_name;
    if (last_name !== undefined) profileUpdates.last_name = last_name;
    if (status !== undefined) profileUpdates.status = status;

    if (Object.keys(profileUpdates).length > 0) {
      const { data: profileUpdate, error: profileError } = await supabaseAdmin
        .from("profiles")
        .update(profileUpdates)
        .eq("id", teacher.profile_id);

      if (profileError) {
        return res
          .status(401)
          .json({ message: "Failed to update teacher", profileError });
      }
    }

    //update teachers table.
    if (employee_number !== undefined) {
      const { data: teacherNumber, error: updateError } = await supabaseAdmin
        .from("teachers")
        .update({
          employee_number,
        })
        .eq("id", teacherId);

      if (updateError) {
        return res.status(400).json({
          message: "failed to update teacher employee number",
          updateError,
        });
      }
    }

    //fetch updated teacher record.
    const { data: updatedTeacher, error: fetchError } = await supabaseAdmin
      .from("teachers")
      .select(
        `id, employee_number, profiles(id,first_name, last_name,status,role)`,
      )
      .eq("id", teacherId)
      .single();

    //SUCCESS
    return res.status(200).json({
      message: "teacher updated successfully",
      updatedTeacher,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

//DELETE TEACHER
export const deleteTeacher = async (req, res) => {
  try {
    const teacherId = req.params.id;

    // Fetch the teacher's profile ID before changing any related records.
    const { data: teacher, error: findError } = await supabaseAdmin
      .from("teachers")
      .select("id, profile_id")
      .eq("id", teacherId)
      .single();

    if (findError || !teacher) {
      return res.status(404).json({ message: "Teacher Not found" });
    }

    const authTeacherId = teacher.profile_id;

    // Keep historical records, but remove this teacher from current assignments.
    const { error: classError } = await supabaseAdmin
      .from("classes")
      .update({ teacher_id: null })
      .eq("teacher_id", teacherId);

    if (classError) {
      return res.status(400).json({
        message: "Failed to unassign teacher from classes",
        error: classError,
      });
    }

    const { error: classSubjectError } = await supabaseAdmin
      .from("class_subjects")
      .update({ teacher_id: null })
      .eq("teacher_id", teacherId);

    if (classSubjectError) {
      return res.status(400).json({
        message: "Failed to unassign teacher from class subjects",
        error: classSubjectError,
      });
    }

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({ status: "inactive" })
      .eq("id", authTeacherId);

    if (profileError) {
      return res.status(400).json({
        message: "Failed to deactivate teacher profile",
        error: profileError,
      });
    }

    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      authTeacherId,
      {
        ban_duration: "876000h",
      },
    );

    if (authError) {
      return res.status(400).json({
        message: "Failed to deactivate teacher authentication",
        error: authError,
      });
    }

    return res.status(200).json({
      message: "Teacher deactivated successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// ===================
// TEACHER CONTROL
// ====================

export const getMyLearners = async (req, res) => {
  try {
    //use the teacher's authenticated ID from the middleware since they are logged in.
    const userId = req.user.id;

    const { data: teacher, error } = await req.supabase
      .from("teachers")
      .select()
      .eq("profile_id", userId)
      .single();

    if (error) {
      return res
        .status(400)
        .json({ message: "Failed to fetch teacher record", error });
    }

    //fetch the class belonging to the teacher.
    const { data: teacherClass, error: classTeacherError } = await req.supabase
      .from("classes")
      .select("id,name,grade")
      .eq("teacher_id", teacher.id)
      .maybeSingle();

    if (classTeacherError) {
      return res.status(400).json({
        message: "Failed to fetch Class belonging to this teacher",
        classTeacherError,
      });
    }

    if (!teacherClass) {
      return res
        .status(404)
        .json({ message: "No class assigned to this teacher" });
    }

    //fetch learners belonging to this class.
    const { data: teacherLearners, error: fetchError } = await req.supabase
      .from("learners")
      .select(
        `id,student_number,first_name,last_name,date_of_birth,address,parents(id,first_name,last_name,phone_number,relationship)`,
      )
      .eq("class_id", teacherClass.id);

    console.log("teacher's class id:", teacherClass.id);

    if (fetchError) {
      return res
        .status(400)
        .json({ message: "Failed to fetch teacher's learners", fetchError });
    }

    return res.status(200).json({
      message: "Teacher's Learners fetched successfully",
      teacherLearners,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error, get-my-learners",
      error: error.message,
    });
  }
};

//RETRIEVE TEACHER CLASS.
export const getMyClasses = async (req, res) => {
  //use logged Auth in teacher ID.
  try {
    const userId = req.user.id; // this is same as the profile_id

    const { data: teacherRecord, error } = await req.supabase
      .from("teachers")
      .select("id")
      .eq("profile_id", userId)
      .single();

    if (error || !teacherRecord) {
      return res
        .status(400)
        .json({ message: "Failed to fecth teacher's Record", error });
    }

    //fetch classes +  that belong to this teacher.
    const { data: teacherClasses, error: classFetchError } = await req.supabase
      .from("classes")
      .select(
        `id, 
        name,
         grade,
         learners(
         id,
         student_number,
         first_name,
         last_name,
         date_of_birth,
         address,
         parents(
          id,
          first_name,
          last_name,
          phone_number,
          relationship
          )),
        class_subjects(
        id,
        subjects(
         id,
         name,
         description)), teachers(id, profiles(id,first_name, last_name))`,
      )
      .eq("teacher_id", teacherRecord.id)
      .maybeSingle();

    if (classFetchError) {
      return res.status(400).json({ message: "Failed to fecth class" });
    }

    if (!teacherClasses) {
      return res
        .status(404)
        .json({ message: "No class assigned to this teacher" });
    }

    //consolidate response
    const response = {
      ...teacherClasses,
      learners: teacherClasses.learners ?? [],
      subjects: (teacherClasses.class_subjects ?? []).map((cs) => ({
        assignment_id: cs.id,
        ...cs.subjects,
        teacher: cs.teachers
          ? { id: cs.teachers.id, ...cs.teachers.profiles }
          : null,
      })),
    };
    delete response.class_subjects; //remove the subjects duplicate

    return res
      .status(200)
      .json({ message: "Class fecthed successfully", response });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

//UPDATE AVATAR.
export const insertAvater = async (req, res) => {
  try {
    const userId = req.user.id;

    //check if image was provided.
    if (!req.file) {
      return res.status(400).json({
        message: "Please provide a profile image",
      });
    }

    const file = req.file;

    //unique path for user's avatar
    const filePath = `${userId}/avatar-${Date.now()}-${file.originalname}`;

    //upload user image to supabase storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from("profile-avatars")
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (uploadError) {
      console.error(uploadError);

      return res.status(500).json({
        message: "Failed to upload profile image",
      });
    }

    //store image in avatar table
    const { data, error: avatarError } = await supabaseAdmin
      .from("profile_avatars")
      .upsert(
        {
          user_id: userId,
          avatar_url: filePath,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        },
      )
      .select()
      .single();

    if (avatarError) {
      console.error(avatarError);

      return res.status(500).json({
        message: "Image uploaded but failed to save avatar information",
      });
    }

    return res.status(200).json({
      message: "Profile image updated successfully",
      avatar: data,
    });
  } catch (error) {
    console.error("Upload avatar error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
