import { reqOrders } from "../../assets/types/LosCommands";
import { Dispatch, SetStateAction } from "react";
import { handleCloseDialog } from "../openDialog";
import { ExectionPopupErrors } from "./validation/validateExectionPopup";
import {
  ReqLosExecution,
  ResLosExecution,
  ReqUploadSiteLocation,
} from "../../assets/types/LosCommands";
import { TheUploadingFile } from "../../assets/types/Mission";
import { NearEndLocation } from "../../assets/types/LosCommands";
import { generateFileToken } from "../generateFileToken";

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

  // Extract the file IDs from the attachments array
  const attachmentIds = formValues.attachments.map(
    (attachment) => attachment.id
  );

  // Create a new object for the body, replacing attachments with IDs
  const body = {
    ...formValues,
    attachments: attachmentIds,
  };

  try {
    const response = await fetch(
      `${baseUrl}/line-of-sight/create-line-of-sight`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(body),
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

export const setSiteHba = async (
  result: ReqLosExecution,
  losId: number | null,
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

    if (response.status === 200) {
      const data = await response.json();
      if (fecthOneOrder) {
        fecthOneOrder();
      }
      setSite((prev) => {
        const updatedSite = {
          latitude: prev?.latitude ?? null,
          longitude: prev?.longitude ?? null,
          hba: data.hba,
          id: data.id,
          site_type: data.site_type,
          los_result: data.los_result,
        };

        setCGPS(result, losId, () => updatedSite);

        return updatedSite; // Return the updated state
      });
      setCurrSlide(2);
      setFormErrs({});
    } else {
      switch (response.status) {
        case 400:
          console.log("Verify your data");
          setFormErrs({});
          break;

        case 409:
          setCurrSlide(2);
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
  } finally {
    setIsLoading(false);
  }
};

export const setCGPS = async (
  result: ReqLosExecution,
  losId: number | null,
  setSite: React.Dispatch<React.SetStateAction<ResLosExecution | null>>
) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) {
    console.error("No token found");
    return;
  }

  const requestBody = JSON.stringify({
    [result.site_type === 1 ? "line_of_sight" : "alternative"]:
      result.site_type === 1 ? losId : result.los_result,
    latitude: result.latitude,
    longitude: result.longitude,
  });
  try {
    const response = await fetch(
      result.site_type === 1
        ? `${baseUrl}/line-of-sight/add-near-end-cgps`
        : `${baseUrl}/line-of-sight/add-alternative-far-end-cgps`,
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
      const data = await response.json();
      switch (response.status) {
        case 200:
          setSite((prev) => {
            return {
              ...prev!,
              longitude: data.longitude,
              latitude: data.latitude,
            };
          });
          break;
        case 400:
          console.log("Verify your data");
          break;
        default:
          console.log("An unexpected error occurred");
          break;
      }
    }
  } catch (err) {
    console.error("Error submitting form", err);
  }
};

export const updateHba = async (
  result: {
    hba: number | null;
    longitude: number | null;
    latitude: number | null;
  },
  site_result_id: number,
  losId: number,
  altId: number,
  site_type: 1 | 2,
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

  try {
    const response = await fetch(
      `${baseUrl}/line-of-sight/update-site-result/${site_result_id}`,
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
      const data = await response.json();
      switch (response.status) {
        case 200:
          if (fecthOneOrder) {
            fecthOneOrder();
          }

          setSite((prev) => {
            if (!prev) return data;
            return {
              ...prev,
              hba: data.hba,
            };
          });
          updateCGPS(result, losId, altId, site_type, setSite);
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

export const updateCGPS = async (
  result: {
    hba: number | null;
    longitude: number | null;
    latitude: number | null;
  },
  losId: number,
  altId: number,
  site_type: 1 | 2,
  setSite: React.Dispatch<React.SetStateAction<ResLosExecution | null>>
) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) {
    console.error("No token found");
    return;
  }

  const requestBody = JSON.stringify({
    longitude: result.longitude,
    latitude: result.latitude,
  });

  try {
    const response = await fetch(
      site_type === 1
        ? `${baseUrl}/line-of-sight/update-near-end-cgps/${losId}`
        : `${baseUrl}/line-of-sight/update-alternative-far-end-cgps/${altId}`,
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
      const data = await response.json();
      switch (response.status) {
        case 200:
          setSite((prev) => {
            if (!prev) return data;
            return {
              ...prev,
              latitude: data.latitude,
              longitude: data.longitude,
            };
          });
          break;
        case 400:
          console.log("Verify your data");
          break;
        default:
          console.log("An unexpected error occurred");
          break;
      }
    }
  } catch (err) {
    console.error("Error submitting form", err);
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

  console.log(requestBody);

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

export const updateSiteImages = async (
  result: ReqUploadSiteLocation & {
    title?: string;
  },
  imageType: "site-location" | "site-position" | "additional-picture",
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setUpdateThisTime: React.Dispatch<React.SetStateAction<boolean>>,
  setCurrSlide?: React.Dispatch<React.SetStateAction<1 | 2 | 3 | 4>>,
  imageIndex?: number
): Promise<boolean> => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) {
    console.error("No token found");
    return false;
  }

  setIsLoading(true);

  const requestBody = JSON.stringify({
    image: result.image,
    comment: result.comment,
    title: result.title,
  });

  const url = imageIndex
    ? `${baseUrl}/line-of-sight/update-${imageType}/${result.site_result}/${imageIndex}`
    : `${baseUrl}/line-of-sight/update-${imageType}/${result.site_result}`;
  try {
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: requestBody,
    });

    if (response.ok) {
      setUpdateThisTime(false);
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

export const getHbaSiteResult = async (
  setData: React.Dispatch<React.SetStateAction<ResLosExecution | null>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  altId: number | null,
  site_type: 1 | 2 | null,
  losId: number | null
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
      const data = await response.json();
      switch (response.status) {
        case 200:
          setData(data);
          break;
        case 400:
          console.log("verify your data");
          break;
        case 404:
          setData((prev) => {
            if (!prev) return null;
            return { ...prev };
          });
          break;
        default:
          console.log("error");
          break;
      }
    }
  } catch (err) {
    console.error("Error submitting form", err);
  } finally {
    await getCGPS(setData, losId, altId, site_type!);
    setIsLoading(false);
  }
};

export const getCGPS = async (
  setData: React.Dispatch<React.SetStateAction<ResLosExecution | null>>,
  losId: number | null,
  altId: number | null,
  site_type: 1 | 2
  // fecthOneOrder?: () => void
) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) {
    console.error("No token found");
    return;
  }
  try {
    const response = await fetch(
      site_type === 1
        ? `${baseUrl}/line-of-sight/get-near-end-cgps/${losId}`
        : `${baseUrl}/line-of-sight/get-alternative-far-end-cgps/${altId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      }
    );

    if (response) {
      const data = await response.json();
      switch (response.status) {
        case 200:
          setData((prev) => {
            if (!prev) return data;
            return {
              ...prev,
              longitude: data.longitude,
              latitude: data.latitude,
            };
          });
          break;
        case 400:
          console.log("verify your data");
          break;
        case 404:
          setData((prev) => {
            if (!prev) return null;
            return { ...prev };
          });
          break;
        default:
          console.log("error");
          break;
      }
    }
  } catch (err) {
    console.error("Error submitting form", err);
  }
};

export const downloadSiteImages = async (
  fileId: number | undefined,
  setImageUrl: React.Dispatch<React.SetStateAction<string | null>>,
  setMetadata: React.Dispatch<
    React.SetStateAction<{ title?: string | null; comment?: string | null }>
  >,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  imageType: "site-location" | "site-position" | "additional-picture",
  imgindex?: number | null,
  onProgress?: (progress: number) => void
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
      mode: "cors",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Handle metadata parsing
    const metadataHeader =
      response.headers.get("X-Metadata") ||
      response.headers.get("x-metadata") ||
      response.headers.get("X-metadata");

    if (metadataHeader) {
      try {
        const parsedMetadata = JSON.parse(metadataHeader);
        setMetadata({
          title: parsedMetadata.title ?? null,
          comment: parsedMetadata.comment ?? null,
        });
      } catch (error) {
        console.warn("Failed to parse metadata:", error);
        setMetadata({ title: null, comment: null });
      }
    } else {
      setMetadata({ title: null, comment: null });
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("No reader found in the response");
    }

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
      site_location: NearEndLocation | null;
      losStatus: 1 | 2 | 3 | null;
      accessibility: boolean;
      image_count: number | null;
      secondSiteCode: string | null;
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

export const handleFinishLos = async (
  line_of_sight_id: number,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setCurrSlide: React.Dispatch<React.SetStateAction<1 | 2>>,
  enqueueSnackbar: (message: string, options?: any) => void,
  fecthOneOrder?: () => void
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
      `${baseUrl}/line-of-sight/finish-line-of-sight-execution/${line_of_sight_id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      }
    );

    if (response) {
      switch (response.status) {
        case 200:
          if (fecthOneOrder) {
            fecthOneOrder();
          }
          setCurrSlide(1);
          break;
        case 400:
          console.log("verify your data");
          break;
        case 406:
          enqueueSnackbar("Not all sites informations are filled.", {
            variant: "error",
            autoHideDuration: 3000,
          });
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

export const selectCGPS_toWorkWith = async (
  id: number,
  site_type: 1 | 2,
  choice: "suggested" | "original",
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  fetchOrder: () => void
) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  if (!token) {
    console.error("No token found");
    return;
  }

  setIsLoading(true);

  // Dynamically set the URL based on choice and site_type
  let url = "";
  if (site_type === 1) {
    if (choice === "original") {
      url = `use-original-near-end-cgps/${id}`;
    } else if (choice === "suggested") {
      url = `use-suggested-near-end-cgps/${id}`;
    }
  } else if (site_type === 2) {
    if (choice === "original") {
      url = `use-original-alternative-far-end-cgps/${id}`;
    } else if (choice === "suggested") {
      url = `use-suggested-alternative-far-end-cgps/${id}`;
    }
  }

  try {
    const response = await fetch(`${baseUrl}/line-of-sight/${url}`, {
      method: choice === "suggested" ? "DELETE" : "POST",
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    if (response) {
      switch (response.status) {
        case 200:
          console.log("done");
          fetchOrder();
          break;
        case 208:
          console.log("Already chosen");
          break;
        case 404:
          console.error("Not Found.");
          break;
        case 406:
          console.log("Not acceptable.");
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

export const generateReport = async (
  losId: number | null,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  fetchOrders?: () => void,
  isItTest: boolean = false
) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) {
    console.error("No token found");
    return;
  }
  setIsLoading(true);
  const url = isItTest
    ? `${baseUrl}/line-of-sight/generate-test-report/${losId}`
    : `${baseUrl}/line-of-sight/generate-report/${losId}`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    if (response) {
      switch (response.status) {
        case 200: {
          // Extract filename from the Content-Disposition header
          const contentDisposition = response.headers.get("Content-Disposition");
          let filename = `report_${losId}.pdf`; // Default name

          if (contentDisposition) {
            const match = contentDisposition.match(/filename="?([^"]+)"?/);
            if (match && match[1]) {
              filename = match[1]; // Use the filename from the backend
            }
          }
          // Handle PDF download
          const blob = await response.blob(); // Get the response as a Blob
          const url = window.URL.createObjectURL(blob); // Create a URL for the Blob
          const link = document.createElement("a"); // Create an anchor element
          link.href = url;
          link.download = filename; // Set the filename
          document.body.appendChild(link);
          link.click(); // Trigger the download
          document.body.removeChild(link); // Remove the anchor element
          console.log("Report generated and downloaded.");
          if (fetchOrders) {
            fetchOrders();
          }
          break;
        }
        default:
          console.log("An unexpected error occurred");
          break;
      }
    }
  } catch (err) {
    console.error("Error generating report", err);
  } finally {
    setIsLoading(false);
  }
};

export const downloadGeneratedReport = async (
  lineOfSightId: number,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
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
      `${baseUrl}/line-of-sight/download-generated-report/${lineOfSightId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Token ${token}`,
        },
      }
    );

    if (response.status === 200) {
      // Handle successful response and file download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `generated_report_${lineOfSightId}.pdf`; // Set the filename
      document.body.appendChild(link);
      link.click(); // Trigger the download
      document.body.removeChild(link); // Clean up
      console.log("PDF downloaded successfully.");
    } else {
      switch (response.status) {
        case 404:
          console.error("Not Found: Report does not exist.");
          break;
        case 409:
          console.error("Conflict: File does not exist (unexpected case).");
          break;
        default:
          console.error("An unexpected error occurred.");
          break;
      }
    }
  } catch (err) {
    console.error("Error fetching the report", err);
  } finally {
    setIsLoading(false);
  }
};

export const approveLineOfSight = async (
  losId: number,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  onSuccess: () => void
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
      `${baseUrl}/line-of-sight/approve-line-of-sight/${losId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      }
    );

    if (response) {
      switch (response.status) {
        case 200:
          console.log("Line of Sight approved successfully.");
          onSuccess(); // Callback for success
          break;
        case 404:
          console.error(
            "Not Found: The specified line of sight does not exist."
          );
          break;
        case 406:
          console.error("Not Acceptable: Invalid request.");
          break;
        default:
          console.error("An unexpected error occurred.");
      }
    }
  } catch (err) {
    console.error("Error during request:", err);
  } finally {
    setIsLoading(false);
  }
};

export const rejectLineOfSight = async (
  losId: number,
  message: string,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  onSuccess: () => void,
  ref: React.ForwardedRef<HTMLDialogElement>
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
      `${baseUrl}/line-of-sight/reject-line-of-sight/${losId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({ message }),
      }
    );

    if (response) {
      switch (response.status) {
        case 200:
          console.log("Line of Sight rejected successfully.");
          handleCloseDialog(ref);
          onSuccess(); // Callback for success
          break;
        case 401:
          console.error("Unauthorized: Please log in.");
          break;
        case 403:
          console.error("Forbidden: You don't have the necessary permissions.");
          break;
        case 404:
          console.error(
            "Not Found: The specified line of sight does not exist."
          );
          break;
        case 406:
          console.error(
            "Not Acceptable: Line of sight has not been generated yet."
          );
          break;
        default:
          console.error("An unexpected error occurred.");
      }
    }
  } catch (err) {
    console.error("Error during request:", err);
  } finally {
    setIsLoading(false);
  }
};

