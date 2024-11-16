import { reqOrders } from "../../assets/types/LosCommands";
import { Dispatch, SetStateAction } from "react";
import { handleCloseDialog } from "../openDialog";
import { ResProjectType } from "../../assets/types/LosSites";
import {
  ReqLosExecution,
  ResLosExecution,
} from "../../assets/types/LosCommands";

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

export const siteResult = async (
  result: ReqLosExecution,
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

export const fetchSiteResult = async (
  setData: React.Dispatch<React.SetStateAction<ResLosExecution | null>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  altId: number,
  site_type: 1 | 2
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
          console.log("done");
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
