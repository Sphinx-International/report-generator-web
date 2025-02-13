const baseUrl = import.meta.env.VITE_BASE_URL;

export const downloadFile = async (
  fileId: number | undefined,
  type: "attachment" | "report" | "acceptance-certificate" | "return-voucher",
  fileName: string | undefined,
  extantionType: "workorder" | "modernisation" | "new-site" | "line-of-sight",
  onProgress: (progress: number) => void,
  onComplete: () => void
) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) {
    console.error("No token found");
    return;
  }
  console.log(
    `${baseUrl}/${extantionType}/download-${extantionType}-${type}/${fileId}`
  );
  try {
    const response = await fetch(
      `${baseUrl}/${extantionType}/download-${extantionType}-${type}/${fileId}`,
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

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("No reader found in the response");
    }

    const contentLength = response.headers.get("Content-Length");
    const total = contentLength ? parseInt(contentLength, 10) : 0;
    let receivedLength = 0;

    const chunks = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      chunks.push(value);
      receivedLength += value.length;
      onProgress((receivedLength / total) * 100);
    }

    const blob = new Blob(chunks);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = `${fileName}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);

    // Call onComplete to signal that download is complete
    onComplete();
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
  }
};
