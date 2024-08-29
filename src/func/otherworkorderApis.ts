const baseUrl = import.meta.env.VITE_BASE_URL;


export const handle_edit_or_reqUpdate_report = async (
    workorder_id: string,
    notify_engineer: boolean,
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
    fetchOneWorkOrder: () => void
  ) => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return;
    }
    setIsLoading(true);
     console.log(JSON.stringify({ workorder_id, notify_engineer }))
    try {
      const response = await fetch(
        `${baseUrl}/workorder/request-update`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({ workorder_id, notify_engineer }),
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
     console.log(JSON.stringify({ workorder_id, certificate_type }))
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
    } 
  };