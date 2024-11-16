import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface SelectedLosOrders {
  OrdersTab: number[];
}

const initialState: SelectedLosOrders = {
  OrdersTab: [],
};

const selectedLosOrdersSlice = createSlice({
  name: "selectedLosOrders",
  initialState,
  reducers: {
    deleteSelectedLosOrders(state) {
      state.OrdersTab = [];
    },
    toggleLosOrdersInTab(state, action: PayloadAction<number>) {
      const losOrder = action.payload;
      const orderIndex = state.OrdersTab.indexOf(losOrder);
      if (orderIndex !== -1) {
        state.OrdersTab.splice(orderIndex, 1);
      } else {
        state.OrdersTab.push(losOrder);
      }
    },
  },
});

export const { deleteSelectedLosOrders, toggleLosOrdersInTab } =
  selectedLosOrdersSlice.actions;

export default selectedLosOrdersSlice.reducer;
