import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface NotificationCount {
  count: number;
}

const initialState: NotificationCount = {
  count: 0,
};

const notificationCountSlice = createSlice({
  name: "notificationCount",
  initialState,
  reducers: {
    clearCount(state) {
      state.count = 0;
    },
    setCount(state, action: PayloadAction<number>) {
      const fetchedCount = action.payload;
      state.count = fetchedCount;
    },
    addOneToCount(state) {
      state.count = ++state.count;
    },
  },
});

export const { clearCount, setCount, addOneToCount } =
  notificationCountSlice.actions;

export default notificationCountSlice.reducer;
