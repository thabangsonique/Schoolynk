import { supabase } from "../config/supabase.js";

//we need logged in user profile
export const getCurrentUserProfile = async () => {
  //get user from supabase manually(without auth context).

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id,fisrt_name,last_name,role,status")
    .eq("id", user.id)
    .single();

  if (error) throw error;

  return profile;
};
