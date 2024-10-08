const baseUrl = import.meta.env.VITE_BASE_URL;
import { handle_files_with_one_chunk, handle_chunck } from "./chunkUpload";
import { generateFileToken } from "./generateFileToken";
import { AppDispatch } from "../Redux/store";

export const handle_edit_or_reqUpdate_report = async (
  workorder_id: string,
  notify_engineer: boolean,
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
    const response = await fetch(`${baseUrl}/workorder/request-update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify({ workorder_id, notify_engineer, message }),
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
      `${baseUrl}/workorder/update-workorder-certificate-type`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({ workorder_id, certificate_type }),
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
  file: File,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  fetchOneWorkOrder: () => void,
  fileInputRef?: React.RefObject<HTMLInputElement>,
  fileStatus?: 0 | 1 | 2 | 3
) => {
  if (file.size > 20 * 1024 * 1024) {
    alert(`${file.name} exceeds the 20MB limit.`);
  } else if (file.size <= 512 * 1024) {
    handle_files_with_one_chunk(
      dispatch,
      workorder_id,
      fileType,
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
        ? `${baseUrl}/workorder/submit-workorder-return-voucher`
        : `${baseUrl}/workorder/open-workorder-return-voucher`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({ workorder: workorder_id }),
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
