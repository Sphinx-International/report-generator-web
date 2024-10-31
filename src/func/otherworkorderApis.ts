const baseUrl = import.meta.env.VITE_BASE_URL;
import { handle_files_with_one_chunk, handle_chunck } from "./chunkUpload";
import { generateFileToken } from "./generateFileToken";
import { AppDispatch } from "../Redux/store";

export const handle_edit_or_reqUpdate_report = async (
  workorder_id: string,
  notify_engineer: boolean,
  extantionType: "workorder" | "modernisation",
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  fetchOneWorkOrder: () => void,
  message?: string
) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) {
    console.error("No token found");
    return;
  }
  setIsLoading(true);
  try {
    const response = await fetch(`${baseUrl}/${extantionType}/request-update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(
        extantionType === "workorder"
          ? { workorder_id, notify_engineer, message }
          : extantionType === "modernisation"
          ? { modernisation_id: workorder_id, notify_engineer, message }
          : null
      ),
    });
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

export const handle_update_cert_type = async (
  workorder_id: string,
  certificate_type: 1 | 2 | 3,
  extantionType: "workorder" | "modernisation",
  fetchOneWorkOrder: () => void
) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) {
    console.error("No token found");
    return;
  }
  try {
    const response = await fetch(
      `${baseUrl}/${extantionType}/update-${extantionType}-certificate-type`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(
          extantionType === "workorder"
            ? { workorder_id, certificate_type }
            : { modernisation_id: workorder_id, certificate_type }
        ),
      }
    );
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
  }
};

export const handleFileChange = async (
  dispatch: AppDispatch,
  workorder_id: string,
  fileType: "attachements" | "report" | "certificate" | "voucher",
  extantionType: "workorder" | "modernisation",
  file: File,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  fetchOneWorkOrder: () => void,
  fileInputRef?: React.RefObject<HTMLInputElement>,
  fileStatus?: 0 | 1 | 2 | 3
) => {
  if (file.size > 20 * 1024 * 1024) {
    alert(`${file.name} exceeds the 20MB limit.`);
  } else if (file.size <= 32 * 1024) {
    handle_files_with_one_chunk(
      dispatch,
      workorder_id,
      fileType,
      extantionType,
      file,
      setIsLoading,
      fetchOneWorkOrder,
      fileStatus
    );
  } else {
    const file_token = await generateFileToken(file);
    handle_chunck(
      dispatch,
      workorder_id,
      fileType,
      extantionType,
      file,
      file_token,
      setIsLoading,
      fetchOneWorkOrder,
      fileStatus
    );
  }

  // Reset the file input value to allow re-selection of the same file
  if (fileInputRef?.current) {
    fileInputRef.current.value = "";
  }
};

export const handle_open_or_close_returnVoucher = async (
  workorder_id: string,
  action: "close" | "open",
  extantionType: "modernisation" | "workorder",
  fetchOneWorkOrder: () => void,
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
      action === "close"
        ? `${baseUrl}/${extantionType}/submit-${extantionType}-return-voucher`
        : `${baseUrl}/${extantionType}/open-${extantionType}-return-voucher`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(
          extantionType === "workorder"
            ? { workorder: workorder_id }
            : extantionType === "modernisation"
            ? { modernisation: workorder_id }
            : null
        ),
      }
    );
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

export const EditAcceptenceStatus = async (
  id: string,
  requirement: boolean,
  type: "acceptance" | "return voucher",
  extantionType: "modernisation" | "workorder",
  fetchOneWorkOrder: () => void,
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
      type === "acceptance"
        ? `${baseUrl}/workorder/update-workorder-acceptence`
        : `${baseUrl}/${extantionType}/update-${extantionType}-return-voucher`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          ...(type === "acceptance"
            ? { require_acceptance: requirement }
            : { require_return_voucher: requirement }),
        }),
      }
    );

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

export const handle_Assignment_and_execute = async (
  workorder_id: string,
  endPointPah: string,
  method: "PUT" | "PATCH",
  extantionType: "modernisation" | "workorder",
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  fetchOneWorkOrder?: () => void,
  engineer_id?: number
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
      ? JSON.stringify(
          extantionType === "workorder"
            ? { workorder_id, engineer_id }
            : { modernisation_id: workorder_id, engineer_id }
        )
      : JSON.stringify(
          extantionType === "workorder"
            ? { workorder_id }
            : { modernisation_id: workorder_id }
        );
  try {
    const response = await fetch(`${baseUrl}/${extantionType}/${endPointPah}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: requestBody,
    });

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

export const handle_add_or_delete_mailedPerson = async (
  workorder_id: string,
  Email: string | number,
  mail_method: "add" | "delete",
  extantionType: "modernisation" | "workorder",
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
      `${baseUrl}/${extantionType}/update-${extantionType}-mails`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(
          extantionType === "workorder"
            ? { workorder_id, [mail_method]: [Email] }
            : { modernisation_id: workorder_id, [mail_method]: [Email] }
        ),
      }
    );
    if (response) {
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
