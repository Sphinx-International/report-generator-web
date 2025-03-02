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
      setNotifications((prev) =>
        append ? [...prev, ...data.data] : data.data
      );

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
    309: "Workorder update requested",
    310: "Workorder return voucher uploaded",
    311: "Workorder return voucher submitted",
    500: "Modernisation created",
    501: "Modernisation updated",
    502: "Modernisation assigned",
    503: "Modernisation drop assign",
    504: "Modernisation executed",
    505: "Modernisation report uploaded",
    506: "Modernisation reported",
    507: "Modernisation certificate uploaded",
    508: "Modernisation accepted",
    509: "Modernisation update requested",
    510: "Modernisation return voucher uploaded",
    511: "Modernisation return voucher submitted",
    700: "New site created",
    701: "New site updated",
    702: "New site assigned",
    703: "New site drop assign",
    704: "New site executed",
    705: "New site report uploaded",
    706: "New site reported",
    707: "New site certificate uploaded",
    708: "New site accepted",
    709: "New site update requested",
    1000: "LOS created",
    1001: "LOS updated",
    1002: "LOS assigned",
    1003: "LOS drop assign",
    1004: "LOS launched",
    1005: "LOS result added",
    1006: "LOS no access to near end",
    1007: "LOS near end access granted",
    1008: "LOS no access to alternatives",
    1009: "LOS far end access granted",
    1010: "LOS site accessible",
    1011: "LOS alternative executed",
    1012: "LOS report executed",
    1013: "LOS report generated",
    1014: "LOS certificate rejected",
    1015: "LOS approved",
    1016: "LOS update closed",
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
    300: "A new workorder has been created",
    301: "A workorder has been updated",
    302: "A new workorder has been assigned.",
    303: "A workorder assignment has been dropped",
    304: "A workorder has been executed",
    305: "A workorder report has been uploaded",
    306: "A workorder has been validated",
    307: "A workorder certificate has been uploaded",
    308: "A workorder has been accepted",
    309: "A workorder ask to update report",
    310: "A workorder return voucher has been uploaded",
    311: "A Workorder return voucher has been submitted",
    500: "A new modernisation has been created",
    501: "A modernisation has been updated",
    502: "A modernisation has been assigned",
    503: "A modernisation assignment has been dropped",
    504: "A modernisation has been executed",
    505: "A modernisation report has been uploaded",
    506: "A modernisation has been validated",
    507: "A modernisation certificate has been uploaded",
    508: "A modernisation has been accepted",
    509: "A modernisation ask to update report",
    510: "A modernisation return voucher has been uploaded",
    511: "A modernisation return voucher has been submitted",
    700: "New site has been created",
    701: "New site has been updated",
    702: "New site has been assigned",
    703: "New site assignment has been dropped",
    704: "New site has been executed",
    705: "New site report has been uploaded",
    706: "New site has been validated",
    707: "New site certificate has been uploaded",
    708: "New site has been accepted",
    709: "New site ask to update report",
    1000: "LOS has been created",
    1001: "LOS has been updated",
    1002: "LOS has been assigned",
    1003: "LOS assignment has been dropped",
    1004: "LOS has been launched",
    1005: "LOS result has been added",
    1006: "LOS has no access to near end",
    1007: "LOS has near end access granted",
    1008: "LOS has no access to alternatives",
    1009: "LOS has far end access granted",
    1010: "LOS has site accessible",
    1011: "LOS alternative has been executed",
    1012: "LOS report has been executed",
    1013: "LOS report has been generated",
    1014: "LOS certificate has been rejected",
    1015: "LOS has been approved",
    1016: "LOS has been update closed",
  };
  return (
    actionDescriptions[actionNumber] ||
    `No description available for this action. ${actionNumber}`
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
