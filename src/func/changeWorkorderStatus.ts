const baseUrl = import.meta.env.VITE_BASE_URL;

export const handle_Assignment_and_execute = async (
  workorder_id: number,
  endPointPah:string,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  fetchOneWorkOrder: () => void,
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
  const requestBody = engineer_id
    ? JSON.stringify({ workorder_id, engineer_id })
    : JSON.stringify({ workorder_id });
  try {
    const response = await fetch(`http://${baseUrl}/workorder/${endPointPah}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: requestBody,
    });



      console.log(requestBody)
    if (response) {
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

export const handle_Validate_and_Acceptence = async (
  workorder_id: number,
  workorder_file: File,
  file_type: "report" | "acceptance",
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

  const formData = new FormData();
  formData.append("workorder_id", workorder_id.toString());

  switch (file_type) {
    case "report":
      formData.append("workorder_report", workorder_file);
      break;
    case "acceptance":
      formData.append("acceptance_certificate", workorder_file);
      break;
    default:
      console.log("need to send a file type");
      break;
  }

  for (const pair of formData.entries()) {
    console.log(`${pair[0]}: ${pair[1]}`);
  }

  setIsLoading(true);

  try {
    const response = await fetch(`http://${baseUrl}/workorder/${endPointPah}`, {
      method: "PUT",
      headers: {
        Authorization: `Token ${token}`,
      },
      body: formData,
    });

    if (response) {
      const data = await response.json();
      console.log("Form submitted successfully", data);

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
  workorder_id: number,
  Email: string | number,
  mail_method: "add" | "delete",
  setVisibleCoordPopup: React.Dispatch<React.SetStateAction<boolean>>,
  fetchOneWorkOrder: () => void
) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) {
    console.error("No token found");
    return;
  }

  console.log(JSON.stringify({ workorder_id, [mail_method]: [Email] }))
  try {
    const response = await fetch(
      `http://${baseUrl}/workorder/update-workorder-mails`,
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
  }
};
