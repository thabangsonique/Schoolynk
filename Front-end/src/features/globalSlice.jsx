import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isSidebarCollapsed: false,
  isCreateSubjectOpen: false,
  isCreateLearnerOpen: false,
  isCreateTeacherOpen: false,
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
  },
});

export const {
  setCreateLearner,
  setCreateSubject,
  setCreateTeacher,
  setSidebarCollapsed,
} = globalSlice.actions;
export default globalSlice.reducer;
