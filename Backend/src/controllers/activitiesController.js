import { supabaseAdmin } from "../config/supabaseClient.js";

export const getRecentActivities = async (req, res) => {
  try {
    //return only few recent activities
    const limit = Math.min(Number(req.query.limit) || 10, 50);

    const { data, error } = await supabaseAdmin
      .from("activity_logs")
      .select(
        `
        id,
        actor_profile_id,
        event_type,
        title,
        description,
        metadata,
        created_at
      `,
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching activities:", error);

      return res.status(500).json({
        message: "Failed to fetch activities",
      });
    }

    return res.status(200).json({
      activities: data,
    });
  } catch (error) {
    console.error("Get activities error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
