import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface SelectedSites {
  SitesTab: string[];
}

const initialState: SelectedSites = {
  SitesTab: [],
};

const selectedSitesSlice = createSlice({
  name: "selectedSites",
  initialState,
  reducers: {
    deleteSelectedSites(state) {
      state.SitesTab = [];
    },
    toggleSitesInTab(state, action: PayloadAction<string>) {
      const site = action.payload;
      const siteIndex = state.SitesTab.indexOf(site);
      if (siteIndex !== -1) {
        state.SitesTab.splice(siteIndex, 1);
      } else {
        state.SitesTab.push(site);
      }
    },
  },
});

export const { deleteSelectedSites, toggleSitesInTab } =
  selectedSitesSlice.actions;

export default selectedSitesSlice.reducer;
