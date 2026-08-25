import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../config/supabase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  //info about logged in user
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(null);

  //function to load user's profile.
  const loadProfile = async (authUser) => {
    //if user is not logged in
    if (!authUser) {
      setProfile(null);
      return;
    }

    //if user logged in. fetch user profile.
    const { data, error } = await supabase
      .from("profiles")
      .select("id, first_name,last_name,role,status")
      .eq("id", authUser.id)
      .single();

    if (!error) setProfile(data);
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      setUser(currentUser);
      await loadProfile(currentUser); //fetch the users profile
      setLoading(false);
    };

    initializeAuth();

    //listener-for when user logs in /out-lestining for logs in and logs-out
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      await loadProfile(session?.user);
    });

    return () => subscription.unsubscribe(); //only when app closes.
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, role: profile?.role }}
    >
      {children}
    </AuthContext.Provider>
  );
};

//function that helps app retrieve Authcontext data.
export function useAuth() {
  return useContext(AuthContext);
}
