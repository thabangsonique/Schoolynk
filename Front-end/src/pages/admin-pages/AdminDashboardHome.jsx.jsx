import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useAuth } from "../../context/authContext";
import Button from "../../components/global/Button";
import { ChevronRight, Layers, Plus, UserPlus } from "lucide-react";
import AdminStatsCard from "../../components/cards/AdminStatsCard";
import AttendanceChart from "../../components/charts/AttendanceChart";
import RecentActivity from "../../components/admin-components/RecentActivity";
import ClassOverview from "../../components/admin-components/ClassOverview";

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
            Icon={
              <Plus
                className={`${selected === "Add Teacher" ? "text-black" : "text-primary"}`}
              />
            }
            title="Add Teacher"
          />
          <Button
            onClick={() => setSelected("Add Learner")}
            selected={selected}
            setSelected={setSelected}
            Icon={
              <UserPlus
                className={`${selected === "Add Learner" ? "text-black" : "text-primary"}`}
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
                className={`${selected === "Create Class" ? "text-black" : "text-primary"}`}
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

      {/* CHART STATS */}
      <div className="mt-7 grid grid-cols-[2fr_1fr] gap-8">
        <AttendanceChart />
        {/* Today's staff attendance */}
        <div className="flex flex-col">
          {/* first card */}
          <div className="bg-card-2 rounded-2xl px-6 py-7  border border-text-secondary/10">
            {/* header */}
            <div className="flex justify-between">
              {" "}
              <h1 className="text-white text-xl font-semibold tracking-wide">
                Today's Staff Attendance
              </h1>
              <button className="flex text-lg text-primary hover:scale-110 hover:cursor-pointer transition-all duration-300">
                View <ChevronRight />
              </button>
            </div>

            {/* stats */}
            <div className="grid grid-cols-3 mt-4 gap-4">
              <div className="bg-text-green/5 border border-text-green/10 rounded-2xl p-5">
                <p className="text-text-green">Present</p>
                <h2 className="text-2xl font-bold text-text-green mt-5">21</h2>
              </div>
              {/* second-card */}
              <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5">
                <p className="text-primary">Not Clocked</p>
                <h2 className="text-primary text-2xl font-bold mt-auto">21</h2>
              </div>
              <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-5">
                <p className="text-red-500">Absent</p>
                <h2 className="text-red-500 text-2xl font-bold mt-5">1</h2>
              </div>
            </div>
          </div>

          {/* second card */}
          <div className="bg-card-2 border border-text-secondary/10 rounded-2xl p-5 mt-5">
            {/* header */}
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-white ">
                Today's Learner Attendance
              </h1>
              <span className="text-primary text-lg font-bold">94.6%</span>
            </div>

            {/* progress bar */}
            <div className="h-4 w-full rounded-full mt-4 overflow-hidden bg-red-500/60">
              {/* filler bar */}
              <div className="h-full  bg-text-green" style={{ width: 100 }} />
            </div>

            {/* target values */}
            <div className="flex justify-between mt-2 text-text-secondary/50 ">
              <p>0%</p>
              <p>Target: 95%</p>
              <p>100%</p>
            </div>

            {/*small line */}
            <div className="w-full h-0.25 bg-text-secondary/10 mt-4" />
            {/* present/ absent */}
            <div className="flex gap-20">
              <div className="mt-4 flex items-center gap-3">
                <div className=" bg-text-green h-3 w-3 rounded-full" />
                <p className="text-text-secondary">
                  Present:
                  <span className="ml-2 text-white font-bold text-lg">456</span>
                </p>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <div className=" bg-red-500 h-3 w-3 rounded-full" />
                <p className="text-text-secondary">
                  Absent:
                  <span className="ml-2 text-white font-bold text-lg">456</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RECENT ACTIVITY */}
      <div className="grid grid-cols-2 mt-8 gap-8">
        {" "}
        <RecentActivity />
        <ClassOverview />
      </div>
    </div>
  );
}
