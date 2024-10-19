import { createSlice, PayloadAction  } from '@reduxjs/toolkit';

export interface DialogState {
  UsersTab: number[];
}

const initialState: DialogState = {
  UsersTab: [],
};

const selectedUsersSlice = createSlice({
  name: 'selectedUsers',
  initialState,
  reducers: {
    deleteSelectedUsers(state) {
      state.UsersTab = [];
    },
    toggleUserInTab(state, action: PayloadAction<number>) {
      const user = action.payload;
      const userIndex = state.UsersTab.indexOf(user);
      if (userIndex !== -1) {
        state.UsersTab.splice(userIndex, 1);
      } else {
        state.UsersTab.push(user);
      }
    },
  },
});

export const { deleteSelectedUsers,toggleUserInTab } = selectedUsersSlice.actions;

export default selectedUsersSlice.reducer;
