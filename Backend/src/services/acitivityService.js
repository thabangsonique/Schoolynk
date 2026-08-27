import { supabaseAdmin } from "../config/supabaseClient.js";

export const creatActivity = async ({
  actorProfileId,
  eventType,
  title,
  description,
  metadata = {},
}) => {
  const { error } = await supabaseAdmin.from("activity_logs").insert({
    actor_profile_id: actorProfileId,
    event_type: eventType,
    title,
    description,
    metadata,
  });

  if (error) {
    console.error("could not create activity", error.message);
  }
};
