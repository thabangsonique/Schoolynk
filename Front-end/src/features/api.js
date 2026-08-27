import { supabase } from "../config/supabase";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  reducerPath: "api",

  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,

    prepareHeaders: async (headers) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.access_token) {
        headers.set("Authorization", `Bearer ${session.access_token}`);
      }

      return headers;
    },
  }),

  tagTypes: [
    "Teachers",
    "Learners",
    "Classes",
    "Subjects",
    "LearnerAttendance",
    "StaffAttendance",
    "Dashboard",
    "RecentActivities",
  ],

  endpoints: (build) => ({
    // =========================
    // TEACHERS
    // =========================

    // ADMIN FUNCTIONALITIES

    // Get all teachers
    getTeachers: build.query({
      query: () => "/api/teachers",
      providesTags: ["Teachers"],
    }),

    // Get teacher by ID
    getTeacherById: build.query({
      query: (id) => `/api/teachers/${id}`,
      providesTags: ["Teachers"],
    }),

    // Create teacher
    createTeacher: build.mutation({
      query: (teacherData) => ({
        url: "/api/teachers",
        method: "POST",
        body: teacherData,
      }),
      invalidatesTags: ["Teachers"],
    }),

    // Update teacher by ID
    updateTeacherById: build.mutation({
      query: ({ teacherUpdate, id }) => ({
        url: `/api/teachers/${id}`,
        method: "PATCH",
        body: teacherUpdate,
      }),
      invalidatesTags: ["Teachers"],
    }),

    // Delete teacher
    deleteTeacher: build.mutation({
      query: (id) => ({
        url: `/api/teachers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Teachers"],
    }),

    // =========================
    // TEACHER FUNCTIONS
    // =========================

    // Get teacher's learners
    getMyLearners: build.query({
      query: () => "/api/get-my-learners",
      providesTags: ["Teachers"],
    }),

    // Get teacher's class
    getMyClasses: build.query({
      query: () => "/api/my-classes",
      providesTags: ["Teachers"],
    }),

    // Clock in
    clockIn: build.mutation({
      query: (teacherClockIn) => ({
        url: "/api/clock-in",
        method: "POST",
        body: teacherClockIn,
      }),
      invalidatesTags: ["Teachers", "StaffAttendance", "Dashboard"],
    }),

    // Clock out
    clockOut: build.mutation({
      query: (teacherClockOut) => ({
        url: "/api/clock-out",
        method: "POST",
        body: teacherClockOut,
      }),
      invalidatesTags: ["Teachers", "StaffAttendance", "Dashboard"],
    }),

    // View my attendance
    viewMyAttendance: build.query({
      query: () => "/api/my-attendance",
      providesTags: ["Teachers"],
    }),

    // Teacher profile image
    insertAvater: build.mutation({
      query: (avatar) => ({
        url: "/api/avatar",
        method: "POST",
        body: avatar,
      }),
      invalidatesTags: ["Teachers"],
    }),

    // =========================
    // LEARNERS
    // =========================

    //ADMIN FUNCTIONALITIES
    // get all learners
    getLearners: build.query({
      query: () => "/api/learners",
      providesTags: ["Learners"],
    }),
    // =========================
    // CLASSES
    // =========================
    //fetch all classes.
    getAllClasses: build.query({
      query: () => "/api/classes",
      providesTags: ["Classes"],
    }),
    getClassroomOverview: build.query({
      query: () => "/api/classes-overview",
      providesTags: ["Classes", "LearnerAttendance", "Dashboard"],
    }),
    // Add class endpoints here

    // =========================
    // SUBJECTS
    // =========================

    // Add subject endpoints here

    // =========================
    // ATTENDANCE
    // =========================

    //get attandence school learners.
    getLearnerAttendanceOverview: build.query({
      query: () => "/api/learners-overview",
      providesTags: ["LearnerAttendance", "Dashboard"],
    }),

    getStaffOverview: build.query({
      query: () => "/api/staff-overview",
      providesTags: ["StaffAttendance", "Dashboard"],
    }),

    //weekly

    getWeeklyLearnerAttendance: build.query({
      query: () => "/api/weekly-learner-attendance",
      providesTags: ["LearnerAttendance", "Dashboard"],
    }),
    // =========================
    // DASHBOARD
    // =========================

    // Add dashboard endpoints here

    //ACTIVITIES.
    getRecentActivities: build.query({
      query: () => "/api/recent",
      transformResponse: (response) => response.activities ?? [],
      providesTags: ["RecentActivities", "Dashboard"],
    }),
  }),
});

export const {
  useGetTeachersQuery,
  useGetTeacherByIdQuery,
  useCreateTeacherMutation,
  useUpdateTeacherByIdMutation,
  useDeleteTeacherMutation,

  useGetMyLearnersQuery,
  useGetMyClassesQuery,

  useClockInMutation,
  useClockOutMutation,
  useViewMyAttendanceQuery,
  useInsertAvaterMutation,
  useGetLearnersQuery,
  useGetAllClassesQuery,
  useGetClassroomOverviewQuery,
  useGetLearnerAttendanceOverviewQuery,
  useGetStaffOverviewQuery,
  useGetWeeklyLearnerAttendanceQuery,
  useGetRecentActivitiesQuery,
} = api;
