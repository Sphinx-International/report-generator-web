const baseUrl = import.meta.env.VITE_BASE_URL;
import { AppDispatch } from "../Redux/store";
import {
  addUploadingFile,
  removeUploadingFile,
  updateFileProgress,
} from "../Redux/slices/uploadingFilesSlice";
import {
  storeFileInIndexedDB,
  deleteFileFromIndexedDB,
} from "./generateFileToken";
import React, { Dispatch, SetStateAction } from "react";
import { TheUploadingFile } from "../assets/types/Mission";

export const upload_or_delete_workorder_files_for_attachements = async (
  workorder_id: string,
  file_id: number,
  method: "add" | "delete",
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  fetchOneWorkOrder?: () => void
) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) {
    console.error("No token found");
    return;
  }

  const formData = new FormData();
  formData.append("workorder_id", workorder_id.toString());
  formData.append(`${method}`, file_id.toString());

  /*  for (const [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }  */
  setIsLoading(true);
  try {
    const response = await fetch(
      `${baseUrl}/workorder/update-workorder-attachments`,
      {
        method: "PUT",
        headers: {
          Authorization: `Token ${token}`,
        },
        body: formData,
      }
    );

    if (response) {
      switch (response.status) {
        case 200:
          if (fetchOneWorkOrder) {
            fetchOneWorkOrder();
          }
          break;
        case 400:
          console.log("verify your data");
          break;
        default:
          console.log("error");
          break;
      }
    }
  } catch (err) {
    console.error("Error submitting form", err);
  } finally {
    setIsLoading(false);
    console.log("finaly");
  }
};

export const upload_workorder_files = async (
  workorder: string,
  file: number,
  fileType: "report" | "certificate" | "voucher",
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  fetchOneWorkOrder: () => void,
  fileStatus?: 0 | 1 | 2 | 3
) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) {
    console.error("No token found");
    return;
  }
  setIsLoading(true);

  try {
    const body =
      fileType === "certificate" || fileType === "report"
        ? JSON.stringify({
            workorder,
            file,
            type: fileStatus,
          })
        : JSON.stringify({ workorder, file });

    console.log(body);
    const response = await fetch(
      fileType === "voucher"
        ? `${baseUrl}/workorder/upload-workorder-return-${fileType}`
        : `${baseUrl}/workorder/upload-workorder-${fileType}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body,
      }
    );

    if (response) {
      switch (response.status) {
        case 200:
          fetchOneWorkOrder();
          break;
        case 400:
          console.log("Verify your data");
          break;
        default:
          console.log("Error");
          break;
      }
    }
  } catch (err) {
    console.error("Error submitting form", err);
  } finally {
    setIsLoading(false);
  }
};

const uploadRemainingChunks = async (
  dispatch: AppDispatch,
  file: File,
  fileType: "attachements" | "report" | "certificate" | "voucher",
  fileId: number,
  totalChunks: number,
  uploadedChunks?: number[]
) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) {
    console.error("No token found");
    return;
  }

  const chunkSize = 512 * 1024; // 512 KB

  for (
    let index = uploadedChunks ? uploadedChunks.length + 1 : 1;
    index <= totalChunks;
    index++
  ) {
    const start = index * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const chunk = file.slice(start, end);

    const formData = new FormData();
    formData.append("index", index.toString());
    formData.append("file", chunk, `${file.name}.part`);

    try {
      const response = await fetch(
        `${baseUrl}/file/upload-rest-chunks/${fileId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Token ${token}`,
          },
          body: formData,
        }
      );
      console.log(await response.json());
      if (response.status === 200) {
        const progress = ((index + 1) / totalChunks) * 100;
        dispatch(updateFileProgress({ type: fileType, fileId, progress }));
      } else if (response.status === 201) {
        dispatch(
          updateFileProgress({ type: fileType, fileId, progress: 100.0 })
        );
        await deleteFileFromIndexedDB(fileId); // Call the delete function here
        break;
      } else {
        console.error("Failed to upload chunk");
        break;
      }
    } catch (err) {
      console.error(`Error uploading chunk ${index + 1}:`, err);
      break;
    }
  }
};

export const handle_chunck = async (
  dispatch: AppDispatch, // Add dispatch as a parameter
  workorder_id: string,
  fileType: "attachements" | "report" | "certificate" | "voucher",
  file: File,
  file_token: string,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  fetchOneWorkOrder: () => void,
  fileStatus?: 0 | 1 | 2 | 3
) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) {
    console.error("No token found");
    return;
  }
  const chunkSize = 32 * 1024; // 512 KB
  const fileSize = file.size; // File size in bytes

  const chunks = Math.ceil(fileSize / (512 * 1024));
  // Extract the first chunk
  const firstChunk = file.slice(0, chunkSize);
  const formData = new FormData();
  formData.append("name", file.name);
  formData.append("type", "1");
  formData.append("total_chunks", chunks.toString());
  formData.append("file", firstChunk, `${file.name}.part`);
  formData.append("file_token", file_token);

  console.log("FormData contents:");
  for (const pair of formData.entries()) {
    console.log(pair[0] + ":", pair[1]);
  }

  setIsLoading(true);

  try {
    const response = await fetch(`${baseUrl}/file/upload-first-chunk`, {
      method: "POST",
      headers: {
        Authorization: `Token ${token}`,
      },
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      const fileId = data.id;
      storeFileInIndexedDB(file, fileId, fileType, workorder_id);

      dispatch(
        addUploadingFile({
          type: fileType,
          file: { id: fileId, progress: 0, file },
        })
      );
      setIsLoading(false);
      if (fileType === "attachements") {
        upload_or_delete_workorder_files_for_attachements(
          workorder_id,
          fileId,
          "add",
          setIsLoading,
          fetchOneWorkOrder
        );
      } else {
        await upload_workorder_files(
          workorder_id,
          fileId,
          fileType,
          setIsLoading,
          fetchOneWorkOrder,
          fileStatus
        );
      }
      if (chunks > 1) {
        await uploadRemainingChunks(dispatch, file, fileType, fileId, chunks);
      }
      fetchOneWorkOrder();
      dispatch(removeUploadingFile({ type: fileType, fileId }));
    } else {
      console.error("Failed to upload first chunk");
    }
  } catch (err) {
    console.error("Error submitting first chunk", err);
  } finally {
    setIsLoading(false);
  }
};

export const handle_resuming_upload = async (
  dispatch: AppDispatch,
  fileId: number,
  file: File,
  fileType: "attachements" | "report" | "certificate" | "voucher",
  file_token: string,
  workorder_id: string,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  fetchFunc: () => void,
  enqueueSnackbar: (message: string, options?: any) => void 
) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) {
    console.error("No token found");
    return;
  }

  setIsLoading(true);

  try {
    const response = await fetch(
      `${baseUrl}/file/request-resuming-upload/${fileId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ file_token }),
      }
    );

    switch (response.status) {
      case 200: {
        const data = await response.json();
        const { total, uploaded_chunks } = data;

        // Calculate progress
        const progress: number = Number(
          ((uploaded_chunks[uploaded_chunks.length - 1] / total) * 100).toFixed(
            2
          )
        );
        setIsLoading(false);
        // Update the progress with the calculated value
        dispatch(
          addUploadingFile({
            type: fileType,
            file: { id: fileId, progress, file },
          })
        );
        storeFileInIndexedDB(file, fileId, fileType, workorder_id);

        await uploadRemainingChunks(
          dispatch,
          file,
          fileType,
          fileId,
          total,
          uploaded_chunks
        );
        fetchFunc();
        dispatch(removeUploadingFile({ type: fileType, fileId }));
        break;
      }

      case 404:
        enqueueSnackbar("there is no token for this file to compare", {
          variant: "error",
          autoHideDuration: 3000, // 3 seconds
        });
        break;

      case 406:
        enqueueSnackbar(
          "Either it is not the same file or the file content has been changed.",
          {
            variant: "error",
            autoHideDuration: 3000, // 3 seconds
          }
        );
        break;

      default:
        break;
    }
  } catch (err) {
    console.error("Error submitting resume upload", err);
  } finally {
    setIsLoading(false);
  }
};

