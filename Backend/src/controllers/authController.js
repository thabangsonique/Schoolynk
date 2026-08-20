import { supabase, supabaseAdmin } from "../config/supabaseClient.js";

export const LogIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and paasowrd is required" });
    }

    const { data: loggedInUser, error: loginError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (loginError) {
      return res
        .status(400)
        .json({ message: "Failed to login User", loginError });
    }

    return res.status(201).json({
      message: "User logged in successfully.",
      user: loggedInUser,
      token: loggedInUser.session.access_token,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
};

export const signUpAdmin = async (req, res) => {
  try {
    const { email, password, first_name, last_name } = req.body;

    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({ message: "All the fields are required" });
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({ message: "Failed to create User", error });
    }

    const user = data.user;

    //store admin info inside the profiles table.
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: user.id,
        first_name,
        last_name,
        role: "admin",
        status: "active",
      })
      .select()
      .single();

    if (profileError) {
      return res
        .status(400)
        .json({ message: "Failed to add user profile", profileError });
    }

    return res.status(201).json({
      message: "User created successfully",
      userLogin: data,
      profile: userProfile,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
