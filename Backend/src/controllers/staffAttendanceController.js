import { supabase, supabaseAdmin } from "../config/supabaseClient.js";

//GEO CHECK.
//check if teacher is within the radius.
//havasine formula function to calculate radial difference.
const getDistanceMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // earth radius
  const toRad = (deg) => (deg * Math.PI) / 180; //function converts deg(lat2 - lat1) difference to radians.

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  //a -gives how far apart are the coordinates.
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  //returns the distant between two points- how the teacher is from the school.
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

//CLOCK IN(TEACHERS)
export const clockIn = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const userId = req.user.id;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        message: "Location is required to clock in. Please enable Location.",
      });
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    if (
      isNaN(lat) ||
      isNaN(lon) ||
      lat < -90 ||
      lat > 90 ||
      lon < -180 ||
      lon > 180
    ) {
      return res.status(400).json({
        message: "Invalid location coordinates.",
      });
    }

    //check if teacher trying to clock in exists.
    const { data: teacher, error } = await supabaseAdmin
      .from("teachers")
      .select("id, profiles(first_name, last_name)")
      .eq("profile_id", userId)
      .single();

    if (error) {
      return res.status(403).json({
        message: "Failed to check teacher exists",
        error,
      });
    }
    if (!teacher) {
      return res.status(403).json({
        message: "Teacher record not found for this account.",
      });
    }

    //teacher exists- fetch school geo location.
    const { data: schoolSettings, error: settingsError } = await supabaseAdmin
      .from("school_settings")
      .select(
        "id,school_name,geo_latitude,geo_longitude,geo_radius_meters, clock_in_deadline",
      )
      .limit(1)
      .single();

    if (settingsError) {
      return res.status(400).json({
        message: "Failed to fetch school settings.",
        settingsError,
      });
    }

    if (!schoolSettings) {
      return res.status(400).json({
        message:
          "School geofence is not configured. Please contact the administrator.",
        schoolSettings,
      });
    }

    //verify if teacher is within school.
    const distance = getDistanceMeters(
      lat,
      lon,
      parseFloat(schoolSettings.geo_latitude),
      parseFloat(schoolSettings.geo_longitude),
    );

    //check distance.
    if (distance > schoolSettings.geo_radius_meters) {
      return res.status(400).json({
        message: `You are ${Math.round(distance)}m away from the school. You must be within ${schoolSettings.geo_radius_meters}m to clock in.`,
        distance_meters: Math.round(distance),
        allow_distance_meters: schoolSettings.geo_radius_meters,
      });
    }

    //if teacher is within distance.
    //check clock in.
    const dateToday = new Date().toISOString().split("T")[0];

    const { data: clockInExists, error: existsError } = await supabaseAdmin
      .from("staff_attendance")
      .select("id,clock_in,status")
      .eq("teacher_id", teacher.id)
      .eq("date", dateToday)
      .maybeSingle();

    if (existsError) {
      return res.status(400).json({
        message: "Failed to fetch staff attendance.",
        existsError,
      });
    }

    if (clockInExists) {
      return res.status(400).json({
        message: `You already clocked in today at ${clockInExists.clock_in}`,
        attentance: clockInExists,
      });
    }

    //if teacher hasnt clocked in today-check if they are late.
    const now = new Date();
    const serverTime = now.toTimeString().slice(0, 8);
    const isLate = serverTime > schoolSettings.clock_in_deadline;

    //insert teacher to staff_attendance table
    const { data: attendance, error: attendError } = await supabaseAdmin
      .from("staff_attendance")
      .insert({
        teacher_id: teacher.id,
        date: dateToday,
        clock_in: now.toISOString(),
        status: isLate ? "late" : "clocked_in",
        clock_in_latitude: lat,
        clock_in_longitude: lon,
      })
      .select()
      .single();

    if (attendError) {
      return res.status(400).json({
        message: "Failed to clockIn,",
        attendError,
      });
    }

    return res.status(200).json({
      message: isLate
        ? `clocked-in successfully. Marked late - clocked after ${schoolSettings.clock_in_deadline}`
        : "Clocked-in successfully",
      attendance: {
        ...attendance,
        teacher_name: `${teacher.profiles.first_name}, ${teacher.profiles.last_name}`,
        distance: Math.round(distance),
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error. clocking in",
      error: error.message,
    });
  }
};

