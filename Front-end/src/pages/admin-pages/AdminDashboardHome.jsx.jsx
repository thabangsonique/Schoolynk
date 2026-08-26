import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useAuth } from "../../context/authContext";
import Button from "../../components/global/Button";
import { Layers, Plus, UserPlus } from "lucide-react";
import AdminStatsCard from "../../components/cards/AdminStatsCard";

export default function AdminDashboardHome() {
  const [selected, setSelected] = useState("Add Teacher");
  const { user, profile, loading, role } = useAuth();
  const isSidebarCollapsed = useSelector(
    (state) => state.global.isSidebarCollapsed,
  );
  return (
    <div className={`${isSidebarCollapsed ? "pl-30 pr-10" : "px-10"} py-10`}>
      {/* header section */}
      <div className="flex justify-between items-center">
        {/* left-side */}
        <div>
          <h1 className="text-white text-4xl font-bold">
            Good morning, <span className="capitalize">{role} 👋</span>{" "}
          </h1>
          <p className="text-lg text-text-secondary mt-4">
            Here's whats happening at your school today.
          </p>
        </div>

        {/* right-side */}
        <div className="flex gap-4">
          <Button
            onClick={() => setSelected("Add Teacher")}
            selected={selected}
            setSelected={setSelected}
            Icon={<Plus />}
            title="Add Teacher"
          />
          <Button
            onClick={() => setSelected("Add Learner")}
            selected={selected}
            setSelected={setSelected}
            Icon={
              <UserPlus
                className={`${isSidebarCollapsed ? "text-primary" : "text-black"}`}
              />
            }
            title="Add Learner"
          />
          <Button
            onClick={() => setSelected("Create Class")}
            selected={selected}
            setSelected={setSelected}
            Icon={
              <Layers
                className={`${isSidebarCollapsed ? "text-primary" : "text-black"}`}
              />
            }
            title="Create Class"
          />
        </div>
      </div>

      {/* CONTENT DASHBOARD */}
      <div className="mt-7 gap-5 grid md:grid-cols-4">
        <AdminStatsCard />
        <AdminStatsCard />
        <AdminStatsCard />
        <AdminStatsCard />
      </div>
    </div>
  );
}
