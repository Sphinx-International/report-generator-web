const baseUrl = import.meta.env.VITE_BASE_URL;
import { AppDispatch } from "../Redux/store";
import { addUploadingFile,removeUploadingFile,updateFileProgress } from "../Redux/slices/uploadingFilesSlice";
  


export const upload_or_delete_workorder_files_for_attachements = async (
    workorder_id: string,
    file_id: number,
    method: "add" | "delete",
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
    fetchOneWorkOrder: () => void
  ) => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return;
    }

    const formData = new FormData();
    formData.append("workorder_id", workorder_id.toString());
    formData.append(`${method}`, file_id.toString()); 

    /*  for (const [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }  */
    try {
      const response = await fetch(`http://${baseUrl}/workorder/update-workorder-attachments`, {
        method: "PUT",
        headers: {
            Authorization: `Token ${token}`,
          },
        body: formData,
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


  export const upload_workorder_files = async (
    workorder_id: string,
    file_id: number,
    fileType: "report" | "certificate",
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
    fetchOneWorkOrder: () => void,
    fileStatus?:0| 1 | 2 | 3 ,
  ) => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return;
    }
    setIsLoading(true);
    
    try {
      const body = fileType === "certificate" 
        ? JSON.stringify({ workorder_id, file_id, certificate_type: fileStatus }) 
        : JSON.stringify({ workorder_id, file_id, auto_validate: fileStatus  });

        console.log(body)
      const response = await fetch(`http://${baseUrl}/workorder/upload-workorder-${fileType}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body, 
      });
  
      if (response) {
        switch (response.status) {
          case 200:
            fetchOneWorkOrder();
            break;
          case 400:
            console.log("Verify your data");
            break;
          default:
            console.log("Error");
            break;
        }
      }
    } catch (err) {
      console.error("Error submitting form", err);
    } finally {
      setIsLoading(false);
    }
  };


  const uploadRemainingChunks = async (
    dispatch: AppDispatch,
    file: File,
    fileType: "attachements" | "report" | "certificate",
    fileId: number,
    totalChunks: number,
    uploadedChunks?: number[]
  ) => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return;
    }

    const chunkSize = 512 * 1024; // 512 KB

    for (let index = uploadedChunks ? uploadedChunks.length + 1 : 1 ; index <= totalChunks; index++) {
      const start = index * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);

      const formData = new FormData();
      formData.append("index", index.toString());
      formData.append("file", chunk, `${file.name}.part`);

      try {
        const response = await fetch(
          `http://${baseUrl}/file/upload-rest-chunks/${fileId}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Token ${token}`,
            },
            body: formData,
          }
        );

        if (response.status === 200) {
          const progress = ((index + 1) / totalChunks) * 100;
          dispatch(updateFileProgress({ type: fileType, fileId, progress }));
        } else if (response.status === 201) {
          dispatch(updateFileProgress({ type: fileType, fileId, progress: 100.0 }));
          break;
        } else {
          console.error("Failed to upload chunk");
          break;
        }
      } catch (err) {
        console.error(`Error uploading chunk ${index + 1}:`, err);
        break;
      }
    }
  };

export const handle_chunck = async (
  dispatch: AppDispatch,  // Add dispatch as a parameter
  workorder_id: string,
  fileType: "attachements" |"report" |"certificate",
  file: File,
  file_token:string,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  fetchOneWorkOrder: () => void,
  fileStatus?: 0|1 | 2 | 3 
) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) {
    console.error("No token found");
    return;
  }
  const chunkSize = 512 * 1024; // 512 KB
  const fileSize = file.size; // File size in bytes

  const chunks = Math.ceil(fileSize / chunkSize);
  // Extract the first chunk
  const firstChunk = file.slice(0, chunkSize);
  const formData = new FormData();
  formData.append("name", file.name);
  formData.append("type", "1");
  formData.append("total_chunks", chunks.toString());
  formData.append("file", firstChunk, `${file.name}.part`);
  formData.append("file_token", file_token);



  console.log("FormData contents:");
  for (const pair of formData.entries()) {
    console.log(pair[0] + ':', pair[1]);
  }

  setIsLoading(true);

  try {
    const response = await fetch(`http://${baseUrl}/file/upload-first-chunk`, {
      method: "POST",
      headers: {
        Authorization: `Token ${token}`,
      },
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      const fileId = data.id;

      // here 
      dispatch(addUploadingFile({type:fileType,file:{ id: fileId, progress: 0, file }}))
      setIsLoading(false);
      if (fileType === "attachements") {
        upload_or_delete_workorder_files_for_attachements(workorder_id,fileId,"add",setIsLoading,fetchOneWorkOrder)
      } else {
        await upload_workorder_files(workorder_id,fileId,fileType,setIsLoading,fetchOneWorkOrder,fileStatus)

      }
      if (chunks > 1) {
        await uploadRemainingChunks( dispatch, file, fileType, fileId, chunks);
      }
      fetchOneWorkOrder()
      dispatch(removeUploadingFile({type:fileType,fileId}))

       
    } else {
      console.error("Failed to upload first chunk");
    }
  } catch (err) {
    console.error("Error submitting first chunk", err);
  } finally {
    setIsLoading(false);
  }
};

