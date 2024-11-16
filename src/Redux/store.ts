import { configureStore } from "@reduxjs/toolkit";
import sideBarReducer from "./slices/sideBarSlice";
import selectedUsersReducer from "./slices/selectedUsersSlice";
import selectedExtantionsReducer from "./slices/selectedExtantionsSlice";
import uploadingFilesReducer from "./slices/uploadingFilesSlice";
import uploadedAttachOnCreationReducer from "./slices/uploadAttachOnCreation";
import selectedIndividualsReducer from "./slices/selectedIndividuals";
import notificationCountReducer from "./slices/notificationCountSlice";
import selectedSitesReducer from "./slices/selectedSites";
import SelectedLosOrdersReducer from "./slices/selectedLosOrders";


export const store = configureStore({
  reducer: {
    sidebar: sideBarReducer,
    selectedUsers: selectedUsersReducer,
    selectedExtantions: selectedExtantionsReducer,
    uploadingFiles: uploadingFilesReducer,
    uploadedAttachOnCreation: uploadedAttachOnCreationReducer,
    selectedIndividuals: selectedIndividualsReducer,
    notificationCount: notificationCountReducer,
    selectedSites: selectedSitesReducer,
    selectedLosOrders: SelectedLosOrdersReducer,

  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
