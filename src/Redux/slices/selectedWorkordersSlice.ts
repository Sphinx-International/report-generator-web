import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface SelectedWorkOrdersTab {
  workOrdersTab: string[];
}

const initialState: SelectedWorkOrdersTab = {
  workOrdersTab: [],
};

const selectedWorkordersSlice = createSlice({
  name: "selectedWorkorders",
  initialState,
  reducers: {
    deleteSelectedWorkorders(state) {
      state.workOrdersTab = [];
    },
    toggleWorkorderInTab(state, action: PayloadAction<string>) {
      const workorder = action.payload;
      const workorderIndex = state.workOrdersTab.indexOf(workorder);
      if (workorderIndex !== -1) {
        state.workOrdersTab.splice(workorderIndex, 1);
      } else {
        state.workOrdersTab.push(workorder);
      }
    },
  },
});

export const { deleteSelectedWorkorders, toggleWorkorderInTab } =
selectedWorkordersSlice.actions;

export default selectedWorkordersSlice.reducer;
