import { AppDispatch } from "../../Redux/store";
import { generateFileToken } from "../generateFileToken";
import {
  updateFileProgress,
  addUploadingFile,
  removeUploadingFile,
} from "../../Redux/slices/uploadingFilesSlice";
import {
  deleteFileFromIndexedDB,
  storeFileInIndexedDB,
} from "../generateFileToken";
import { TheUploadingFile } from "../../assets/types/Mission";

const baseUrl = import.meta.env.VITE_BASE_URL;

export const handleFileChangeWithRedux = async (
  dispatch: AppDispatch,
  los_id: number,
  file: File,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  fetchOneWorkOrder: () => void,
  fileInputRef?: React.RefObject<HTMLInputElement>,
) => {
  if (file.size > 20 * 1024 * 1024) {
    alert(`${file.name} exceeds the 20MB limit.`);
  } else if (file.size <= 32 * 1024) {
    handle_files_with_one_chunk(
      dispatch,
      los_id,
      file,
      setIsLoading,
      fetchOneWorkOrder,
    );
  } else {
    const file_token = await generateFileToken(file);
    handle_chunck(
      dispatch,
      los_id,
      file,
      file_token,
      setIsLoading,
      fetchOneWorkOrder,
    );
  }

  // Reset the file input value to allow re-selection of the same file
  if (fileInputRef?.current) {
    fileInputRef.current.value = "";
  }
};

const uploadRemainingChunks = async (
  dispatch: AppDispatch,
  file: File,
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
            dispatch(updateFileProgress({ type: "report", fileId, progress }));
          }
          break;
        case 201:
          dispatch(
            updateFileProgress({ type: "report", fileId, progress: 100.0 })
          );
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
  los_id: number,
  file: File,
  file_token: string,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  fetchOneWorkOrder: () => void,
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

      storeFileInIndexedDB(file, fileId, "report", String(los_id));
      dispatch(
        addUploadingFile({
          type: "report",
          file: { id: fileId, progress: 0, file },
        })
      );
      setIsLoading(false);

      await upload_workorder_files(
        los_id,
        fileId,
        setIsLoading,
        fetchOneWorkOrder,
      );

      if (totalChunks > 1) {
        await uploadRemainingChunks(
          dispatch,
          file,
          fileId,
          chunkSize,
          [], // Start with an empty array for uploaded chunks
          1
        );
      }

      dispatch(removeUploadingFile({ type: "report", fileId }));
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
  file_token: string,
  los_id: string,
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
            type: "report",
            file: { id: fileId, progress, file },
          })
        );
        storeFileInIndexedDB(file, fileId, "report", los_id);

        await uploadRemainingChunks(
          dispatch,
          file,
          fileId,
          512 * 1024,
          uploaded_chunks,
          uploaded_chunks[uploaded_chunks.length - 1] + 1 // Start from the first unuploaded chunk
        );

        fetchFunc();
        dispatch(removeUploadingFile({ type: "report", fileId }));
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
  los_id: number,
  file: File,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  fetchOneWorkOrder: () => void,
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
          type: "report",
          file: { id: fileId, progress: 0, file },
        })
      );
      setIsLoading(false);

      await upload_workorder_files(
        los_id,
        fileId,
        setIsLoading,
        fetchOneWorkOrder,
      );

      fetchOneWorkOrder();
      dispatch(removeUploadingFile({ type: "report", fileId }));
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
  setIsLoading?: React.Dispatch<React.SetStateAction<boolean>>,
  fetchFunc?: () => void,
  setFile?: React.Dispatch<React.SetStateAction<TheUploadingFile | undefined>>
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
      if ( dispatch) {
        dispatch(removeUploadingFile({ type: "report", fileId }));
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

export const upload_workorder_files = async (
  line_of_sight: number,
  file: number,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  fetchOneWorkOrder: () => void
) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) {
    console.error("No token found");
    return;
  }
  setIsLoading(true);

  try {
    const body = JSON.stringify({ line_of_sight, file, type: 1 });

    console.log("Request Body:", body);

    // Construct the URL based on fileType and extantionType
    const url = `${baseUrl}/line-of-sight/upload-line-of-sight-report`;

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
