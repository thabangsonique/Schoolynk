import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  School,
  LayoutDashboard,
  GraduationCap,
  Layers,
  ClipboardCheck,
  CalendarCheck,
  Settings,
  LogOut,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { setSidebarCollapsed } from "../../features/globalSlice";
import { useAuth } from "../../context/authContext";

const menuItems = [
  {
    title: "Teacher Dashboard",
    icon: LayoutDashboard,
    href: "/teacher/dashboard",
  },
  {
    title: "My Class",
    icon: Layers,
    href: "/teacher/dashboard/my-class",
  },
  {
    title: "My Learners",
    icon: GraduationCap,
    href: "/teacher/dashboard/my-learners",
  },
  {
    title: "Take Attendance",
    icon: ClipboardCheck,
    href: "/teacher/dashboard/take-attendance",
  },
  {
    title: "My Attendance",
    icon: CalendarCheck,
    href: "/teacher/dashboard/my-attendance",
  },
];

export default function TeacherSidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut(); //sign the user out of supabase.
    navigate("/login"); //redirect to the login page.
  };

  const isSidebarCollapsed = useSelector(
    (state) => state.global.isSidebarCollapsed,
  );
  const sidebarClasses = `bg-card-2 fixed hide-scrollbar z-60 flex flex-col overflow-y-auto h-[100%] py-5 border-r border-text-secondary/10 transition-all duration-300 ${isSidebarCollapsed ? "w-[100px]" : "w-[300px]"}`;
  return (
    <div className={sidebarClasses}>
      {/* //header section. */}
      <div
        className={`w-full flex items-center gap-3 px-8 pb-5 border-b border-text-secondary/10 ${isSidebarCollapsed ? "justify-center" : "justify-between"}`}
      >
        {/* icon */}
        <div
          className={`flex items-center justify-center h-15 w-15 rounded-xl ${isSidebarCollapsed ? "bg-transparent text-primary" : "bg-primary "}`}
        >
          <School size={40} />
        </div>
        {/* text */}
        {!isSidebarCollapsed && (
          <div>
            <h1 className="text-white text-2xl font-bold">SchooLynk</h1>

            <p className="text-text-secondary/50 uppercase tracking-wide">
              Primary Schools
            </p>
          </div>
        )}

        {/* sidebar toggle */}
        {isSidebarCollapsed ? (
          <button
            onClick={() => dispatch(setSidebarCollapsed(!isSidebarCollapsed))}
            className="rounded-lg hover:cursor-pointer py-2 transition-[width] duration-300 hover:bg-text-secondary/10"
          >
            <ChevronRight size={30} className=" text-text-secondary/40 " />
          </button>
        ) : (
          <button
            onClick={() => dispatch(setSidebarCollapsed(!isSidebarCollapsed))}
            className=" rounded-lg hover:cursor-pointer py-2 transition-all duration-300 hover:bg-text-secondary/10"
          >
            {" "}
            <ChevronLeft size={30} className=" text-text-secondary/40 " />
          </button>
        )}
      </div>

      {/* MAIN ITEMS SECTION */}
      <div className="mt-10 px-4">
        {menuItems.map((item, idx) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={idx}
              to={item.href}
              end={item.href === "/teacher/dashboard"}
              className={({ isActive }) =>
                `flex items-center rounded-xl px-3 py-3 mb-4 transition-all duration-200 ${
                  isSidebarCollapsed ? "justify-center" : "gap-5"
                } ${
                  isActive
                    ? "bg-primary text-black shadow-lg"
                    : "text-text-secondary hover:bg-text-secondary/10"
                }`
              }
            >
              <Icon />
              <span
                className={`text-lg font-bold ${isSidebarCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"}`}
              >
                {item.title}
              </span>
            </NavLink>
          );
        })}
      </div>

      {/* SIDEBAR FOOTER */}
      <div className="mt-auto px-8 pb-4 pt-6 space-y-4 border-t border-text-secondary/10">
        {/* settings */}

        {/* logOut */}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 text-red-400 hover:bg-text-secondary/10 rounded-xl px-3 py-2.5 w-full transition-all duration-200 hover:cursor-pointer"
        >
          <LogOut />
          <span
            className={`text-lg font-bold ${isSidebarCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"}`}
          >
            Sign Out
          </span>
        </button>
      </div>
    </div>
  );
}
