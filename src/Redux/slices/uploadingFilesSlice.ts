import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TheUploadingFile } from "../../assets/types/Mission";


export interface SliceState {
  attachFiles: TheUploadingFile[];
  reportFiles: TheUploadingFile[];
  acceptenceFiles: TheUploadingFile[];
  voucherFiles: TheUploadingFile[];
}

const initialState: SliceState = {
  attachFiles: [],
  reportFiles: [],
  acceptenceFiles: [],
  voucherFiles: [],
};

interface AddFilePayload {
  type: "attachements" | "report" | "certificate" | "voucher";
  file: TheUploadingFile;
}

interface RemoveFilePayload {
  type: "attachements" | "report" | "certificate" | "voucher";
  fileId: number;
}

interface UpdateProgressPayload {
    type: "attachements" | "report" | "certificate" | "voucher";
    fileId: number;
    progress: number;
  }

  const uploadingFilesSlice = createSlice({
    name: "uploadingFiles",
    initialState,
    reducers: {
      addUploadingFile(state, action: PayloadAction<AddFilePayload>) {
        const { type, file } = action.payload;
        switch (type) {
          case "attachements":
            state.attachFiles.push(file);
            break;
          case "report":
            state.reportFiles.push(file);
            break;
          case "certificate":
            state.acceptenceFiles.push(file);
            break;
            case "voucher":
              state.voucherFiles.push(file);
              break;
        }
      },
      removeUploadingFile(state, action: PayloadAction<RemoveFilePayload>) {
        const { type, fileId } = action.payload;
        switch (type) {
          case "attachements":
            state.attachFiles = state.attachFiles.filter(
              (file) => file.id !== fileId
            );
            break;
          case "report":
            state.reportFiles = state.reportFiles.filter(
              (file) => file.id !== fileId
            );
            break;
          case "certificate":
            state.acceptenceFiles = state.acceptenceFiles.filter(
              (file) => file.id !== fileId
            );
            break;

            case "voucher":
              state.voucherFiles = state.voucherFiles.filter(
                (file) => file.id !== fileId
              );
              break;
        }
      },
      updateFileProgress(state, action: PayloadAction<UpdateProgressPayload>) {
        const { type, fileId, progress } = action.payload;
        
        let filesArray;
        
        switch (type) {
          case "attachements":
            filesArray = state.attachFiles;
            break;
          case "report":
            filesArray = state.reportFiles;
            break;
          case "certificate":
            filesArray = state.acceptenceFiles;
            break;
            case "voucher":
              filesArray = state.voucherFiles;
              break;
        }
        
  
        if (filesArray) {
          const file = filesArray.find(file => file.id === fileId);
          if (file) {
            file.progress = Number(progress.toFixed(2));
          }
        }
      },
    },
  });

export const { addUploadingFile, removeUploadingFile, updateFileProgress } =
  uploadingFilesSlice.actions;

export default uploadingFilesSlice.reducer;
