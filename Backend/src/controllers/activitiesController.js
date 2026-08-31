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
        created_at,
        actors:profiles!actor_profile_id(first_name, last_name)
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

    const enriched = (data ?? []).map((activity) => {
      const profile = Array.isArray(activity.actors)
        ? activity.actors[0]
        : activity.actors;
      return {
        ...activity,
        actor_name: profile
          ? `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim()
          : null,
        //expose the raw profile array under "actors" is not needed by the UI.
        actors: undefined,
      };
    });

    return res.status(200).json({
      activities: enriched,
    });
  } catch (error) {
    console.error("Get activities error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
