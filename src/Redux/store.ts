import { configureStore } from "@reduxjs/toolkit";
import sideBarReducer from "./slices/sideBarSlice";
import selectedUsersReducer from "./slices/selectedUsersSlice";
import selectedWorkorderssReducer from "./slices/selectedWorkordersSlice";
import uploadingFilesReducer from "./slices/uploadingFilesSlice";
import uploadedAttachOnCreationReducer from "./slices/uploadAttachOnCreation";
import selectedIndividualsReducer from "./slices/selectedIndividuals";
import notificationCountReducer from "./slices/notificationCountSlice";


export const store = configureStore({
  reducer: {
    sidebar: sideBarReducer,
    selectedUsers: selectedUsersReducer,
    selectedWorkorders: selectedWorkorderssReducer,
    uploadingFiles: uploadingFilesReducer,
    uploadedAttachOnCreation: uploadedAttachOnCreationReducer,
    selectedIndividuals: selectedIndividualsReducer,
    notificationCount: notificationCountReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
