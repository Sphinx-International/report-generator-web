import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface SelectedExtantionsTab {
  workOrdersTab: string[];
  modernisationsTab: string[];
  newSitesTab: string[];
}

const initialState: SelectedExtantionsTab = {
  workOrdersTab: [],
  modernisationsTab: [],
  newSitesTab: [],
};

interface ToggleExtantionsPayload {
  tab: keyof SelectedExtantionsTab;
  id: string;
}

const selectedExtantionsSlice = createSlice({
  name: "selectedExtantions",
  initialState,
  reducers: {
    deleteSelectedExtantions(state) {
      state.workOrdersTab = [];
      state.modernisationsTab = [];
    //  state.newSitesTab = [];
    },
    toggleExtantionInTab(state, action: PayloadAction<ToggleExtantionsPayload>) {
      const { tab, id } = action.payload;
      const workorderIndex = state[tab].indexOf(id);
      if (workorderIndex !== -1) {
        state[tab].splice(workorderIndex, 1);
      } else {
        state[tab].push(id);
      }
    },
  },
});

export const { deleteSelectedExtantions, toggleExtantionInTab } = selectedExtantionsSlice.actions;

export default selectedExtantionsSlice.reducer;
