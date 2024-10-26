/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useCallback } from "react";
import { useSnackbar, closeSnackbar } from "notistack";
import { Notification } from "../assets/types/Mails&Notifications";
import { getActionNotificationDescription } from "../func/heraderLogic";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../Redux/store";
import { addOneToCount } from "../Redux/slices/notificationCountSlice";
const baseUrl = import.meta.env.VITE_BASE_WS_URL;

interface UseWebSocketNotificationProps {
  endpointPath: string;
  setNotifications: React.Dispatch<React.SetStateAction<any>>;
}

const useWebSocketNotification = ({
  endpointPath,
  setNotifications,
}: UseWebSocketNotificationProps) => {
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<number>(0);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const dispatch = useDispatch<AppDispatch>();

  const handleNewNotification = (notification: Notification) => {
    // Define the URL or path based on the notification
    const path =
      notification.action >= 100 && notification.action < 200
        ? `edit-user/${notification.on}`
        : notification.action >= 200 && notification.action < 300
        ? "mails/groups"
        : `workorders/${notification.on}`;

    // Display the snackbar with a custom action button
    enqueueSnackbar(
      `${getActionNotificationDescription(notification.action)} on ${
        notification.on
      }`,
      {
        variant: "info",
        autoHideDuration: 3000,
        action: (key) => (
          <button
            style={{
              color: "white",
              backgroundColor: "blue",
              border: "none",
              padding: "6px 12px",
              cursor: "pointer",
            }}
            onClick={() => {
              navigate(`/${path}`); // Perform navigation on button click
              closeSnackbar(key); // Close the snackbar
            }}
          >
            View
          </button>
        ),
      }
    );

    // Update the notifications state
    setNotifications((prev: Notification[]) => [notification, ...prev]);
    dispatch(addOneToCount());
  };

  const connectWebSocket = useCallback(() => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return;
    }

    const url = `${baseUrl}/ws/${endpointPath}?token=${token}`;
    socketRef.current = new WebSocket(url);

    socketRef.current.onopen = () => {
      console.log("WebSocket connection opened");
      reconnectRef.current = 0; // Reset reconnection attempts on successful connection
    };

    socketRef.current.onmessage = (event) => {
      console.log("WebSocket message received");
      try {
        const notification = JSON.parse(event.data);
        handleNewNotification(notification);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setNotifications((prevNotifications: any) => [
          ...prevNotifications,
          notification,
        ]);
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
      }
    };

    socketRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      socketRef.current?.close(); // Close the socket on error to trigger reconnection
    };

    socketRef.current.onclose = (event) => {
      console.log("WebSocket connection closed", event.reason);
      attemptReconnection(); // Try to reconnect when the connection is closed
    };
  }, [endpointPath, setNotifications]);

  const attemptReconnection = useCallback(() => {
    if (reconnectRef.current < 5) {
      // Limit reconnection attempts
      const timeout = Math.min(1000 * 2 ** reconnectRef.current, 10000); // Exponential backoff (up to 10 seconds)
      reconnectRef.current += 1; // Increment reconnection attempts
      console.log("Attempting reconnection in", timeout, "ms");
      setTimeout(() => {
        connectWebSocket();
      }, timeout);
    } else {
      console.error("Max reconnection attempts reached");
    }
  }, [connectWebSocket]);

  useEffect(() => {
    connectWebSocket(); // Establish WebSocket connection on component mount

    return () => {
      if (socketRef.current) {
        socketRef.current.onclose = null; // Clear onclose handler
        socketRef.current.onerror = null; // Clear onerror handler
        socketRef.current.close(); // Clean up on unmount
      }
    };
  }, [connectWebSocket]);

  return null;
};

export default useWebSocketNotification;
