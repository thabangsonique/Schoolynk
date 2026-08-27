import { configureStore } from "@reduxjs/toolkit";
import globalReducer from "./features/globalSlice";
import { api } from "./features/api";

export const store = configureStore({
  reducer: {
    global: globalReducer,
    [api.reducerPath]: api.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});
