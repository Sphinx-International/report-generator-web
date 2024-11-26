import { reqOrders } from "../../assets/types/LosCommands";
import { Dispatch, SetStateAction } from "react";
import { handleCloseDialog } from "../openDialog";
import { ResProjectType } from "../../assets/types/LosSites";
import { ExectionPopupErrors } from "./validation/validateExectionPopup";
import {
  ReqLosExecution,
  ResLosExecution,
  ReqUploadSiteLocation,
} from "../../assets/types/LosCommands";
import { TheUploadingFile } from "../../assets/types/Mission";

const baseUrl = import.meta.env.VITE_BASE_URL;

export const handleCreateOrder = async (
  formValues: reqOrders,
  setIsLoading: Dispatch<SetStateAction<boolean>>,
  ref: React.ForwardedRef<HTMLDialogElement>,
  fetchOrders?: () => void
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
      `${baseUrl}/line-of-sight/create-line-of-sight`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(formValues),
      }
    );
    console.log(response.status);
    if (response.ok) {
      const data = await response.json();
      console.log("Form submitted successfully", data);

      if (response.status === 200) {
        handleCloseDialog(ref);
        if (fetchOrders) {
          fetchOrders();
        }
      }
    } else {
      const errorData = await response.json();
      console.error("Error submitting form", errorData);
    }
  } catch (err) {
    console.error("Error submitting form", err);
  } finally {
    setIsLoading(false);
    // localStorage.setItem("selectedFilterForWorkorders", "all");
  }
};

export const fetchProjectTypes = async (
  setProjectTypes: React.Dispatch<React.SetStateAction<ResProjectType[]>>,
  firstProjectType: React.Dispatch<
    React.SetStateAction<ResProjectType | undefined>
  >,
  setformValues: React.Dispatch<React.SetStateAction<reqOrders>>
) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) {
    console.error("No token found");
    return;
  }

  const url = `${baseUrl}/line-of-sight/get-project-types`;
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response text: ", errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const text = await response.text();

    // Check if the response is empty
    if (text) {
      const data = JSON.parse(text);
      setProjectTypes(data);
      firstProjectType(data[0]);
      setformValues((prev) => ({
        ...prev,
        type: data[0].id,
      }));
    } else {
      setProjectTypes([]);
      firstProjectType(undefined);
      setformValues((prev) => ({
        ...prev,
        type: null,
      }));
    }
  } catch (err) {
    console.error("Error: ", err);
  }
};

export const handleAssingLos = async (
  line_of_sight_id: number,
  engineer_id: number,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  fecthOneOrder?: () => void
) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) {
    console.error("No token found");
    return;
  }
  setIsLoading(true);

  // Create the request body based on the presence of engineer_id
  const requestBody = JSON.stringify({ line_of_sight_id, engineer_id });

  try {
    const response = await fetch(
      `${baseUrl}/line-of-sight/assign-line-of-sight`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: requestBody,
      }
    );

    if (response) {
      switch (response.status) {
        case 200:
          if (fecthOneOrder) {
            fecthOneOrder();
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
  }
};

export const handleExecuteLos = async (
  line_of_sight_id: number,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setCurrSlide: React.Dispatch<React.SetStateAction<1 | 2>>,
  fecthOneOrder?: () => void
) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) {
    console.error("No token found");
    return;
  }
  setIsLoading(true);

  const requestBody = JSON.stringify({ line_of_sight_id });

  try {
    const response = await fetch(
      `${baseUrl}/line-of-sight/launch-line-of-sight-execution`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: requestBody,
      }
    );

    if (response) {
      switch (response.status) {
        case 200:
          if (fecthOneOrder) {
            fecthOneOrder();
          }
          setCurrSlide(2);
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
  }
};

export const losResult = async (
  alternative: number,
  status: 1 | 2 | 3,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setOpenDropDown: React.Dispatch<React.SetStateAction<number | null>>,
  fecthOneOrder?: () => void
) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) {
    console.error("No token found");
    return;
  }
  setIsLoading(true);
  setOpenDropDown(null);

  const requestBody = JSON.stringify({ alternative, status });

  try {
    const response = await fetch(
      `${baseUrl}/line-of-sight/add-line-of-sight-result`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: requestBody,
      }
    );

    if (response) {
      switch (response.status) {
        case 200:
          if (fecthOneOrder) {
            fecthOneOrder();
          }
          //setCurrSlide(2);
          console.log("done");
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
  }
};

