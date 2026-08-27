import { Clock } from "lucide-react";
import React from "react";
import { useGetRecentActivitiesQuery } from "../../features/api";
//mock data

export default function RecentActivity() {
  const {
    data: recentActivities = [],
    isError,
    isLoading,
  } = useGetRecentActivitiesQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  return (
    <div className="bg-card-2 border border-text-secondary/10 rounded-2xl p-6">
      {/* header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl text-white font-bold tracking-wide">
          Recent Activity
        </h1>
        <p className="text-text-secondary/60 tracking-wide">Live Updates</p>
      </div>

      {/* activity logs- map function*/}
      <div className="mt-5 space-y-5">
        {recentActivities?.map((activity, idx) => {
          return (
            <div
              key={idx}
              className="bg-background border border-text-secondary/10 rounded-2xl flex items-start py-3 px-4"
            >
              <div className="bg-primary/10 rounded-full p-4">
                <Clock className="text-primary" />
              </div>

              {/* text */}
              <div className="ml-3">
                <h1 className="text-white text-lg">{activity.title}</h1>
                <p className="text-text-secondary/40">{activity.description}</p>
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
