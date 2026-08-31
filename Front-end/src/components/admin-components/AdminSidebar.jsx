import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  School,
  Users,
  LayoutDashboard,
  GraduationCap,
  Layers,
  BookOpen,
  CalendarCheck,
  Settings,
  LogOut,
  ChevronRight,
  ChevronLeft,
  X,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  setSidebarCollapsed,
  setMobileSidebarOpen,
} from "../../features/globalSlice";
import { useAuth } from "../../context/authContext";

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin/dashboard",
  },
  {
    title: "Teachers",
    icon: Users,
    href: "/admin/dashboard/teachers",
  },
  {
    title: "Learners",
    icon: GraduationCap,
    href: "/admin/dashboard/learners",
  },
  {
    title: "Classes",
    icon: Layers,
    href: "/admin/dashboard/classes",
  },
  {
    title: "Subjects",
    icon: BookOpen,
    href: "/admin/dashboard/subjects",
  },
  {
    title: "Attendance",
    icon: CalendarCheck,
    href: "/admin/dashboard/attendance",
  },
];

export default function AdminSidebar() {
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
  const mobileSidebarOpen = useSelector(
    (state) => state.global.mobileSidebarOpen,
  );

  const widthClass = isSidebarCollapsed ? "lg:w-[100px] w-[300px]" : "w-[300px]";

  //desktop: fixed positioned sidebar. mobile: slides in as an overlay drawer.
  const sidebarClasses = `bg-card-2 hide-scrollbar z-60 flex flex-col overflow-y-auto h-full py-5 border-r border-text-secondary/10 transition-all duration-300 ${widthClass} fixed top-0 left-0 -translate-x-full lg:translate-x-0 ${mobileSidebarOpen ? "translate-x-0" : ""}`;

  return (
    <>
      {/* mobile/tablet backdrop */}
      {mobileSidebarOpen && (
        <div
          onClick={() => dispatch(setMobileSidebarOpen(false))}
          className="fixed inset-0 z-50 bg-black/60 lg:hidden"
        />
      )}

      <div className={sidebarClasses}>
      {/* //header section. */}
      <div
        className={`w-full flex items-center gap-3 px-8 pb-5 border-b border-text-secondary/10 justify-between ${
          isSidebarCollapsed ? "lg:justify-center" : "justify-between"
        }`}
      >
        {/* icon */}
        <div
          className={`flex items-center justify-center h-15 w-15 rounded-xl bg-primary ${
            isSidebarCollapsed ? "lg:bg-transparent lg:text-primary" : "bg-primary"
          }`}
        >
          <School size={40} />
        </div>
        {/* text -> always shown on the mobile drawer, shown on desktop only when expanded */}
        <div
          className={`block ${isSidebarCollapsed ? "lg:hidden" : ""}`}
        >
          <h1 className="text-white text-2xl font-bold">SchooLynk</h1>
          <p className="text-text-secondary/50 uppercase tracking-wide">
            Primary Schools
          </p>
        </div>

        {/* sidebar toggle - desktop only. mobile uses the close button. */}
        <div className="hidden lg:block">
          {isSidebarCollapsed ? (
            <button
              onClick={() =>
                dispatch(setSidebarCollapsed(!isSidebarCollapsed))
              }
              className="rounded-lg hover:cursor-pointer py-2 transition-[width] duration-300 hover:bg-text-secondary/10"
            >
              <ChevronRight size={30} className=" text-text-secondary/40 " />
            </button>
          ) : (
            <button
              onClick={() =>
                dispatch(setSidebarCollapsed(!isSidebarCollapsed))
              }
              className=" rounded-lg hover:cursor-pointer py-2 transition-all duration-300 hover:bg-text-secondary/10"
            >
              {" "}
              <ChevronLeft size={30} className=" text-text-secondary/40 " />
            </button>
          )}
        </div>

        {/* mobile close button (only on the drawer) */}
        <button
          onClick={() => dispatch(setMobileSidebarOpen(false))}
          className="rounded-lg hover:cursor-pointer py-2 lg:hidden hover:bg-text-secondary/10"
        >
          <X size={26} className="text-text-secondary/60" />
        </button>
      </div>

      {/* MAIN ITEMS SECTION */}
      <div className="mt-10 px-4">
        {/* <p
          className={`uppercase text-text-secondary/50 font-bold mb-3 pl-4 ${isSidebarCollapsed ? "hidden" : "block"}`}
        >
          School management
        </p> */}
        {menuItems.map((item, idx) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={idx}
              to={item.href}
              end={item.href === "/admin/dashboard"}
              className={({ isActive }) =>
                `flex items-center rounded-xl px-3 py-3 mb-4 transition-all duration-200 gap-5 ${
                  isSidebarCollapsed
                    ? "lg:justify-center lg:gap-0"
                    : "gap-5"
                } ${
                  isActive
                    ? "bg-primary text-black shadow-lg"
                    : "text-text-secondary hover:bg-text-secondary/10"
                }`
              }
            >
              <Icon />
              <span
                className={`text-lg font-bold opacity-100 w-auto ${
                  isSidebarCollapsed ? "lg:opacity-0 lg:w-0 lg:hidden" : ""
                }`}
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
        <NavLink
          to="/admin/dashboard/settings"
          className={({ isActive }) =>
            `flex items-center rounded-xl px-3 py-2.5 transition-all duration-200 gap-3 ${
              isSidebarCollapsed ? "lg:justify-center lg:gap-0" : "gap-3"
            } ${
              isActive
                ? "bg-primary text-black shadow-lg"
                : "text-text-secondary hover:bg-text-secondary/10 hover:text-white"
            }`
          }
        >
          <Settings />
          <span
            className={`text-lg font-bold opacity-100 w-auto ${
              isSidebarCollapsed ? "lg:opacity-0 lg:w-0 lg:hidden" : ""
            }`}
          >
            Settings
          </span>
        </NavLink>
        {/* logOut */}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 text-red-400 hover:bg-text-secondary/10 rounded-xl px-3 py-2.5 w-full transition-all duration-200 hover:cursor-pointer"
        >
          <LogOut />
          <span
            className={`text-lg font-bold opacity-100 w-auto ${
              isSidebarCollapsed ? "lg:opacity-0 lg:w-0 lg:hidden" : ""
            }`}
          >
            Sign Out
          </span>
        </button>
      </div>
    </div>
    </>
  );
}
