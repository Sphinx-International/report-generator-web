import React, { Dispatch, SetStateAction } from "react";
import { ReqSite, ResOfOneSite } from "../../assets/types/LosSites";
import { handleCloseDialog } from "../openDialog";

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

export const getOneSite = async (
  id: number,
  setData: Dispatch<SetStateAction<ResOfOneSite | null>>,
  setIsLoading: Dispatch<SetStateAction<boolean>>
) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) {
    console.error("No token found");
    return;
  }

  setIsLoading(true);

  try {
    const response = await fetch(`${baseUrl}/site/get-site/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    });
    if (response.ok) {
      const data = await response.json();
      setData(data);
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
