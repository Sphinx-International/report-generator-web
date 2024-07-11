// store.ts
import { configureStore } from '@reduxjs/toolkit';
import dialogReducer from './slices/dialogSlice';
import sideBarReducer from './slices/sideBarSlice';

export const store = configureStore({
  reducer: {
    dialog: dialogReducer,
    sidebar:sideBarReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
