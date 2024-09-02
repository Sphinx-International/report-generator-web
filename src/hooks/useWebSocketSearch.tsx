import { useEffect } from 'react';

const baseUrl = import.meta.env.VITE_BASE_WS_URL;

interface UseWebSocketSearchProps {
  searchQuery: string | null;
  endpointPath: string;
  setResults: React.Dispatch<React.SetStateAction<any>>;
  setLoader: React.Dispatch<React.SetStateAction<boolean>>;
}

const useWebSocketSearch = ({
  searchQuery,
  endpointPath,
  setResults,
  setLoader
}: UseWebSocketSearchProps) => {
  useEffect(() => {
    if (!searchQuery) {
      null
      setLoader(false);
      return;
    }

    setLoader(true);

    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      setLoader(false);
      return;
    }

    const url = `${baseUrl}/ws/${endpointPath}`;
    const socket = new WebSocket(url);

    socket.onopen = () => {
      console.log("WebSocket connection opened");
      const message = `search|${token}|${searchQuery}`;
      socket.send(message);
    };

    socket.onmessage = (event) => {
      console.log("WebSocket message received");
      try {
        const data = event.data;
        setResults(JSON.parse(data));
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
      } finally {
        setLoader(false);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [searchQuery, endpointPath, setResults, setLoader]);
};

export default useWebSocketSearch;
