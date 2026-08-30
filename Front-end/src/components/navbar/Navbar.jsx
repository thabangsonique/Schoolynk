import React from "react";
import { useAuth } from "../../context/authContext";
import { Loader2, Search, ShieldCheck, Bell, ChevronDown } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const pageTitles = {
  "/admin/dashboard": "Dashboard",
  "/admin/dashboard/teachers": "Teachers",
  "/admin/dashboard/learners": "Learners",
  "/admin/dashboard/classes": "Classes",
  "/admin/dashboard/subjects": "Subjects",
  "/admin/dashboard/attendance": "Attendance",
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

  if (loading) {
    return <Loader2 className="animate-spin" />;
  }

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
      {/* middle-search bar */}
      <div className="flex gap-3 border border-text-secondary/10 rounded-lg py-3 pl-4 w-100">
        {/* search icon */}
        <Search className="text-text-secondary/40" />
        <input
          placeholder="Search records..."
          className="text-text-secondary focus:outlin-none placeholder:text-text-secondary/40 placeholder:text-lg"
        />
      </div>

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
        <Bell className="text-text-secondary  hover:cursor-pointer hover:text-white hover:scale-110 transition-all duration-300 " />
        {/* line */}
        <div className="h-15 bg-text-secondary/15 w-0.5 " />
        {/* user */}
        <div className="flex items-center gap-1">
          {/* user-image */}
          <div className="rounded-full overflow-hidden h-12 w-12">
            <img
              src="/user.png"
              alt="profile image"
              className=" object-cover"
            />
          </div>

          {/* user-text */}
          <div className="ml-2">
            <span className="text-white font-bold text-lg">
              {role === "admin" && "Admin"}
            </span>
            <p className="text-text-secondary/40">
              {role === "admin" && "Administrator"}
            </p>
          </div>
          {/* chevron down */}
          <button>
            {" "}
            <ChevronDown className="text-text-secondary/40 hover:cursor-pointer hover:text-text-secondary " />
          </button>
        </div>
      </div>
    </div>
  );
}
