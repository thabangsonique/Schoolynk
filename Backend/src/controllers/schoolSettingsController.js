import { supabaseAdmin } from "../config/supabaseClient.js";

//GET the configured school settings (profile info shown on the settings page).
export const getSchoolSettings = async (req, res) => {
  try {
    console.log("Fetching school settings...");

    // Use the Supabase client from the request (which has the user's auth context)
    // instead of the admin client, to respect RLS policies
    const client = req.supabase || supabaseAdmin;

    const { data, error } = await client
      .from("school_settings")
      .select(
        "id, school_name, geo_latitude, geo_longitude, geo_radius_meters, clock_in_start, clock_in_deadline, notifications_enabled",
      )
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(400).json({
        message: "Failed to fetch school settings",
        error: error.message,
        details: error,
      });
    }

    if (!data) {
      console.warn("No school settings found in database");
      return res.status(404).json({
        message:
          "School settings have not been configured yet. Please run the seed migration.",
      });
    }

    console.log("School settings fetched successfully:", data);
    return res.status(200).json({
      message: "School settings fetched successfully",
      school_settings: data,
    });
  } catch (error) {
    console.error("Error fetching school settings:", error);
    return res.status(500).json({
      message: "Internal server error fetching school settings",
      error: error.message,
    });
  }
};

//UPDATE the school's notification preference.
export const updateNotificationsEnabled = async (req, res) => {
  try {
    const { enabled } = req.body;

    if (typeof enabled !== "boolean") {
      return res.status(400).json({
        message: "enabled must be a boolean (true or false)",
      });
    }

    const { data, error } = await supabaseAdmin
      .from("school_settings")
      .update({ notifications_enabled: enabled })
      .neq("id", null)
      .select(
        "id, school_name, geo_latitude, geo_longitude, geo_radius_meters, clock_in_start, clock_in_deadline, notifications_enabled",
      )
      .maybeSingle();

    if (error) {
      return res.status(400).json({
        message: "Failed to update notification preference",
        error: error.message,
      });
    }

    if (!data) {
      return res.status(404).json({
        message: "School settings have not been configured yet.",
      });
    }

    return res.status(200).json({
      message: "Notification preference updated successfully",
      school_settings: data,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error updating notification preference",
      error: error.message,
    });
  }
};
