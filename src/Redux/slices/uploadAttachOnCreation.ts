import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UploadedAttach {
  id: number;
  file_name: string;
  workorder: string;
  downloadProgress?: string;
}

const initialState: UploadedAttach[] = [];

const uploadAttachOnCreationSlice = createSlice({
  name: "uploadAttachOnCreation",
  initialState,
  reducers: {
    addUploadedAttachOnCreation(state, action: PayloadAction<UploadedAttach>) {
      const file = action.payload;
      state.push(file);
    },
    removeAttachOnCreationArray(state, action: PayloadAction<number>) {
      const fileId = action.payload;
      return state.filter((file) => file.id !== fileId);
    },
    setDownloadProgress(state, action: PayloadAction<{ id: number; progress: string }>) {
      const { id, progress } = action.payload;
      const attach = state.find((file) => file.id === id);
      if (attach) {
        attach.downloadProgress = progress; 
      }
    }
  },
});

export const { addUploadedAttachOnCreation, removeAttachOnCreationArray, setDownloadProgress } =
  uploadAttachOnCreationSlice.actions;

export default uploadAttachOnCreationSlice.reducer;
