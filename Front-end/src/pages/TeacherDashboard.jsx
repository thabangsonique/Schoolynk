import AdminSidebar from "../components/admin-components/AdminSidebar";
import React from "react";
import { useSelector } from "react-redux";
import Navbar from "../components/navbar/Navbar";
import { Outlet } from "react-router-dom";
import TeacherSidebar from "../components/teacher-components/TeacherSidebar";

export default function TeacherDashboard() {
  const isSidebarCollapsed = useSelector(
    (state) => state.global.isSidebarCollapsed,
  );

  return (
    <div className="flex text-black min-h-screen w-full bg-background">
      <TeacherSidebar />

      <main className={`w-full ${isSidebarCollapsed ? "" : "md:ml-[300px]"}`}>
        <Navbar />
        <Outlet />

        {/* all modal pages here */}
      </main>
    </div>
  );
}
