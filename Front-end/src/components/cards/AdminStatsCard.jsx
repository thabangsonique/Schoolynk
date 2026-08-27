import { Users } from "lucide-react";
import React from "react";

export default function AdminStatsCard({ value, title, description, Icon }) {
  return (
    <div className="bg-card-2 p-6 rounded-2xl border border-text-secondary/10 hover:cursor-pointer hover:border-primary/40 transition-all duration-300">
      {/* header */}
      <div className="flex items-start justify-between">
        <span className="text-text-secondary text-lg ">{title}</span>
        {/* icon */}
        <div className="bg-primary/10 p-4 rounded-xl">{Icon}</div>
      </div>

      {/* stats */}
      <div>
        <p className="text-white font-bold text-5xl mb-4">{value}</p>
        <p className="text-text-secondary/40">{description}</p>
      </div>
    </div>
  );
}