export const updateLosResult = async (
  alternative: number,
  status: 1 | 2 | 3,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setOpenDropDown: React.Dispatch<React.SetStateAction<number | null>>,
  fecthOneOrder?: () => void
) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) {
    console.error("No token found");
    return;
  }
  setIsLoading(true);
  setOpenDropDown(null);

  const requestBody = JSON.stringify({ status });

  try {
    const response = await fetch(
      `${baseUrl}/line-of-sight/update-line-of-sight-result/${alternative}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: requestBody,
      }
    );

    if (response) {
      switch (response.status) {
        case 200:
          if (fecthOneOrder) {
            fecthOneOrder();
          }
          //setCurrSlide(2);
          console.log("done");
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
  }
};

export const siteResult = async (
  result: ReqLosExecution,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setCurrSlide: React.Dispatch<React.SetStateAction<1 | 2 | 3 | 4>>,
  setSite: React.Dispatch<React.SetStateAction<ResLosExecution | null>>,
  setFormErrs: React.Dispatch<React.SetStateAction<ExectionPopupErrors>>,
  fecthOneOrder?: () => void
) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) {
    console.error("No token found");
    return;
  }
  setIsLoading(true);

  const requestBody = JSON.stringify(result);

  try {
    const response = await fetch(`${baseUrl}/line-of-sight/add-site-result`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: requestBody,
    });

    if (response) {
      switch (response.status) {
        case 200:
          if (fecthOneOrder) {
            fecthOneOrder();
          }
          setCurrSlide(2);
          setSite(await response.json());
          setFormErrs({});
          break;
        case 400:
          console.log("Verify your data");
          setFormErrs({});
          break;
        case 422:
          setFormErrs({
            hba: "Please enter HBA between [0 - structure height]",
          });
          break;
        default:
          console.log("An unexpected error occurred");
          setFormErrs({});
          break;
      }
    }
  } catch (err) {
    console.error("Error submitting form", err);
    setFormErrs({});
  } finally {
    setIsLoading(false);
  }
};

export const updateSiteResult = async (
  result: {
    hba: number | null;
    longitude: number | null;
    latitude: number | null;
  },
  site_result_id:number,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setSite: React.Dispatch<React.SetStateAction<ResLosExecution | null>>,
  setFormErrs: React.Dispatch<React.SetStateAction<ExectionPopupErrors>>,
  fecthOneOrder?: () => void
) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) {
    console.error("No token found");
    return;
  }
  setIsLoading(true);

  const requestBody = JSON.stringify(result);

  console.log(requestBody)

  try {
    const response = await fetch(`${baseUrl}/line-of-sight/update-site-result/${site_result_id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: requestBody,
    });

    if (response) {
      switch (response.status) {
        case 200:
          if (fecthOneOrder) {
            fecthOneOrder();
          }
          setSite(await response.json());
          setFormErrs({});
          break;
        case 400:
          console.log("Verify your data");
          setFormErrs({});
          break;
        case 422:
          setFormErrs({
            hba: "Please enter HBA between [0 - structure height]",
          });
          break;
        default:
          console.log("An unexpected error occurred");
          setFormErrs({});
          break;
      }
    }
  } catch (err) {
    console.error("Error submitting form", err);
    setFormErrs({});
  } finally {
    setIsLoading(false);
  }
};

export const uploadSiteImages = async (
  result: ReqUploadSiteLocation & {
    title?: string;
  },
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  imageType: "site-location" | "site-position" | "additional-picture",
  setCurrSlide?: React.Dispatch<React.SetStateAction<1 | 2 | 3 | 4>>,
  fecthOneOrder?: () => void
): Promise<boolean> => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) {
    console.error("No token found");
    return false;
  }

  setIsLoading(true);

  const requestBody = JSON.stringify(result);

  try {
    const response = await fetch(
      `${baseUrl}/line-of-sight/upload-${imageType}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: requestBody,
      }
    );

    if (response.ok) {
      if (fecthOneOrder) {
        console.log("enter");
        fecthOneOrder();
      }
      if (setCurrSlide) {
        imageType === "site-location" ? setCurrSlide(3) : setCurrSlide(4);
      }
      return true; // Success case
    } else if (response.status === 400) {
      console.log("Verify your data");
    } else {
      console.log("Error occurred");
    }
  } catch (err) {
    console.error("Error submitting form", err);
  } finally {
    setIsLoading(false);
  }

  return false;
};

export const fetchSiteResult = async (
  setData: React.Dispatch<React.SetStateAction<ResLosExecution | null>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  altId: number | null,
  site_type: 1 | 2 | null
  // fecthOneOrder?: () => void
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
      `${baseUrl}/line-of-sight/get-site-result/${altId}/${site_type}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      }
    );

    if (response) {
      switch (response.status) {
        case 200:
          setData(await response.json());
          break;
        case 400:
          console.log("verify your data");
          break;
        case 404:
          setData(null);
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
  }
};

