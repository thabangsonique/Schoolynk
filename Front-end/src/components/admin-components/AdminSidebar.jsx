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
  ChevronsLeft,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { setSidebarCollapsed } from "../../features/globalSlice";

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
    href: "//admin/dashboard/attendance",
  },
];

export default function AdminSidebar() {
  const dispatch = useDispatch();
  const [isActive, setIsActive] = useState("");
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
              onClick={() => setIsActive(item.title)}
              className={`flex items-center rounded-xl px-3 py-3 mb-4 transition-all duration-200 ${
                isSidebarCollapsed ? "justify-center" : "gap-5"
              } ${
                isActive === item.title
                  ? "bg-primary text-black shadow-lg"
                  : "text-text-secondary hover:bg-text-secondary/10"
              }`}
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
        <div className="flex items-center gap-3 text-text-secondary">
          <Settings />
          <span
            className={`text-lg font-bold ${isSidebarCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"}`}
          >
            Settings
          </span>
        </div>
        {/* logOut */}
        <div className="flex items-center gap-3 text-red-400">
          <LogOut />
          <span
            className={`text-lg font-bold ${isSidebarCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"}`}
          >
            Sign Out
          </span>
        </div>
      </div>
    </div>
  );
}
