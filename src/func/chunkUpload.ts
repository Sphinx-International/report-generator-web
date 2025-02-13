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
import  { Dispatch, SetStateAction } from "react";
import { TheUploadingFile } from "../assets/types/Mission";

export const upload_or_delete_workorder_files_for_attachements = async (
  workorder_id: string,
  file_id: number,
  method: "add" | "delete",
  extantionType: "modernisation" | "workorder" | "new-site",
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  fetchOneWorkOrder?: () => void
) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) {
    console.error("No token found");
    return;
  }

  let body: FormData | string;
  const headers: HeadersInit = {
    Authorization: `Token ${token}`,
  };

  if (extantionType === "workorder") {
    // Use FormData for "workorder" extension type
    const formData = new FormData();
    formData.append("workorder_id", workorder_id.toString());
    formData.append(method, file_id.toString());
    body = formData;
  } else {
    // Use JSON for "modernisation" and "new-site" extension types
    const jsonBody = {
      ...(extantionType === "modernisation"
        ? { modernisation_id: workorder_id.toString() }
        : { new_site_id: workorder_id.toString() }),
      [method]: [file_id.toString()],
    };
    body = JSON.stringify(jsonBody);
    headers["Content-Type"] = "application/json"; // Set JSON content type

    console.log("Request JSON body:", jsonBody);
  }

  setIsLoading(true);
  try {
    const response = await fetch(
      `${baseUrl}/${extantionType}/update-${extantionType}-attachments`,
      {
        method: "PUT",
        headers: headers,
        body: body,
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
    console.log("Finally");
  }
};

export const upload_workorder_files = async (
  workorder: string,
  file: number,
  fileType: "report" | "certificate" | "voucher",
  extantionType: "modernisation" | "workorder" | "new-site" ,
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
    // Construct the request body based on extantionType and fileType
    const baseBody = {
      [extantionType === "workorder"
        ? "workorder"
        : extantionType === "modernisation"
        ? "modernisation"
        : "new_site"]: workorder,
      file,
    };

    const body =
      fileType === "certificate" || fileType === "report"
        ? JSON.stringify({ ...baseBody, type: fileStatus })
        : JSON.stringify(baseBody);

    console.log("Request Body:", body);

    // Construct the URL based on fileType and extantionType
    const url = `${baseUrl}/${extantionType}/upload-${extantionType}${
      fileType === "voucher" ? `-return-${fileType}` : `-${fileType}`
    }`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body,
    });

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
  chunkSize: number = 512 * 1024, // Default chunk size of 512KB for remaining chunks
  uploadedChunks: number[] = [], // Ensure uploadedChunks is an array
  startFromChunk: number = 1 // Default to start from the second chunk
) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) {
    console.error("No token found");
    return;
  }

  // Start after the first 32KB chunk (i.e., from byte 32 * 1024)
  let start = 32 * 1024;
  const totalRemainingChunks = Math.ceil((file.size - start) / chunkSize);

  for (let index = startFromChunk; index <= totalRemainingChunks; index++) {
    if (uploadedChunks.includes(index)) {
      start += chunkSize; // Skip already uploaded chunks
      continue;
    }

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
          headers: { Authorization: `Token ${token}` },
          body: formData,
        }
      );
      switch (response.status) {
        case 200:
          {
            const progress = ((index + 1) / (totalRemainingChunks + 1)) * 100;
            dispatch(updateFileProgress({ type: fileType, fileId, progress }));
          }
          break;
        case 201:
          dispatch(
            updateFileProgress({ type: fileType, fileId, progress: 100.0 })
          );
          console.log("here");
          await deleteFileFromIndexedDB(fileId);
          break;
        default:
          {
            const errorData = await response.json();
            console.error(`Failed to upload chunk ${index}:`, errorData);
          }
          break;
      }
    } catch (err) {
      console.error(`Error uploading chunk ${index}:`, err);
      break;
    }
    start += chunkSize;
  }
};

export const handle_chunck = async (
  dispatch: AppDispatch,
  workorder_id: string,
  fileType: "attachements" | "report" | "certificate" | "voucher",
  extantionType: "modernisation" | "workorder" | "new-site",
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

  const firstChunkSize = 32 * 1024;
  const chunkSize = 512 * 1024;
  const totalChunks = Math.ceil((file.size - firstChunkSize) / chunkSize) + 1;
  const firstChunk = file.slice(0, firstChunkSize);

  const formData = new FormData();
  formData.append("name", file.name);
  formData.append("type", "1");
  formData.append("total_chunks", totalChunks.toString());
  formData.append("file", firstChunk, `${file.name}.part`);
  formData.append("file_token", file_token);

  setIsLoading(true);

  try {
    const response = await fetch(`${baseUrl}/file/upload-first-chunk`, {
      method: "POST",
      headers: { Authorization: `Token ${token}` },
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
          extantionType,
          setIsLoading,
          fetchOneWorkOrder
        );
      } else {
        await upload_workorder_files(
          workorder_id,
          fileId,
          fileType,
          extantionType,
          setIsLoading,
          fetchOneWorkOrder,
          fileStatus
        );
      }

      if (totalChunks > 1) {
        await uploadRemainingChunks(
          dispatch,
          file,
          fileType,
          fileId,
          chunkSize,
          [], // Start with an empty array for uploaded chunks
          1
        );
      }

      dispatch(removeUploadingFile({ type: fileType, fileId }));
      fetchOneWorkOrder();
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

        console.log(total, uploaded_chunks);

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
          512 * 1024,
          uploaded_chunks,
          uploaded_chunks[uploaded_chunks.length - 1] + 1 // Start from the first unuploaded chunk
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
  extantionType: "modernisation" | "workorder" | "new-site",
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
          extantionType,
          setIsLoading,
          fetchOneWorkOrder
        );
      } else {
        await upload_workorder_files(
          workorder_id,
          fileId,
          fileType,
          extantionType,
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