export const closeLineOfSight = async (
  losId: number,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  onSuccess: () => void
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
      `${baseUrl}/line-of-sight/close-line-of-sight/${losId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
        },
      }
    );

    if (response) {
      switch (response.status) {
        case 200:
          console.log("Line of Sight closed successfully.");
          onSuccess(); // Callback for success
          break;
        case 404:
          console.error(
            "Not Found: The specified line of sight does not exist."
          );
          break;
        case 406:
          console.error("Not Acceptable: Unable to close this line of sight.");
          break;
        default:
          console.error("An unexpected error occurred.");
      }
    }
  } catch (err) {
    console.error("Error during request:", err);
  } finally {
    setIsLoading(false);
  }
};

export const uploadReport = async (
  losId: number | null,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  fetchOrders?: () => void
) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) {
    console.error("No token found");
    return;
  }
  setIsLoading(true);
  const url = `${baseUrl}/line-of-sight/upload-line-of-sight-report`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    if (response) {
      switch (response.status) {
        case 200: {
          // Handle PDF download
          const blob = await response.blob(); // Get the response as a Blob
          const url = window.URL.createObjectURL(blob); // Create a URL for the Blob
          const link = document.createElement("a"); // Create an anchor element
          link.href = url;
          link.download = `report_${losId}.pdf`; // Set the filename
          document.body.appendChild(link);
          link.click(); // Trigger the download
          document.body.removeChild(link); // Remove the anchor element
          console.log("Report generated and downloaded.");
          if (fetchOrders) {
            fetchOrders();
          }
          break;
        }
        default:
          console.log("An unexpected error occurred");
          break;
      }
    }
  } catch (err) {
    console.error("Error generating report", err);
  } finally {
    setIsLoading(false);
  }
};

//upload of file:

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
      console.log(response.status);

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
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setUpdateThisTime?: React.Dispatch<React.SetStateAction<boolean>>
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
      if (setUpdateThisTime) {
        setUpdateThisTime(true);
      }
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

export const handle_files_with_one_chunk = async (
  file: File,
  setFile: React.Dispatch<React.SetStateAction<TheUploadingFile | undefined>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setUpdateThisTime?: React.Dispatch<React.SetStateAction<boolean>>
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
      setFile({ id: fileId, progress: 100.0, file });
      if (setUpdateThisTime) {
        setUpdateThisTime(true);
      }
    }
  } catch (err) {
    console.error("Error submitting file", err);
  } finally {
    setIsLoading(false);
  }
};
export const handleFileChange = async (
  file: File,
  setFile: React.Dispatch<React.SetStateAction<TheUploadingFile | undefined>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setUpdateThisTime?: React.Dispatch<React.SetStateAction<boolean>>
) => {
  if (file.size > 20 * 1024 * 1024) {
    alert(`${file.name} exceeds the 20MB limit.`);
  } else if (file.size <= 32 * 1024) {
    handle_files_with_one_chunk(file, setFile, setIsLoading, setUpdateThisTime);
  } else {
    const file_token = await generateFileToken(file);
    handle_chunck(file, file_token, setFile, setIsLoading, setUpdateThisTime);
  }
};
