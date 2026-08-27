import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { useGetWeeklyLearnerAttendanceQuery } from "../../features/api";

export default function AttendanceChart() {
  const { data: weeklyData, isLoading } = useGetWeeklyLearnerAttendanceQuery(
    undefined,
    {
      refetchOnMountOrArgChange: true,
    },
  );

  //days only from weekly data
  const data = weeklyData?.days ?? [];
  const weeklyAverage = weeklyData?.weekly_average ?? 0;
  return (
    <div className="bg-card-2 rounded-2xl border border-text-secondary/10 p-6">
      {/* chart header */}
      <div className="flex items-center justify-between">
        {/* left */}
        <div className="mb-10">
          <h1 className="text-2xl font-medium text-white">
            Attendance Overview
          </h1>
          <p className="text-text-secondary">
            Weekly learner attendance trends across grade levels
          </p>
        </div>
        {/* right */}
        <div className="flex items-center gap-3">
          {/* dot */}
          <div className="bg-primary rounded-full h-4 w-4" />
          {/* text */}
          <p className="text-primary text-lg">
            {" "}
            {isLoading ? "Loading..." : `This Week Avg: ${weeklyAverage}%`}
          </p>
        </div>
      </div>

      {/* ACTUAL CHART */}
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 10,
              right: 10,
              left: 0,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient
                id="attendanceGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#f5c542" stopOpacity={0.4} />

                <stop offset="100%" stopColor="#f5c542" stopOpacity={0} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#8790a5", fontSize: 12 }}
            />

            <YAxis
              domain={[80, 100]}
              ticks={[80, 85, 90, 95, 100]}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `${value}%`}
              tick={{ fill: "#8790a5", fontSize: 12 }}
            />

            <CartesianGrid
              horizontal={true}
              vertical={false}
              stroke="transparent"
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "#282b34",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
              }}
              labelStyle={{
                color: "#fff",
              }}
              formatter={(value) => [`${value}%`, "Attendance"]}
            />

            <Area
              type="monotone"
              dataKey="attendance"
              stroke="#f5c542"
              strokeWidth={2.5}
              fill="url(#attendanceGradient)"
              dot={false}
              activeDot={{
                r: 5,
                fill: "#f5c542",
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
