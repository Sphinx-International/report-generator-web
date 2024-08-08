const baseUrl = import.meta.env.VITE_BASE_URL;


export const downloadFile = async (
    fileId: number | undefined,
    path: string,
    fileName: string | undefined
  ) => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return;
    }
    try {
      const response = await fetch(
        `http://${baseUrl}/workorder/${path}/${fileId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/octet-stream",
            Authorization: `Token ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `${fileName}`; // You can set the filename here
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }
  };