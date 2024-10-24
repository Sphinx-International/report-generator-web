const baseUrl = import.meta.env.VITE_BASE_URL;

export const getWorkorderCount = async (
  trunc_by: 0 | 1 | 2 | 3 | 4 = 0,
  analytics_type: 0 | 1 | 2 | 3 | 4 | 5 | 6,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) {
    console.error("No token found");
    return;
  }
  setIsLoading(true);
  // Build query string parameters
  const queryParams = new URLSearchParams({
    trunc_by: trunc_by.toString(),
    analytics_type: analytics_type.toString(),
  });

  const url = `${baseUrl}/analytics/get-workorder-count?${queryParams.toString()}`;
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
      console.error("Error response text:", errorText || "No response body");
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Check for empty response body
    const responseBody = await response.text();
    if (!responseBody) {
      return {};
    }

    // Parse the response if not empty
    const data = JSON.parse(responseBody);
    return data;
  } catch (err) {
    console.error("Error:", err);
  } finally {
    setIsLoading(false);
  }
};

export const getUserPerformance = async (
  trunc_by: 0 | 1 | 2 | 3 | 4 = 0,
  userId: number,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) {
    console.error("No token found");
    return;
  }
  setIsLoading(true);
  const queryParams = new URLSearchParams({
    trunc_by: trunc_by.toString(),
    user: userId.toString(),
  });

  const url = `${baseUrl}/analytics/get-workorder-user-performance?${queryParams.toString()}`;
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
      console.error("Error response text:", errorText || "No response body");
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Check for empty response body
    const responseBody = await response.text();
    if (!responseBody) {
      return {};
    }

    // Parse the response if not empty
    const data = JSON.parse(responseBody);
    return data;
  } catch (err) {
    console.error("Error:", err);
  } finally {
    setIsLoading(false);
  }
};
