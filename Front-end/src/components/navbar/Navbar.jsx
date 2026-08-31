import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/authContext";
import {
  Loader2,
  Search,
  ShieldCheck,
  Bell,
  ChevronDown,
  Clock,
  ClipboardCheck,
  LogIn,
  X,
  User as UserIcon,
  Mail,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  useGetRecentActivitiesQuery,
  useGetSchoolSettingsQuery,
} from "../../features/api";

const pageTitles = {
  "/admin/dashboard": "Dashboard",
  "/admin/dashboard/teachers": "Teachers",
  "/admin/dashboard/learners": "Learners",
  "/admin/dashboard/classes": "Classes",
  "/admin/dashboard/subjects": "Subjects",
  "/admin/dashboard/attendance": "Attendance",
  "/admin/dashboard/settings": "Settings",
  "/teacher/dashboard": "Teacher Dashboard",
  "/teacher/dashboard/my-class": "My Class",
  "/teacher/dashboard/my-learners": "My Learners",
  "/teacher/dashboard/take-attendance": "Take Attendance",
  "/teacher/dashboard/my-attendance": "My Attendance",
};

export default function Navbar() {
  const location = useLocation();

  const isSidebarCollapsed = useSelector(
    (state) => state.global.isSidebarCollapsed,
  );

  const pageTitle = pageTitles[location.pathname];
  const { user, profile, loading, role } = useAuth();

  //notification dropdown state.
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  //user profile dropdown state.
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  //fetch the school activity updates shown in the bell dropdown.
  const { data: activities = [], isLoading: activitiesLoading } =
    useGetRecentActivitiesQuery(undefined, {
      refetchOnMountOrArgChange: true,
    });

  //fetch the school's notification preference (toggle from the settings page).
  const { data: schoolSettings } = useGetSchoolSettingsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  //only show notifications when the admin has them enabled.
  const notificationsEnabled = schoolSettings?.notifications_enabled !== false;

  //close the dropdowns when clicking outside of them.
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  if (loading) {
    return <Loader2 className="animate-spin" />;
  }

  //format an ISO timestamp as a time e.g. "2:05 PM".
  const formatTime = (value) => {
    if (!value) return "";
    return new Date(value).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  //the actor name: prefer the enriched actor_name, fall back to metadata.
  const getActivityActorName = (activity) => {
    if (activity.actor_name) return activity.actor_name;
    const metaName = activity.metadata?.teacher_name;
    if (metaName) return metaName;
    return "Unknown";
  };

  //icon + color per event type.
  const getActivityVisual = (activity) => {
    if (activity.event_type === "attendance_register_completed") {
      return {
        icon: <ClipboardCheck size={16} />,
        box: "bg-text-green/10 text-text-green",
      };
    }
    if (activity.event_type === "Teacher_clocked_in") {
      return {
        icon: <LogIn size={16} />,
        box: "bg-primary/10 text-primary",
      };
    }
    return {
      icon: <Clock size={16} />,
      box: "bg-primary/10 text-primary",
    };
  };

  return (
    <div
      className={`flex sticky top-0 z-50 justify-between items-center shadow-lg py-4 px-10 bg-card-2 ${isSidebarCollapsed && "pl-30"}`}
    >
      {/* left-side */}
      <h1 className="text-text-secondary/40 text-xl capitalize font-bold">
        {role} Portal{" "}
        <span className="ml-2 text-2xl text-text-secondary/40">/</span>
        <span className="capitalize text-white ml-2 text-2xl font-bold">
          {pageTitle}
        </span>
      </h1>

      {/* display role */}
      <div className="flex gap-2 py-3 px-3 justify-center items-center bg-primary/10 border border-primary/40 rounded-full">
        <ShieldCheck className="text-primary" />
        <p className="text-base font-semibold text-primary">
          Role:
          <span className="uppercase ml-2 font-semibold tracking-wider">
            {role}
          </span>
        </p>
      </div>

      {/* right-side user-profile */}
      <div className="flex items-center gap-8">
        {/* notifications - admin only */}
        {role === "admin" && notificationsEnabled && (
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative text-text-secondary hover:text-white hover:cursor-pointer focus:outline-none"
              title="School updates"
            >
              <Bell className="hover:text-white hover:scale-110 transition-all duration-300" />
              {/* badge showing the number of updates (cap display at 9+) */}
              {activities.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-black text-xs font-bold rounded-full h-5 min-w-5 px-1 flex items-center justify-center">
                  {activities.length > 9 ? "9+" : activities.length}
                </span>
              )}
            </button>

            {/* dropdown */}
            {notifOpen && (
              <div className="absolute right-0 top-full mt-3 w-[380px] bg-card-2 border border-text-secondary/10 rounded-2xl shadow-2xl overflow-hidden z-50">
                {/* header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-text-secondary/10">
                  <h2 className="text-white font-bold text-lg">
                    Recent School Updates
                  </h2>
                  <button
                    onClick={() => setNotifOpen(false)}
                    className="text-text-secondary hover:text-white transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* body */}
                <div className="max-h-96 overflow-y-auto">
                  {activitiesLoading && (
                    <p className="px-5 py-8 text-center text-text-secondary">
                      Loading updates...
                    </p>
                  )}

                  {!activitiesLoading && activities.length === 0 && (
                    <p className="px-5 py-8 text-center text-text-secondary">
                      No school updates yet.
                    </p>
                  )}

                  {!activitiesLoading &&
                    activities.map((activity) => {
                      const visual = getActivityVisual(activity);
                      const actor = getActivityActorName(activity);
                      const className = activity.metadata?.class_name;
                      return (
                        <div
                          key={activity.id}
                          className="flex items-start gap-3 px-5 py-4 border-b border-text-secondary/5 hover:bg-[#2A2A2A] transition-colors"
                        >
                          <div
                            className={`shrink-0 rounded-xl p-3 flex items-center justify-center ${visual.box}`}
                          >
                            {visual.icon}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-white font-semibold text-sm">
                              {activity.event_type ===
                              "attendance_register_completed"
                                ? `${actor} completed the attendance register`
                                : activity.event_type === "Teacher_clocked_in"
                                  ? `${actor} clocked in`
                                  : activity.title}
                            </p>

                            {className && (
                              <p className="text-text-secondary text-xs mt-0.5">
                                Class {className}
                              </p>
                            )}

                            <p className="text-text-secondary/50 text-xs mt-1">
                              {formatTime(activity.created_at)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        )}
        {/* line */}
        <div className="h-15 bg-text-secondary/15 w-0.5 " />
        {/* user - clickable to toggle the profile dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-1 hover:cursor-pointer focus:outline-none"
          >
            {/* user-image */}
            <div className="rounded-full overflow-hidden h-12 w-12">
              <img
                src="/user.png"
                alt="profile image"
                className=" object-cover"
              />
            </div>

            {/* user-text */}
            <div className="ml-2 text-left">
              <span className="text-white font-bold text-lg">
                {role === "admin" ? "Admin" : "Teacher"}
              </span>
              <p className="text-text-secondary/40">
                {role === "admin" ? "Administrator" : "Instructor"}
              </p>
            </div>
            {/* chevron down */}
            <ChevronDown
              className={`text-text-secondary/40 hover:text-text-secondary transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* user profile dropdown */}
          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-3 w-72 bg-card-2 border border-text-secondary/10 rounded-2xl shadow-2xl overflow-hidden z-50">
              {/* header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-text-secondary/10">
                <div className="rounded-full overflow-hidden h-12 w-12 shrink-0">
                  <img
                    src="/user.png"
                    alt="profile image"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-white font-bold text-lg truncate">
                    {profile?.first_name ?? ""} {profile?.last_name ?? ""}
                  </p>
                  <p className="text-text-secondary text-sm truncate">
                    {role === "admin" ? "Administrator" : "Instructor"}
                  </p>
                </div>
              </div>

              {/* body */}
              <div className="px-5 py-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2.5 rounded-xl shrink-0">
                    <UserIcon size={18} className="text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-text-secondary text-xs">Full Name</p>
                    <p className="text-white font-semibold truncate">
                      {profile?.first_name ?? ""} {profile?.last_name ?? ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2.5 rounded-xl shrink-0">
                    <Mail size={18} className="text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-text-secondary text-xs">Email</p>
                    <p className="text-white font-semibold truncate">
                      {user?.email ?? "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
