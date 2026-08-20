import { supabase } from "../../config/supabaseClient.js";

export const requireRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      console.log("========== REQUIRE ROLE ==========");
      console.log("req.user:", req.user);
      console.log("allowed roles:", allowedRoles);
      //garb user info from the middleware.
      if (!req.user) {
        console.log("req.user is missing");
        return res.status(401).json({ message: "User not authorized" });
      }

      //otherwise check the role of this user.
      const { data: profile, error } = await req.supabase
        .from("profiles")
        .select("role")
        .eq("id", req.user.id)
        .single();

      if (!profile || error) {
        console.log("PROFILE LOOKUP");
        console.log("profile not found", profile, error);
        return res.status(404).json({ message: "User not found." });
      }

      if (!allowedRoles.includes(profile.role)) {
        return res
          .status(401)
          .json({ message: "You are not allowed to access this resource" });
      }

      req.userRole = profile.role;

      console.log("Role authorized:", req.userRole);

      next();
    } catch (error) {
      console.log("REQUIRE ROLE ERROR");
      return res.status(500).json({ message: "Internal server error", error });
    }
  };
};
