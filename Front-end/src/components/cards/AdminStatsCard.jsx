import { Users } from "lucide-react";
import React from "react";

export default function AdminStatsCard() {
  return (
    <div className="bg-card-2 p-6 rounded-2xl border border-text-secondary/10">
      {/* header */}
      <div className="flex items-start justify-between">
        <span className="text-text-secondary text-lg ">Total Teachers</span>
        {/* icon */}
        <div className="bg-primary/10 p-4 rounded-xl">
          <Users className="text-primary" />
        </div>
      </div>

      {/* stats */}
      <div>
        <p className="text-white font-bold text-5xl mb-4">24</p>
        <p className="text-text-secondary/40">
          <span className="text-text-green mr-3">+2</span> 24 active staff
          members
        </p>
      </div>
    </div>
  );
}
