import { createClient } from "@supabase/supabase-js";
import { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "../../config/supabaseClient.js";

export const authenticatedUser = async (req, res, next) => {
  console.log("AUTHENTICATION MIDDLEWARE REACHED!!");
  try {
    //grab the token form the auth headers
    const authHeader = req.headers.authorization;

    console.log(authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization is required" });
    }

    const token = authHeader.split(" ")[1];

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (!user || error) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    req.user = user;

    //tell supabase that this user is allowed to make requests.

    req.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY,
        {
          global: {
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
      },
    );

    next();
  } catch (error) {
    console.log("Authentication middleware error");
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
