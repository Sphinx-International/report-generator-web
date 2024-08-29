const baseUrl = import.meta.env.VITE_BASE_URL;

export const handle_Assignment_and_execute = async (
  workorder_id: string,
  endPointPah: string,
  method: "PUT" | "PATCH",
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  fetchOneWorkOrder?: () => void,
  engineer_id?: string
) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) {
    console.error("No token found");
    return;
  }
  setIsLoading(true);

  // Create the request body based on the presence of engineer_id
  const requestBody =
    method === "PATCH"
      ? JSON.stringify({ id: workorder_id, assign_to: engineer_id })
      : engineer_id
      ? JSON.stringify({ workorder_id, engineer_id })
      : JSON.stringify({ workorder_id });
  try {
    const response = await fetch(`${baseUrl}/workorder/${endPointPah}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: requestBody,
    });

    console.log(requestBody);
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
  }
};

export const handle_Validate_and_Acceptence = async (
  workorder_id: string,
  endPointPah: string,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  fetchOneWorkOrder: () => void
) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) {
    console.error("No token found");
    return;
  }
  console.log(JSON.stringify({ workorder_id }));
  setIsLoading(true);
  try {
    const response = await fetch(`${baseUrl}/workorder/${endPointPah}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify({ workorder_id }),
    });

    if (response) {
      console.log(response.status);
      switch (response.status) {
        case 200:
          fetchOneWorkOrder();
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

export const handle_add_or_delete_mailedPerson = async (
  workorder_id: string,
  Email: string | number,
  mail_method: "add" | "delete",
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setVisibleCoordPopup: React.Dispatch<React.SetStateAction<boolean>>,
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
    const response = await fetch(
      `${baseUrl}/workorder/update-workorder-mails`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({ workorder_id, [mail_method]: [Email] }),
      }
    );
    if (response) {
      console.log(response.status);

      switch (response.status) {
        case 200:
          setVisibleCoordPopup(false);
          fetchOneWorkOrder();
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
