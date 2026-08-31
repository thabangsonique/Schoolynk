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
    "SchoolSettings",
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
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const createdTeacher = data?.newTeacher;

          if (createdTeacher) {
            dispatch(
              api.util.updateQueryData("getTeachers", undefined, (teachers) => {
                if (
                  !teachers.some((teacher) => teacher.id === createdTeacher.id)
                ) {
                  teachers.unshift(createdTeacher);
                }
              }),
            );
          }
        } catch {
          // The mutation component displays the request error.
        }
      },
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

    // Get today's attendance for teacher's class
    getTodayAttendance: build.query({
      query: () => "/api/learner-attendance",
      providesTags: ["LearnerAttendance"],
    }),

    // Mark a learner present or absent (upserts today's record)
    markLearnerAttendance: build.mutation({
      query: ({ learner_id, status }) => ({
        url: "/api/learner-attendance",
        method: "POST",
        body: { learner_id, status },
      }),
      invalidatesTags: ["LearnerAttendance"],
    }),

    // Mark the whole class present or absent
    bulkMarkLearnerAttendance: build.mutation({
      query: ({ status }) => ({
        url: "/api/learner-bulk-attendance",
        method: "POST",
        body: { status },
      }),
      invalidatesTags: ["LearnerAttendance"],
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
    createLearner: build.mutation({
      query: (learnerData) => ({
        url: "/api/learners",
        method: "POST",
        body: learnerData,
      }),
      invalidatesTags: ["Learners", "Classes", "Dashboard"],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const createdLearner = data?.newLearner;

          if (createdLearner) {
            dispatch(
              api.util.updateQueryData("getLearners", undefined, (response) => {
                if (
                  response?.learners &&
                  !response.learners.some(
                    (learner) => learner.id === createdLearner.id,
                  )
                ) {
                  response.learners.unshift(createdLearner);
                }
              }),
            );
          }
        } catch {
          // The mutation component displays the request error.
        }
      },
    }),
    // =========================
    // CLASSES
    // =========================
    //fetch all classes.
    getAllClasses: build.query({
      query: () => "/api/classes",
      providesTags: ["Classes"],
    }),
    createClass: build.mutation({
      query: (classData) => ({
        url: "/api/classes",
        method: "POST",
        body: classData,
      }),
      invalidatesTags: ["Classes", "Dashboard"],
    }),
    getClassroomOverview: build.query({
      query: () => "/api/classes-overview",
      providesTags: ["Classes", "LearnerAttendance", "Dashboard"],
    }),
    // Add class endpoints here

    // =========================
    // SUBJECTS
    // =========================

    getAllSubjects: build.query({
      query: () => "/api/subjects",
      providesTags: ["Subjects"],
    }),
    createSubject: build.mutation({
      query: (subjectData) => ({
        url: "/api/subjects",
        method: "POST",
        body: subjectData,
      }),
      invalidatesTags: ["Subjects", "Classes", "Dashboard"],
    }),
    updateSubject: build.mutation({
      query: ({ id, subjectData }) => ({
        url: `/api/subjects/${id}`,
        method: "PATCH",
        body: subjectData,
      }),
      invalidatesTags: ["Subjects", "Classes", "Dashboard"],
    }),
    deleteSubject: build.mutation({
      query: (id) => ({
        url: `/api/subjects/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Subjects", "Classes", "Dashboard"],
    }),

    // =========================
    // ATTENDANCE
    // =========================

    //get attandence school learners.
    getLearnerAttendanceOverview: build.query({
      query: (date) => ({
        url: "/api/learners-overview",
        params: date ? { id: date } : undefined,
      }),
      providesTags: ["LearnerAttendance", "Dashboard"],
    }),

    getStaffOverview: build.query({
      query: (date) => ({
        url: "/api/staff-overview",
        params: date ? { id: date } : undefined,
      }),
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

    // =========================
    // SCHOOL SETTINGS
    // =========================

    getSchoolSettings: build.query({
      query: () => "/api/school-settings",
      transformResponse: (response) => response.school_settings ?? null,
      providesTags: ["SchoolSettings"],
    }),

    updateNotificationsEnabled: build.mutation({
      query: ({ enabled }) => ({
        url: "/api/school-settings/notifications",
        method: "PATCH",
        body: { enabled },
      }),
      invalidatesTags: ["SchoolSettings"],
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
  useGetTodayAttendanceQuery,
  useMarkLearnerAttendanceMutation,
  useBulkMarkLearnerAttendanceMutation,

  useClockInMutation,
  useClockOutMutation,
  useViewMyAttendanceQuery,
  useInsertAvaterMutation,
  useGetLearnersQuery,
  useCreateLearnerMutation,
  useGetAllClassesQuery,
  useCreateClassMutation,
  useGetClassroomOverviewQuery,
  useGetAllSubjectsQuery,
  useCreateSubjectMutation,
  useUpdateSubjectMutation,
  useDeleteSubjectMutation,
  useGetLearnerAttendanceOverviewQuery,
  useGetStaffOverviewQuery,
  useGetWeeklyLearnerAttendanceQuery,
  useGetRecentActivitiesQuery,

  useGetSchoolSettingsQuery,
  useUpdateNotificationsEnabledMutation,
} = api;