export const handle_files_with_one_chunk = async (
  dispatch: AppDispatch, // Add dispatch as a parameter
  workorder_id: string,
  fileType: "attachements" | "report" | "certificate" | "voucher",
  file: File,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  fetchOneWorkOrder: () => void,
  fileStatus?: 0 | 1 | 2 | 3
) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) {
    console.error("No token found");
    return;
  }

  // Extract the first chunk
  const formData = new FormData();
  formData.append("name", file.name);
  formData.append("type", "1");
  formData.append("file", file);

  /* console.log("FormData contents:");
  for (const pair of formData.entries()) {
    console.log(pair[0] + ':', pair[1]);
  }*/

  setIsLoading(true);

  try {
    const response = await fetch(`${baseUrl}/file/upload-file`, {
      method: "POST",
      headers: {
        Authorization: `Token ${token}`,
      },
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      const fileId = data.id;

      // here
      dispatch(
        addUploadingFile({
          type: fileType,
          file: { id: fileId, progress: 0, file },
        })
      );
      setIsLoading(false);
      if (fileType === "attachements") {
        upload_or_delete_workorder_files_for_attachements(
          workorder_id,
          fileId,
          "add",
          setIsLoading,
          fetchOneWorkOrder
        );
      } else {
        await upload_workorder_files(
          workorder_id,
          fileId,
          fileType,
          setIsLoading,
          fetchOneWorkOrder,
          fileStatus
        );
      }
      fetchOneWorkOrder();
      dispatch(removeUploadingFile({ type: fileType, fileId }));
    } else {
      console.error("Failed to upload file");
    }
  } catch (err) {
    console.error("Error submitting file", err);
  } finally {
    setIsLoading(false);
  }
};

export const handleCancelUpload = async (
  fileId: number,
  dispatch?: AppDispatch,
  fileType?: "attachements" | "report" | "certificate" | "voucher",
  setIsLoading?: React.Dispatch<React.SetStateAction<boolean>>,
  fetchFunc?: () => void,
  setFile?: Dispatch<SetStateAction<TheUploadingFile | undefined>>
) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) {
    console.error("No token found");
    return;
  }
  if (setIsLoading) {
    setIsLoading(true);
  }

  try {
    const response = await fetch(`${baseUrl}/file/cancel-upload/${fileId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    });

    if (response.status === 200) {
      if (fetchFunc) {
        fetchFunc();
      }
      if (setFile) {
        setFile(undefined);
      }
      if (fileType && dispatch) {
        dispatch(removeUploadingFile({ type: fileType, fileId }));
      }
      await deleteFileFromIndexedDB(fileId);
    }
  } catch (error) {
    console.error("Error canceling upload:", error);
    alert("Failed to cancel the upload");
  } finally {
    if (setIsLoading) {
      setIsLoading(false);
    }
  }
};
