import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isSidebarCollapsed: false,
  isCreateSubjectOpen: false,
  isCreateLearnerOpen: false,
  isCreateTeacherOpen: false,
  isCreateClassOpen: false,
  viewLearnerOpen: false,
  viewTeacherOpen: false,
};

export const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    setSidebarCollapsed: (state, action) => {
      state.isSidebarCollapsed = action.payload;
    },

    setCreateSubject: (state, action) => {
      state.isCreateSubjectOpen = action.payload;
    },
    setCreateTeacher: (state, action) => {
      state.isCreateTeacherOpen = action.payload;
    },
    setCreateLearner: (state, action) => {
      state.isCreateLearnerOpen = action.payload;
    },
    setCreateClass: (state, action) => {
      state.isCreateClassOpen = action.payload;
    },
    setViewLearner: (state, action) => {
      state.viewLearnerOpen = action.payload;
    },
    setViewTeacher: (state, action) => {
      state.viewTeacherOpen = action.payload;
    },
  },
});

export const {
  setCreateLearner,
  setCreateSubject,
  setCreateTeacher,
  setCreateClass,
  setSidebarCollapsed,
  setViewTeacher,
} = globalSlice.actions;
export default globalSlice.reducer;
