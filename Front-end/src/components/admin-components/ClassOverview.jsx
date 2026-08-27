import { ChevronRight, Loader2 } from "lucide-react";
import { useGetClassroomOverviewQuery } from "../../features/api";

export default function ClassOverview() {
  const {
    data: overview,
    isError,
    isLoading,
  } = useGetClassroomOverviewQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const classrooms = overview?.classes ?? [];

  return (
    <div className="bg-card-2 border border-text-secondary/10 rounded-2xl p-6">
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
          View All {overview?.total_classes ?? 0} Classes →
        </button>
      </div>

      <div className="mt-5 space-y-3">
        {isLoading && (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-primary" />
          </div>
        )}

        {isError && (
          <p className="py-8 text-center text-red-400">
            Could not load classroom overview.
          </p>
        )}

        {!isLoading && !isError && classrooms.length === 0 && (
          <p className="py-8 text-center text-text-secondary/60">
            No classes have been created yet.
          </p>
        )}

        {!isLoading &&
          !isError &&
          classrooms.slice(0, 4).map((classroom) => (
            <div
              key={classroom.id}
              className="bg-background border border-text-secondary/10 rounded-2xl flex items-center py-3 px-4"
            >
              <div className="bg-card-2 border border-text-secondary/10 rounded-2xl p-4">
                <h2 className="text-white text-lg font-bold">
                  {classroom.name}
                </h2>
              </div>

              <div className="ml-3">
                <h2 className="text-white text-lg font-medium">
                  Grade {classroom.name}
                </h2>
                <p className="text-text-secondary/80">
                  Teacher: {classroom.teacher_name ?? "Unassigned"} ·{" "}
                  {classroom.learner_count} learners
                </p>
              </div>

              <span className="bg-primary/10 text-primary rounded-lg py-1 px-3 ml-auto font-semibold">
                {classroom.attendance_percentage}%
              </span>
              <ChevronRight className="ml-3 text-text-secondary/60" />
            </div>
          ))}
      </div>
    </div>
  );
}
