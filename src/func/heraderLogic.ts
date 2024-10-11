const baseUrl = import.meta.env.VITE_BASE_URL;
import { alertWorkorder } from "../assets/types/Mission";
import { Notification } from "../assets/types/Mails&Notifications";
import { AppDispatch } from "../Redux/store";
import { setCount, clearCount } from "../Redux/slices/notificationCountSlice";

export const fetchAlerts = async (
  setAlerts: React.Dispatch<React.SetStateAction<alertWorkorder[]>>
) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) {
    console.error("No token found");
    return;
  }

  const url = `${baseUrl}/workorder/get-workorder-certificate-alert`;
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
      setAlerts(data);
    } else {
      setAlerts([]);
    }
  } catch (err) {
    console.error("Error: ", err);
  }
};

export const fetchNotifications = async (
  offset: number,
  limit: number,
  dispatch: AppDispatch,
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>,
  setHasMore: React.Dispatch<React.SetStateAction<boolean>>, // New parameter to set if more notifications are available
  append: boolean = false // A flag to indicate if we should append the new data
) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) {
    console.error("No token found");
    return;
  }

  const url = `${baseUrl}/notification/get-notifications?offset=${offset}&limit=${limit}`;
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

    const responseText = await response.text();

    if (responseText) {
      const data = JSON.parse(responseText);
      dispatch(setCount(data.count));

      // If 'append' is true, append new notifications to the existing state
      setNotifications((prev) => (append ? [...prev, ...data.data] : data.data));

      // Check if there are more notifications to load
      setHasMore(data.current_offset < data.total);
    } else {
      setHasMore(false); // No more data to load
    }
  } catch (err) {
    console.error("Error: ", err);
  }
};


export const getActionNotificationTitle = (actionNumber: number): string => {
  const actionTitles: { [key: number]: string } = {
    100: "New account created",
    101: "Account updated",
    102: "Account deleted",
    200: "New mail created",
    201: "New group created",
    300: "New workorder created",
    301: "Workorder updated",
    302: "Workorder assigned",
    303: "Workorder drop assign",
    304: "Workorder executed",
    305: "Workorder report uploaded",
    306: "Workorder reported",
    307: "Workorder certificate uploaded",
    308: "Workorder accepted",
  };

  return actionTitles[actionNumber] || "Unknown action";
};
export const getActionNotificationDescription = (
  actionNumber: number
): string => {
  const actionDescriptions: { [key: number]: string } = {
    100: "A new account has been created",
    101: "An account has been updated",
    102: "An account has been deleted",
    200: "A new mail has been created",
    201: "A new group has been created",
    300: "A new work order has been created",
    301: "A work order has been updated",
    302: "A new mission has been assigned.",
    303: "A work order assignment has been dropped",
    304: "A work order has been executed",
    305: "A work order report has been uploaded",
    306: "A work order has been validated",
    307: "A work order certificate has been uploaded",
    308: "A work order has been accepted",
  };
  return (
    actionDescriptions[actionNumber] ||
    "No description available for this action."
  );
};
export const clearOneNotification = async (
  notification_id: number,
  refetchFunc: () => void
) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) {
    console.error("No token found");
    return;
  }

  const url = `${baseUrl}/notification/clear-notification/${notification_id}`;
  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response text: ", errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    } else {
      refetchFunc();
    }
  } catch (err) {
    console.error("Error: ", err);
  }
};

export const clearNotificationCount = async (dispatch: AppDispatch) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) {
    console.error("No token found");
    return;
  }
  const url = `${baseUrl}/notification/clear-notification-count`;
  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response text: ", errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    } else {
      dispatch(clearCount());
    }
  } catch (err) {
    console.error("Error: ", err);
  }
};