export const downloadSiteImages = async (
  fileId: number | undefined,
  setImageUrl: React.Dispatch<React.SetStateAction<string | null>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  imageType: "site-location" | "site-position" | "additional-picture",
  imgindex?: number | null,
  onProgress?: (progress: number) => void,
  onComplete?: () => void
) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) {
    console.error("No token found");
    return;
  }

  setIsLoading(true);
  try {
    const url =
      imageType === "additional-picture"
        ? `${baseUrl}/line-of-sight/download-${imageType}/${fileId}/${imgindex}`
        : `${baseUrl}/line-of-sight/download-${imageType}/${fileId}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json, application/octet-stream",
        Authorization: `Token ${token}`,
      },
      mode: "cors", // Keep cors mode
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Debug: Log all headers
    console.log("All response headers:");
    response.headers.forEach((value, key) => {
      console.log(`${key}: ${value}`);
    });
    console.log(response.headers.get("X-metadata"));
    // Try to get metadata with different header cases
    const metadata =
      response.headers.get("X-Metadata") ||
      response.headers.get("x-metadata") ||
      response.headers.get("X-metadata");

    console.log("Metadata header:", metadata);

    if (metadata) {
      try {
        const parsedMetadata = JSON.parse(metadata);
        console.log("Parsed metadata:", parsedMetadata);
      } catch (e) {
        console.warn("Failed to parse metadata:", e);
      }
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("No reader found in the response");
    }
    console.log(reader);
    const contentLength = response.headers.get("content-length");
    const total = contentLength ? parseInt(contentLength, 10) : 0;
    let receivedLength = 0;

    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      if (value) {
        chunks.push(value);
        receivedLength += value.length;

        if (onProgress && total > 0) {
          onProgress((receivedLength / total) * 100);
        }
      }
    }

    const blob = new Blob(chunks, {
      type: response.headers.get("content-type") || "image/jpeg",
    });
    const urlImg = URL.createObjectURL(blob);

    setImageUrl(urlImg);
    onComplete?.();
  } catch (error) {
    console.error("Download failed:", error);
    throw error;
  } finally {
    setIsLoading(false);
  }
};

export const updateAccessStatus = async (
  id: number,
  method: "POST" | "DELETE",
  type: 1 | 2,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setSiteInfo: React.Dispatch<
    React.SetStateAction<{
      losId: number | null;
      altId: number | null;
      site_type: 1 | 2 | null;
      site_name: string;
      losStatus: 1 | 2 | 3 | null;
      accessibility: boolean;
      image_count: number | null;
    }>
  >,
  setErrorUpdatingAccess: React.Dispatch<React.SetStateAction<boolean>>,
  fetchOrder: () => void
) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  if (!token) {
    console.error("No token found");
    return;
  }

  setIsLoading(true);

  const endpoint = `${
    type === 1 ? "set-near-end" : "set-far-end"
  }-to-no-access-status/${id}`;
  const url =
    method === "DELETE"
      ? endpoint.replace("set", "remove").replace("to-no", "from-no")
      : endpoint;

  try {
    const response = await fetch(`${baseUrl}/line-of-sight/${url}`, {
      method,
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    if (response) {
      switch (response.status) {
        case 200:
          console.log(`${method} request successful.`);
          setSiteInfo((prevSiteInfo) => ({
            ...prevSiteInfo,
            accessibility: !prevSiteInfo.accessibility, // Reverse accessibility
          }));
          fetchOrder();
          break;
        case 208:
          console.log(
            `${
              type === 1 ? "Near" : "Far"
            } end is already in the desired state.`
          );
          break;
        case 404:
          console.error("Not Found.");
          break;
        case 406:
          setErrorUpdatingAccess(true);
          break;
        default:
          console.log("An unexpected error occurred.");
          break;
      }
    }
  } catch (err) {
    console.error("Error during request", err);
  } finally {
    setIsLoading(false);
  }
};

export const addOrDeleteAlt = async (
  line_of_sight_id: number,
  method: "add" | "delete",
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  fetchOrder: () => void,
  site_id?: number
) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  if (!token) {
    console.error("No token found");
    return;
  }

  setIsLoading(true);

  const url =
    method === "delete"
      ? `/line-of-sight/remove-line-of-sight-alternative/${line_of_sight_id}`
      : `/line-of-sight/add-line-of-sight-alternative`;

  try {
    const options: RequestInit = {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    };

    // Set body only for PATCH requests
    if (method === "add") {
      options.body = JSON.stringify({ line_of_sight_id, site_id });
    }

    const response = await fetch(`${baseUrl}${url}`, options);

    if (response.ok) {
      fetchOrder();
    } else {
      console.log("Unexpected response");
    }
  } catch (err) {
    console.error("Error during request", err);
  } finally {
    setIsLoading(false);
  }
};

const uploadRemainingChunks = async (
  file: File,
  fileId: number,
  setFile: React.Dispatch<React.SetStateAction<TheUploadingFile | undefined>>,
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
            setFile((prev) => ({ ...prev, progress }));
          }
          break;
        case 201:
          setFile((prev) => ({ ...prev, progress: 100 }));
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
  file: File,
  file_token: string,
  setFile: React.Dispatch<React.SetStateAction<TheUploadingFile | undefined>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
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
      setFile((prev) => ({ ...prev, id: fileId }));

      setIsLoading(false);

      if (totalChunks > 1) {
        await uploadRemainingChunks(file, fileId, setFile, chunkSize, [], 1);
      } else {
        setFile((prev) => ({ ...prev, progress: 100 }));
      }

      // fetchOneWorkOrder();
    } else {
      console.error("Failed to upload first chunk");
    }
  } catch (err) {
    console.error("Error submitting first chunk", err);
  } finally {
    setIsLoading(false);
  }
};
