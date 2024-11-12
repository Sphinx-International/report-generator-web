import { reqOrders } from "../../assets/types/LosCommands";
import { Dispatch, SetStateAction } from "react";
import { handleCloseDialog } from "../openDialog";
import { ResProjectType } from "../../assets/types/LosSites";

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
  setformValues: React.Dispatch<React.SetStateAction<reqOrders>>,
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
        type: data[0].id
       }))
    } else {
      setProjectTypes([]);
      firstProjectType(undefined);
      setformValues((prev) => ({ 
        ...prev,
        type: null
       }))
    }
  } catch (err) {
    console.error("Error: ", err);
  }
};