//TEACHER CLOCK OUT.
export const clockOut = async (req, res) => {
  try {
    const userId = req.user.id;

    //check if teacher exists.
    const { data: teacher, error } = await supabaseAdmin
      .from("teachers")
      .select("id, profiles(first_name, last_name)")
      .eq("profile_id", userId)
      .single(); //return as a single object.

    if (error) {
      return res.status(400).json({
        message: "Failed to resolve logged-in teacher",
        error: error.message,
      });
    }

    if (!teacher) {
      return res.status(404).json({
        message: "Teacher Not found",
      });
    }

    //check if teacher is already clocked that day.
    const now = new Date().toISOString().split("T")[0];

    const { data: clockedIn, error: clockedInError } = await supabaseAdmin
      .from("staff_attendance")
      .select("id, date,clock_in, clock_out, status")
      .eq("teacher_id", teacher.id)
      .eq("date", now)
      .maybeSingle();

    if (clockedInError) {
      return res.status(400).json({
        message: "Failed to check clocked in",
        error: clockedInError.message,
      });
    }

    if (!clockedIn) {
      return res.status(400).json({
        message:
          "You haven't clocked in today. Clock in first before clocking out.",
      });
    }

    //check if teacher already clocked out.
    if (clockedIn.clock_out) {
      return res.status(400).json({
        message: `You already clocked out today at ${clockedIn.clock_out}`,
        clockedIn,
      });
    }

    const nowClockOut = new Date();

    //record clockout.
    const { data: update, error: updateError } = await supabaseAdmin
      .from("staff_attendance")
      .update({
        clock_out: nowClockOut.toISOString(),
        status: "clocked_out",
      })
      .eq("id", clockedIn.id)
      .select()
      .single();

    if (updateError) {
      return res.status(400).json({
        message: "Failed to update staff attendace",
        updateError,
      });
    }

    //calculate the hourse worked.
    const clockedInTime = new Date(clockedIn.clock_in);

    const hoursWorked = (
      (nowClockOut - clockedInTime) /
      (1000 * 60 * 60)
    ).toFixed(2);

    return res.status(200).json({
      message: "Clocked out successfully",
      ...clockedIn,
      teacher_name: `${teacher.profiles.first_name} ${teacher.profiles.last_name}`,
      hours_worked: parseFloat(hoursWorked),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error. clocking-out",
      error: error.message,
    });
  }
};

//VIEW MY ATTENDANCE(TEACHER).
export const viewMyAttendance = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: teacher, error: errorTeacher } = await supabaseAdmin
      .from("teachers")
      .select("id")
      .eq("profile_id", userId)
      .single();

    if (errorTeacher) {
      return res
        .status(400)
        .json({ message: "Failed to fetch teacher's records" });
    }

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found." });
    }

    //fetch teacher staff attendance.
    const { data: teacherHistory, error: errorHistory } = await supabaseAdmin
      .from("staff_attendance")
      .select("id, date, clock_in,clock_out,status")
      .eq("teacher_id", teacher.id)
      .order("date", { ascending: false });

    if (errorHistory) {
      return res.status(400).json({
        message: "Failed to fetch teacher attendance history",
        errorHistory,
      });
    }

    if (!teacherHistory) {
      return res.status(400).json({
        message: "No attendance record found. You need to build record first",
      });
    }

    const recordsWithHours = (teacherHistory ?? []).map((record) => {
      let hoursWorked = null;
      if (record.clock_in && record.clock_out) {
        const ms = new Date(record.clock_out) - new Date(record.clock_in);
        hoursWorked = parseFloat((ms / (1000 * 60 * 60)).toFixed(2));
      }
      return { ...record, hours_worked: hoursWorked };
    });

    //grab length across all records.
    const totalRecords = recordsWithHours.length;

    const completedRecords = recordsWithHours.filter(
      (r) => r.hours_worked !== null,
    );

    const monthlyHours = parseFloat(
      completedRecords.reduce((sum, r) => sum + r.hours_worked, 0).toFixed(1),
    );

    const completedShifts = completedRecords.length;

    //filter for late status
    const lateArrivals = recordsWithHours.filter(
      (r) => r.status === "late",
    ).length;

    const onTimeRecords = totalRecords - lateArrivals;

    //calculate percentage.
    const onTimeRate =
      totalRecords > 0
        ? parseFloat(((onTimeRecords / totalRecords) * 100).toFixed(1))
        : 0;

    const avgHours =
      completedShifts > 0
        ? parseFloat((monthlyHours / completedShifts).toFixed(1))
        : 0;

    return res.status(200).json({
      message: "Attendance history fetched successfully",
      summary: {
        total_records: totalRecords,
        monthly_hours: monthlyHours,
        completed_shifts: completedShifts,
        late_arrivals: lateArrivals,
        on_time_records: onTimeRecords,
        on_time_rate: onTimeRate,
        average_hours_per_shift: avgHours,
      },
      records: recordsWithHours,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error. clocking-out",
      error: error.message,
    });
  }
};
