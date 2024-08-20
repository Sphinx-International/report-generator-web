// store.ts
import { configureStore } from "@reduxjs/toolkit";
import sideBarReducer from "./slices/sideBarSlice";
import selectedUsersReducer from "./slices/selectedUsersSlice";
import selectedWorkorderssReducer from "./slices/selectedWorkordersSlice";
import uploadingFilesReducer from "./slices/uploadingFilesSlice";

export const store = configureStore({
  reducer: {
    sidebar: sideBarReducer,
    selectedUsers: selectedUsersReducer,
    selectedWorkorders: selectedWorkorderssReducer,
    uploadingFiles: uploadingFilesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
