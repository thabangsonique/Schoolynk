import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { seedData } from "./data/seedData.js";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SECRETE_KEY;
const seedPassword = process.env.SEED_PASSWORD ?? "Schoolynk123!";

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "SUPABASE_URL and SUPABASE_SECRETE_KEY must be set in Backend/.env.",
  );
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const failOnError = (error, context) => {
  if (error) throw new Error(`${context}: ${error.message}`);
};

const localDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const timestampOn = (date, hour, minute = 0) => {
  const result = new Date(date);
  result.setHours(hour, minute, 0, 0);
  return result.toISOString();
};

async function getOrCreateAuthUser(account) {
  const { data: listed, error: listError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  failOnError(listError, "Could not list authentication users");

  const existing = listed.users.find((user) => user.email === account.email);
  if (existing) return existing.id;

  const { data, error } = await supabase.auth.admin.createUser({
    email: account.email,
    password: seedPassword,
    email_confirm: true,
    user_metadata: {
      first_name: account.firstName,
      last_name: account.lastName,
      role: account.role,
    },
  });
  failOnError(error, `Could not create ${account.email}`);
  return data.user.id;
}

async function findOrCreateClass(classData, teacherId) {
  const { data: existing, error: findError } = await supabase
    .from("classes")
    .select("id")
    .eq("name", classData.name)
    .eq("grade", classData.grade)
    .limit(1);
  failOnError(findError, `Could not find class ${classData.key}`);

  const payload = {
    name: classData.name,
    grade: classData.grade,
    teacher_id: teacherId,
    room_number: classData.roomNumber,
    student_capacity: classData.studentCapacity,
  };

  if (existing.length > 0) {
    const { data, error } = await supabase
      .from("classes")
      .update(payload)
      .eq("id", existing[0].id)
      .select("id")
      .single();
    failOnError(error, `Could not update class ${classData.key}`);
    return data.id;
  }

  const { data, error } = await supabase
    .from("classes")
    .insert(payload)
    .select("id")
    .single();
  failOnError(error, `Could not create class ${classData.key}`);
  return data.id;
}

async function findOrCreateParent(parent) {
  const { data: existing, error: findError } = await supabase
    .from("parents")
    .select("id")
    .eq("phone_number", parent.phoneNumber)
    .limit(1);
  failOnError(findError, `Could not find parent ${parent.key}`);

  if (existing.length > 0) return existing[0].id;

  const { data, error } = await supabase
    .from("parents")
    .insert({
      first_name: parent.firstName,
      last_name: parent.lastName,
      email: parent.email,
      phone_number: parent.phoneNumber,
      address: parent.address,
      relationship: parent.relationship,
    })
    .select("id")
    .single();
  failOnError(error, `Could not create parent ${parent.key}`);
  return data.id;
}

async function seedActivity(activity) {
  const { data: existing, error: findError } = await supabase
    .from("activity_logs")
    .select("id")
    .contains("metadata", { seed_key: activity.seedKey })
    .limit(1);
  failOnError(findError, `Could not check activity ${activity.seedKey}`);
  if (existing.length > 0) return;

  const { error } = await supabase.from("activity_logs").insert({
    actor_profile_id: activity.actorProfileId,
    event_type: activity.eventType,
    title: activity.title,
    description: activity.description,
    metadata: { ...activity.metadata, seed_key: activity.seedKey },
    created_at: activity.createdAt,
  });
  failOnError(error, `Could not create activity ${activity.seedKey}`);
}

async function main() {
  console.log("Seeding SchooLynk Supabase data...");

  const profileIds = {};
  for (const account of seedData.accounts) {
    profileIds[account.key] = await getOrCreateAuthUser(account);
  }

  const profileRows = seedData.accounts.map((account) => ({
    id: profileIds[account.key],
    first_name: account.firstName,
    last_name: account.lastName,
    role: account.role,
    status: "active",
  }));
  const { error: profilesError } = await supabase
    .from("profiles")
    .upsert(profileRows, { onConflict: "id" });
  failOnError(profilesError, "Could not upsert profiles");

  const teacherAccounts = seedData.accounts.filter(
    (account) => account.role === "teacher",
  );
  const { error: teachersError } = await supabase.from("teachers").upsert(
    teacherAccounts.map((account) => ({
      profile_id: profileIds[account.key],
      employee_number: account.employeeNumber,
    })),
    { onConflict: "profile_id" },
  );
  failOnError(teachersError, "Could not upsert teachers");

  const { data: teacherRows, error: teacherLookupError } = await supabase
    .from("teachers")
    .select("id, profile_id")
    .in(
      "profile_id",
      teacherAccounts.map((account) => profileIds[account.key]),
    );
  failOnError(teacherLookupError, "Could not retrieve teachers");

  const teacherIds = {};
  for (const account of teacherAccounts) {
    teacherIds[account.key] = teacherRows.find(
      (teacher) => teacher.profile_id === profileIds[account.key],
    ).id;
  }

  const classIds = {};
  for (const classData of seedData.classes) {
    classIds[classData.key] = await findOrCreateClass(
      classData,
      teacherIds[classData.teacherKey],
    );
  }

  const subjectRows = seedData.subjects.map((subject) => ({
    name: subject.name,
    code: subject.code,
    description: subject.description,
    lead_teacher_id: teacherIds[subject.leadTeacherKey],
  }));
  const { data: subjects, error: subjectsError } = await supabase
    .from("subjects")
    .upsert(subjectRows, { onConflict: "code" })
    .select("id, code");
  failOnError(subjectsError, "Could not upsert subjects");

  const parentIds = {};
  for (const parent of seedData.parents) {
    parentIds[parent.key] = await findOrCreateParent(parent);
  }

  const learnerRows = seedData.learners.map((learner) => ({
    student_number: learner.studentNumber,
    first_name: learner.firstName,
    last_name: learner.lastName,
    date_of_birth: learner.dateOfBirth,
    address: learner.address,
    class_id: classIds[learner.classKey],
    guardian_id: parentIds[learner.guardianKey],
  }));
  const { data: learners, error: learnersError } = await supabase
    .from("learners")
    .upsert(learnerRows, { onConflict: "student_number" })
    .select("id, student_number, class_id");
  failOnError(learnersError, "Could not upsert learners");

  const { error: avatarError } = await supabase.from("profile_avatars").upsert(
    seedData.accounts.map((account) => ({
      user_id: profileIds[account.key],
      avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(`${account.firstName} ${account.lastName}`)}&background=f5c542&color=1f2028`,
    })),
    { onConflict: "user_id" },
  );
  failOnError(avatarError, "Could not upsert profile avatars");

  for (const classData of seedData.classes) {
    for (const subject of subjects) {
      const { data: existing, error: findError } = await supabase
        .from("class_subjects")
        .select("id")
        .eq("class_id", classIds[classData.key])
        .eq("subject_id", subject.id)
        .limit(1);
      failOnError(findError, "Could not check class subject assignment");

      const assignment = {
        class_id: classIds[classData.key],
        subject_id: subject.id,
        teacher_id: teacherIds[classData.teacherKey],
        weekly_hours: subject.code === "MATH" || subject.code === "ENG-HL" ? 5 : 3,
      };

      const { error } = existing.length
        ? await supabase.from("class_subjects").update(assignment).eq("id", existing[0].id)
        : await supabase.from("class_subjects").insert(assignment);
      failOnError(error, "Could not seed class subject assignment");
    }
  }

  const { data: existingSettings, error: settingsFindError } = await supabase
    .from("school_settings")
    .select("id")
    .eq("school_name", seedData.school.school_name)
    .limit(1);
  failOnError(settingsFindError, "Could not check school settings");

  const { error: settingsError } = existingSettings.length
    ? await supabase
        .from("school_settings")
        .update(seedData.school)
        .eq("id", existingSettings[0].id)
    : await supabase.from("school_settings").insert(seedData.school);
  failOnError(settingsError, "Could not seed school settings");

  const now = new Date();
  const currentDay = now.getDay();
  const daysSinceMonday = currentDay === 0 ? 6 : currentDay - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - daysSinceMonday);
  monday.setHours(0, 0, 0, 0);
  const completedWeekdays = Math.max(1, currentDay === 0 ? 5 : currentDay);

  for (let offset = 0; offset < completedWeekdays; offset += 1) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + offset);
    const dateString = localDate(date);

    for (const account of teacherAccounts) {
      const { data: existing, error: findError } = await supabase
        .from("staff_attendance")
        .select("id")
        .eq("teacher_id", teacherIds[account.key])
        .eq("date", dateString)
        .limit(1);
      failOnError(findError, "Could not check staff attendance");

      if (existing.length === 0) {
        const isLate = account.key === "david" && offset === 1;
        const { error } = await supabase.from("staff_attendance").insert({
          teacher_id: teacherIds[account.key],
          date: dateString,
          clock_in: timestampOn(date, isLate ? 8 : 7, isLate ? 15 : 30),
          clock_out: timestampOn(date, 15, 30),
          status: "clocked_out",
          clock_in_latitude: seedData.school.geo_latitude,
          clock_in_longitude: seedData.school.geo_longitude,
        });
        failOnError(error, "Could not seed staff attendance");
      }
    }

    const attendanceRows = learners.map((learner, index) => {
      const classData = seedData.classes.find(
        (item) => item.key === seedData.learners.find((seedLearner) => seedLearner.studentNumber === learner.student_number).classKey,
      );
      const absent = (index + offset * 3) % 11 === 0;
      return {
        learner_id: learner.id,
        date: dateString,
        status: absent ? "absent" : "present",
        recorded_by: teacherIds[classData.teacherKey],
        submitted_at: timestampOn(date, 9, 0),
        submitted_by: teacherIds[classData.teacherKey],
      };
    });
    const { error: learnerAttendanceError } = await supabase
      .from("learner_attendance")
      .upsert(attendanceRows, { onConflict: "learner_id,date" });
    failOnError(learnerAttendanceError, "Could not upsert learner attendance");
  }

  const today = localDate(now);
  await seedActivity({
    seedKey: "seed-teacher-clock-in",
    actorProfileId: profileIds.sarah,
    eventType: "teacher_clock_in",
    title: "Teacher Sarah Johnson clocked in",
    description: "Logged by Sarah Johnson",
    metadata: { teacher_id: teacherIds.sarah },
    createdAt: timestampOn(now, 7, 31),
  });
  await seedActivity({
    seedKey: "seed-attendance-completed",
    actorProfileId: profileIds.sarah,
    eventType: "attendance_completed",
    title: "Grade 4A attendance completed",
    description: "Logged by Sarah Johnson",
    metadata: { class_id: classIds["4A"], date: today },
    createdAt: timestampOn(now, 8, 15),
  });
  await seedActivity({
    seedKey: "seed-learner-created",
    actorProfileId: profileIds.admin,
    eventType: "learner_created",
    title: "New learner added",
    description: "Logged by Admin",
    metadata: { learner_id: learners[0].id },
    createdAt: timestampOn(now, 9, 20),
  });

  console.log("Seed complete.");
  console.log(`Seed account password: ${seedPassword}`);
  console.log("Admin login: admin@schoolynk.test");
}

main().catch((error) => {
  console.error("Seed failed:", error.message);
  process.exitCode = 1;
});
