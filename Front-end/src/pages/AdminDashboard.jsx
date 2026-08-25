import AdminSidebar from "../components/admin-components/AdminSidebar";
import React from "react";
import { useSelector } from "react-redux";
import Navbar from "../components/navbar/Navbar";
import { Outlet } from "react-router-dom";

export default function AdminDashboard() {
  const isSidebarCollapsed = useSelector(
    (state) => state.global.isSidebarCollapsed,
  );

  return (
    <div className="flex text-black min-h-screen w-full bg-background">
      <AdminSidebar />

      <main className={`w-full ${isSidebarCollapsed ? "" : "md:ml-[300px]"}`}>
        <Navbar />
        <Outlet />

        {/* all modal pages here */}
      </main>
    </div>
  );
}
