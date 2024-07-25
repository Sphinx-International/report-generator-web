// store.ts
import { configureStore } from '@reduxjs/toolkit';
import dialogReducer from './slices/dialogSlice';
import sideBarReducer from './slices/sideBarSlice';
import selectedUsersReducer from './slices/selectedUsersSlice';
import selectedWorkorderssReducer from './slices/selectedWorkordersSlice';


export const store = configureStore({
  reducer: {
    dialog: dialogReducer,
    sidebar:sideBarReducer,
    selectedUsers:selectedUsersReducer,
    selectedWorkorders:selectedWorkorderssReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
