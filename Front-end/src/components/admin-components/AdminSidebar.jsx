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
  const sidebarClasses = `bg-card-2 fixed hide-scrollbar flex flex-col overflow-y-auto h-[100%] py-5  ${isSidebarCollapsed ? "w-20" : "w-[300px]"}`;
  return (
    <div className={sidebarClasses}>
      {/* //header section. */}
      <div className="w-full flex items-center gap-3 px-8 pb-5 border-b border-text-secondary/10">
        {/* icon */}
        <div className="flex items-center justify-center bg-primary h-15 w-15 rounded-xl">
          <School size={40} />
        </div>
        {/* text */}
        <div>
          <h1 className="text-white text-2xl font-bold">SchooLynk</h1>
          <p className="text-text-secondary/50 uppercase tracking-wide font-regular">
            Primary Schools
          </p>
        </div>

        {/* sidebar toggle */}
        {isSidebarCollapsed ? (
          <button className="rounded-lg hover:cursor-pointer py-2 transition-all duration-300 hover:bg-text-secondary/10">
            <ChevronRight />
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
        <p className=" uppercase text-text-secondary/50 font-bold mb-3 pl-4">
          School management
        </p>
        {menuItems.map((item, idx) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={idx}
              onClick={() => setIsActive(item.title)}
              className={`flex rounded-xl px-3 py-3 gap-5 mb-4 hover:bg-text-secondary/10 transition-all duration-300 ${isActive === item.title ? "bg-primary text-black shadow-lg" : "text-text-secondary"} `}
            >
              <Icon />
              <span className="text-lg font-bold">{item.title}</span>
            </NavLink>
          );
        })}
      </div>

      {/* SIDEBAR FOOTER */}
      <div className="mt-auto px-8 pb-4 pt-6 space-y-4 border-t border-text-secondary/10">
        {/* settings */}
        <div className="flex items-center gap-3 text-text-secondary">
          <Settings />
          <span className="text-lg font-bold">Settings</span>
        </div>
        {/* logOut */}
        <div className="flex items-center gap-3 text-red-400">
          <LogOut />
          <span className="text-lg font-bold">Sign Out</span>
        </div>
      </div>
    </div>
  );
}
