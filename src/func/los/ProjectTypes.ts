import { ResProjectType } from "../../assets/types/LosSites";
import { reqOrders } from "../../assets/types/LosCommands";
import { ForwardedRef } from "react";
import { handleCloseDialog } from "../openDialog";

const baseUrl = import.meta.env.VITE_BASE_URL;

export const fetchProjectTypes = async (
  setProjectTypes: React.Dispatch<React.SetStateAction<ResProjectType[]>>,
  firstProjectType?: React.Dispatch<
    React.SetStateAction<ResProjectType | undefined>
  >,
  setformValues?: React.Dispatch<React.SetStateAction<reqOrders>>,
  setIsLoading?: React.Dispatch<React.SetStateAction<boolean>>
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

    const data = await response.json();

    // Check if the response is empty
    if (Array.isArray(data) && data.length > 0) {
      setProjectTypes(data);
      if (firstProjectType) {
        firstProjectType(data[0]);
      }
      if (setformValues) {
        setformValues((prev) => ({
          ...prev,
          type: data[0].id,
        }));
      }
    } else {
      setProjectTypes([]);
      if (firstProjectType) {
        firstProjectType(undefined);
      }
      if (setformValues) {
        setformValues((prev) => ({
          ...prev,
          type: null,
        }));
      }
    }
  } catch (err) {
    console.error("Error: ", err);
  } finally {
    if (setIsLoading) {
      setIsLoading(false);
    }
  }
};

export const createProjectTypes = async (
  name: string,
  setName: React.Dispatch<React.SetStateAction<string>>,
  setProjectTypes: React.Dispatch<React.SetStateAction<ResProjectType[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
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

  const url = `${baseUrl}/line-of-sight/create-project-type`;
  const body = JSON.stringify({ name });

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response text: ", errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    switch (response.status) {
      case 200:
        // Add the newly created project type to the existing list
        setProjectTypes((prevProjectTypes) => [...prevProjectTypes, data]);
        setName("");
        console.log("Project type created successfully:", data);
        break;
      case 400:
        console.log("Verify your data");
        break;
      default:
        console.log("Unexpected error occurred");
        break;
    }
  } catch (err) {
    console.error("Error submitting form", err);
  } finally {
    setIsLoading(false);
  }
};

export const deleteProjectTypes = async (
  id: number,
  setProjectTypes: React.Dispatch<React.SetStateAction<ResProjectType[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  enqueueSnackbar: (message: string, options?: any) => void
) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) {
    console.error("No token found");
    return;
  }

  setIsLoading(true);

  const url = `${baseUrl}/line-of-sight/delete-project-type/${id}`;
  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    });

    switch (response.status) {
      case 200:
        // Remove the project type with the matching ID from the state
        setProjectTypes((prevProjectTypes) =>
          prevProjectTypes.filter((projectType) => projectType.id !== id)
        );
        console.log(`Project type with ID ${id} deleted successfully`);
        break;
      case 406:
        enqueueSnackbar(
          "This project type is linked to LOS orders and cannot be deleted.",
          {
            variant: "error",
            autoHideDuration: 3000,
          }
        );
        break;
      default:
        console.log("Unexpected error occurred");
        break;
    }
  } catch (err) {
    console.error("Error submitting form", err);
  } finally {
    setIsLoading(false);
  }
};

export const editProjectType = async (
  id: number,
  newName: string,
  setProjectTypes: React.Dispatch<React.SetStateAction<ResProjectType[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  dialogRef: ForwardedRef<HTMLDialogElement>,
  enqueueSnackbar: (message: string, options?: any) => void
) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) {
    console.error("No token found");
    return;
  }

  setIsLoading(true);

  const url = `${baseUrl}/line-of-sight/update-project-type/${id}`;
  const body = JSON.stringify({ name: newName });

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body,
    });



    switch (response.status) {
      case 200:
        // Update the specific project type in the state
        setProjectTypes((prevProjectTypes) =>
          prevProjectTypes.map((projectType) =>
            projectType.id === id
              ? { ...projectType, name: newName }
              : projectType
          )
        );
        handleCloseDialog(dialogRef)
        console.log(`Project type with ID ${id} updated successfully.`);
        break;
      case 409:
        enqueueSnackbar(
            "This name is already used.",
            {
              variant: "error",
              autoHideDuration: 3000,
            }
          );
        break;
      default:
        console.log("Unexpected error occurred.");
        break;
    }
  } catch (err) {
    console.error("Error submitting form", err);
  } finally {
    setIsLoading(false);
  }
};
