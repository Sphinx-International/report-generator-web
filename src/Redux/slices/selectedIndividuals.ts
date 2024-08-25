import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface IndividualsType {
  IndividualsTab: number[];
}

const initialState: IndividualsType = {
  IndividualsTab: [],
};

const selectedIndividualsSlice = createSlice({
  name: "selectedIndividuals",
  initialState,
  reducers: {
    deleteSelectedIndividuals(state) {
      state.IndividualsTab = [];
    },
    toggleIndividualsTab(state, action: PayloadAction<number>) {
      const individual = action.payload;
      const individualIndex = state.IndividualsTab.indexOf(individual);
      if (individualIndex !== -1) {
        state.IndividualsTab.splice(individualIndex, 1);
      } else {
        state.IndividualsTab.push(individual);
      }
    },
  },
});

export const { deleteSelectedIndividuals, toggleIndividualsTab } =
  selectedIndividualsSlice.actions;

export default selectedIndividualsSlice.reducer;
