import React, { Dispatch, SetStateAction } from "react";
import { ReqSite, ResOfOneSite } from "../../assets/types/LosSites";
import { handleCloseDialog } from "../openDialog";
import { EditingFields } from "../../pages/Los/EditSite";

const baseUrl = import.meta.env.VITE_BASE_URL;

export const handleCreateSite = async (
  formValues: ReqSite,
  setIsLoading: Dispatch<SetStateAction<boolean>>,
  ref: React.ForwardedRef<HTMLDialogElement>,
  fetchSites: () => void
) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) {
    console.error("No token found");
    return;
  }

  setIsLoading(true);

  try {
    const response = await fetch(`${baseUrl}/site/create-site`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(formValues),
    });
    if (response.ok) {
      const data = await response.json();
      console.log("Form submitted successfully", data);

      if (response.status === 200) {
        handleCloseDialog(ref);
        fetchSites();
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

export const updateSiteCode = async (
  id: number,
  code: string,
  setData: Dispatch<SetStateAction<ResOfOneSite | null>>,
  setIsLoading: Dispatch<SetStateAction<boolean>>,
  setEditing: Dispatch<SetStateAction<EditingFields>>
) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) {
    console.error("No token found");
    return;
  }

  setIsLoading(true);

  try {
    const response = await fetch(`${baseUrl}/site/update-site-code/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify({ code }),
    });
    if (response.ok) {
      setEditing((prev) => {
        const allFalse: EditingFields = Object.keys(prev).reduce((acc, key) => {
          acc[key as keyof EditingFields] = false;
          return acc;
        }, {} as EditingFields);
        return allFalse;
      });
      setData((prev) => {
        if (prev) {
          // Ensure prev is not null
          return {
            ...prev,
            site: {
              ...prev.site,
              code: code,
            },
          };
        }
        return prev; // If prev is null, do nothing
      });
    } else {
      const errorData = await response.json();
      console.error("Error submitting form", errorData);
    }
  } catch (err) {
    console.error("Error submitting form", err);
  } finally {
    setIsLoading(false);
  }
};

export const updateSiteinfo = async (
  id: number,
  data: {
    district?: string;
    municipality?: string;
    type?: 1 | 2 | 3 | 4 | 5;
    building_height?: number;
    site_height?: number;
    latitude?: number;
    longitude?: number;
  },
  setIsLoading: Dispatch<SetStateAction<boolean>>,
  setEditing: Dispatch<SetStateAction<EditingFields>>,
  fetchSite: () => void
) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) {
    console.error("No token found");
    return;
  }

  setIsLoading(true);
  try {
    const response = await fetch(`${baseUrl}/site/update-site-location/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      setEditing((prev) => {
        const allFalse: EditingFields = Object.keys(prev).reduce((acc, key) => {
          acc[key as keyof EditingFields] = false;
          return acc;
        }, {} as EditingFields);
        return allFalse;
      });
      fetchSite();
    } else if (response.status === 400) {
      const errorData = await response.json();
      console.error("Error: Bad Request", errorData);
    } else {
      console.error(`Unexpected error: ${response.status}`);
    }
  } catch (err) {
    console.error("Error while updating site information:", err);
  } finally {
    setIsLoading(false);
  }
};

export const addSiteLocation = async (
  data: {
    site: number;
    district: string;
    municipality: string;
    type: 1 | 2 | 3 | 4 | 5;
    building_height: number;
    site_height: number;
    latitude: number;
    longitude: number;
  },
  setIsLoading: Dispatch<SetStateAction<boolean>>,
) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) {
    console.error("No token found");
    return;
  }

  setIsLoading(true);
  try {
    const response = await fetch(`${baseUrl}/site/add-site-location`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      location.reload();
    } else {
      console.error(`Unexpected error: ${response.status}`);
    }
  } catch (err) {
    console.error("Error while adding site location:", err);
  } finally {
    setIsLoading(false);
  }
};
