import { ArrowRight, Clock } from "lucide-react";
import React from "react";

//mock data
const OverviewItems = [
  {
    class: "4A",
    title: "Grade 4A",
    description: "Teacher: Sara johnson - 30 learners",
  },
  {
    class: "4B",
    title: "Grade 4B",
    description: "Logged by Sarah Johnson",
  },
  {
    class: "5A",
    title: "Grade 5A",
    description: "Logged by Sarah Johnson",
  },
  {
    class: "4C",
    title: "Grade 4C",
    description: "Logged by Sarah Johnson",
  },
];

export default function ClassOverview() {
  return (
    <div className="bg-card-2 border border-text-secondary/10 rounded-2xl p-6">
      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-white font-bold tracking-wide">
            Grade Classrooms Overview
          </h1>
          <p className="text-lg text-text-secondary">
            Today's attendance across active grade sections
          </p>
        </div>

        <button className="text-primary tracking-wide hover:scale-103 transition-all duration-300 hover:cursor-pointer">
          View All 18 Classes
        </button>
      </div>

      {/* activity logs- map function*/}
      <div className="mt-5 space-y-5">
        {OverviewItems.map((item, idx) => {
          return (
            <div
              key={idx}
              className="bg-background border border-text-secondary/10 rounded-2xl flex items-center py-3 px-4"
            >
              <div className="bg-card-2 border border-text-secondary/10 rounded-2xl p-4">
                <h1 className="text-white text-lg font-bold">{item.class}</h1>
              </div>

              {/* text */}
              <div className="ml-3">
                <h1 className="text-white text-lg">{item.title}</h1>
                <p className="text-text-secondary/80">{item.description}</p>
              </div>

              {/* time recieved */}
              <p className="text-text-secondary/40 ml-auto">5:03 PM</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