export const handle_resuming_upload = async (
  dispatch: AppDispatch, 
  fileId: number,
  file: File,
  fileType: "attachements" | "report" | "certificate",
  file_token: string,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  fetchFunc: () => void,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  enqueueSnackbar: (message: string, options?: any) => void // Add this parameter
) => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) {
    console.error("No token found");
    return;
  }

  setIsLoading(true);

  try {
    const response = await fetch(`http://${baseUrl}/file/request-resuming-upload/${fileId}`, {
      method: "PUT",
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ file_token })
    });

    switch (response.status) {
      case 200: {
        const data = await response.json();
        const { total, uploaded_chunks } = data;
  
        // Calculate progress
        const progress: number = Number(((uploaded_chunks[uploaded_chunks.length - 1] / total) * 100).toFixed(2));
  
        // Update the progress with the calculated value
        dispatch(addUploadingFile({
          type: fileType,
          file: { id: fileId, progress, file }
        }));
  
        console.log(data);
  
        await uploadRemainingChunks(dispatch, file, fileType, fileId, total, uploaded_chunks);
        fetchFunc();
        dispatch(removeUploadingFile({ type: fileType, fileId }));
        break;
      }

      case 406:
        enqueueSnackbar("It's not the same file. Please select the correct file!", {
          variant: 'error',
          autoHideDuration: 3000, // 3 seconds
        });
        break;

      default:
        break;
    }
  } catch (err) {
    console.error("Error submitting resume upload", err);
  } finally {
    setIsLoading(false);
  }
};


export const handle_files_with_one_chunk = async (
  dispatch: AppDispatch,  // Add dispatch as a parameter
  workorder_id: string,
  fileType: "attachements" |"report" |"certificate",
  file: File,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  fetchOneWorkOrder: () => void,
  fileStatus?: 0 |1 | 2 | 3 
) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) {
    console.error("No token found");
    return;
  }

  // Extract the first chunk
  const formData = new FormData();
  formData.append("name", file.name);
  formData.append("type", "1");
  formData.append("file", file);

 /* console.log("FormData contents:");
  for (const pair of formData.entries()) {
    console.log(pair[0] + ':', pair[1]);
  }*/

  setIsLoading(true);

  try {
    const response = await fetch(`http://${baseUrl}/file/upload-file`, {
      method: "POST",
      headers: {
        Authorization: `Token ${token}`,
      },
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      const fileId = data.id;

      // here 
      dispatch(addUploadingFile({type:fileType,file:{ id: fileId, progress: 0, file }}))
      setIsLoading(false);
      if (fileType === "attachements") {
        upload_or_delete_workorder_files_for_attachements(workorder_id,fileId,"add",setIsLoading,fetchOneWorkOrder)
      } else {
        await upload_workorder_files(workorder_id,fileId,fileType,setIsLoading,fetchOneWorkOrder,fileStatus)
      }
      fetchOneWorkOrder()
      dispatch(removeUploadingFile({type:fileType,fileId}))
       
    } else {
      console.error("Failed to upload file");
    }
  } catch (err) {
    console.error("Error submitting file", err);
  } finally {
    setIsLoading(false);
  }
};