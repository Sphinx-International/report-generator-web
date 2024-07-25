import { useState, useRef, useEffect, ChangeEvent } from "react";
import { useParams } from "react-router-dom";
import WorkOrderStatus from "../components/WorkOrderStatus";
import WorkOrderpriority from "../components/WorkOrderPriorities";
import SideBar from "../components/SideBar";
import Header from "../components/Header";
import MissionPopup from "../components/MissionPopup";
import SuccessPopup from "../components/SuccessPopup";
import { ResOfOneMission } from "../assets/types/Mission";
import { User } from "../assets/types/User";
import { RotatingLines } from "react-loader-spinner";
import { formatFileSize } from "../func/formatFileSize";
import io from "socket.io-client";

const MissionDetails = () => {
  const { id } = useParams();

  const [visibleEngPopup, setVisibleEngPopup] = useState<boolean>(false);
  const [selectedEng, setSelectedEng] = useState<User>();
  const [Users, setUsers] = useState<User[]>([]);
  const addTaskDialogRef = useRef<HTMLDialogElement>(null);
  const refuseTaskDialogRef = useRef<HTMLDialogElement>(null);
  const submitMissionDialogRef = useRef<HTMLDialogElement>(null);
  const [workorder, setWorkorder] = useState<ResOfOneMission | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [reportFile, setReportFile] = useState<File>();
  const [acceptenceFile, setAcceptenceFile] = useState<File>();
  const [searchQuery, setSearchQuery] = useState("");
  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>,
    setFile: React.Dispatch<React.SetStateAction<File | undefined>>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setFile(file);
    }
  };
  const handleAssignment = async (
    workorder_id: number,
    engineer_id: string
  ) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return;
    }
    console.log(JSON.stringify({ workorder_id, engineer_id }));
    try {
      const response = await fetch("/workorder/assign-workorder", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({ workorder_id, engineer_id }),
      });

      if (response) {
        const data = await response.json();
        console.log("Form submitted successfully", data);

        console.log(response.status);

        switch (response.status) {
          case 200:
            setVisibleEngPopup(false);
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
  const handleExecute = async (workorder_id: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return;
    }
    console.log(JSON.stringify({ workorder_id }));
    setIsLoading(true);
    try {
      const response = await fetch("/workorder/execute-workorder", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({ workorder_id }),
      });

      if (response) {
        const data = await response.json();
        console.log("Form submitted successfully", data);

        console.log(response.status);

        switch (response.status) {
          case 200:
            setVisibleEngPopup(false);
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
  const handleValidate = async (
    workorder_id: number,
    workorder_report: File
  ) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return;
    }
    const formData = new FormData();
    formData.append("workorder_id", workorder_id.toString());
    formData.append("workorder_report", workorder_report);

    for (const pair of formData.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }
    setIsLoading(true);
    try {
      const response = await fetch("/workorder/validate-workorder", {
        method: "PUT",
        headers: {
          Authorization: `Token ${token}`,
        },
        body: formData,
      });

      if (response) {
        const data = await response.json();
        console.log("Form submitted successfully", data);

        console.log(response.status);

        switch (response.status) {
          case 200:
            setVisibleEngPopup(false);
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
  const handleAcceptence = async (
    workorder_id: number,
    acceptenceFile: File
  ) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return;
    }
    const formData = new FormData();
    formData.append("workorder_id", workorder_id.toString());
    formData.append("acceptance_certificate", acceptenceFile);

    for (const pair of formData.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }
    setIsLoading(true);
    try {
      const response = await fetch("/workorder/accept-workorder", {
        method: "PUT",
        headers: {
          Authorization: `Token ${token}`,
        },
        body: formData,
      });

      if (response) {
        const data = await response.json();
        console.log("Form submitted successfully", data);

        console.log(response.status);

        switch (response.status) {
          case 200:
            setVisibleEngPopup(false);
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





  
  const downloadFile = async (
    attachmentId: number | undefined,
    path: string,
    fileName:string| undefined
  ) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return;
    }
    try {
      const response = await fetch(`/workorder/${path}/${attachmentId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/octet-stream",
          Authorization: `Token ${token}`,
        },
      });

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

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return;
    }

    const socket = io("http://localhost:5173", {
      path: "/ws/search-account",
      extraHeaders: {
        Authorization: `Token ${token}`,
      },
    });

    socket.on("connect", () => {
      console.log("WebSocket connection opened");
      socket.emit("search", `query=${searchQuery}`);
    });

    socket.on("message", (data) => {
      try {
        const parsedData = JSON.parse(data);
        console.log(parsedData);
        setUsers(parsedData.data);
      } catch (error) {
        console.error("Error parsing WebSocket message: ", error);
      }
    });

    socket.on("error", (error) => {
      console.error("WebSocket error: ", error);
    });

    socket.on("disconnect", () => {
      console.log("WebSocket connection closed");
    });

    return () => {
      if (socket.connected) {
        socket.disconnect();
      }
    };
  };

  useEffect(() => {
    const fetchOneWorkOrder = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }

      const url = `/workorder/get-workorder/${id}`;

      try {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
        });

        if (!response.ok) {
          const errorText = await response.text(); // Read the response body as text
          console.error("Error response text: ", errorText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        // console.log("Response data: ", data); // Log the data for debugging
        setWorkorder(data);
      } catch (err) {
        console.error("Error: ", err);
      }
    };
    fetchOneWorkOrder();
  }, [id, workorder]);
  return (
    <div className="w-full flex h-[100vh]">
      <SideBar />
      <div className=" md:pt-[60px] pt-[20px] pr-[60px] pl-[36px] md:pb-[38px] flex flex-col gap-[58px] w-full h-full overflow-auto">
        <Header pageSentence="Here is workorder details" searchBar={false} />
        {workorder && (
          <div className="flex flex-col items-end gap-[40px] w-full px-[25px] ">
            <div className="flex flex-col w-full gap-[31px] border-[1px] border-n400 rounded-[20px] px-[25px] py-[32px]">
              <div className="w-full flex justify-between items-start gap-[14px] pl-[6px]">
                <div className="flex items-center gap-[12px]">
                  <h1 className="text-primary font-semibold text-[24px] leading-[36px] ]">
                    {workorder.workorder.title}
                  </h1>
                  <h1 className="text-primary font-semibold text-[24px] leading-[36px] ]">
                    #{workorder.workorder.id}
                  </h1>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    className="cursor-pointer"
                  >
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M16.0909 4.06248C16.1622 4.17064 16.1939 4.30007 16.1808 4.42892C16.1677 4.55778 16.1105 4.67815 16.0189 4.76973L9.12418 11.6637C9.05364 11.7342 8.96564 11.7847 8.86918 11.81L5.99743 12.56C5.9025 12.5847 5.80275 12.5842 5.70807 12.5585C5.6134 12.5328 5.52709 12.4828 5.45772 12.4134C5.38835 12.3441 5.33833 12.2578 5.31262 12.1631C5.28692 12.0684 5.28642 11.9687 5.31118 11.8737L6.06118 9.00273C6.08307 8.91655 6.12437 8.83651 6.18193 8.76873L13.1022 1.85298C13.2076 1.74764 13.3506 1.68848 13.4997 1.68848C13.6487 1.68848 13.7917 1.74764 13.8972 1.85298L16.0189 3.97398C16.0458 4.00099 16.07 4.03064 16.0909 4.06248ZM14.8257 4.37148L13.4997 3.04623L7.11118 9.43473L6.64243 11.2295L8.43718 10.7607L14.8257 4.37148Z"
                      fill="#514F6E"
                      fill-opacity="0.75"
                    />
                    <path
                      d="M14.7302 12.8697C14.9352 11.1176 15.0006 9.35208 14.9259 7.58967C14.9243 7.54815 14.9313 7.50674 14.9464 7.46803C14.9615 7.42931 14.9844 7.39413 15.0137 7.36467L15.7517 6.62667C15.7718 6.60639 15.7974 6.59236 15.8254 6.58628C15.8533 6.58019 15.8824 6.58231 15.9092 6.59237C15.936 6.60243 15.9593 6.62 15.9763 6.64299C15.9933 6.66597 16.0034 6.69338 16.0052 6.72192C16.1441 8.81535 16.0914 10.9171 15.8477 13.0009C15.6707 14.5174 14.4527 15.7062 12.9429 15.8749C10.3219 16.1652 7.67692 16.1652 5.05593 15.8749C3.54693 15.7062 2.32818 14.5174 2.15118 13.0009C1.84023 10.3425 1.84023 7.65686 2.15118 4.99842C2.32818 3.48192 3.54618 2.29317 5.05593 2.12442C7.04521 1.90383 9.04948 1.8504 11.0477 1.96467C11.0763 1.96672 11.1037 1.97693 11.1267 1.99408C11.1496 2.01123 11.1672 2.0346 11.1773 2.06144C11.1874 2.08827 11.1896 2.11743 11.1837 2.14548C11.1777 2.17352 11.1638 2.19927 11.1437 2.21967L10.3989 2.96367C10.3698 2.99273 10.335 3.01551 10.2966 3.0306C10.2583 3.04569 10.2173 3.05278 10.1762 3.05142C8.50875 2.99474 6.8394 3.05866 5.18118 3.24267C4.69664 3.2963 4.24432 3.51171 3.8973 3.85411C3.55027 4.19651 3.32881 4.64589 3.26868 5.12967C2.96797 7.70091 2.96797 10.2984 3.26868 12.8697C3.32881 13.3535 3.55027 13.8028 3.8973 14.1452C4.24432 14.4876 4.69664 14.703 5.18118 14.7567C7.69743 15.0379 10.3014 15.0379 12.8184 14.7567C13.303 14.703 13.7553 14.4876 14.1023 14.1452C14.4493 13.8028 14.6701 13.3535 14.7302 12.8697Z"
                      fill="#514F6E"
                      fill-opacity="0.75"
                    />
                  </svg>
                </div>

                <div className="flex items-center gap-[8px]">
                  <WorkOrderStatus
                    status={workorder.workorder.status}
                    styles={{ fontSize: 13, px: 28, py: 9.5 }}
                  />
                  <WorkOrderpriority
                    priority={workorder.workorder.priority}
                    styles={{ fontSize: 13, px: 28, py: 9.5 }}
                  />
                </div>
              </div>
              <div className="w-full flex flex-col items-start gap-[12px]">
                {workorder.workorder.assigned_to !== null ? (
                  <div className="flex items-center gap-[12px]">
                    <img src="/avatar.png" alt="avatar" />
                    <span className="text-[18px] text-n600 font-medium leading-[27px]">
                      {workorder.workorder.assigned_to}
                    </span>
                  </div>
                ) : selectedEng ? (
                  <div className="relative flex items-center gap-[12px]">
                    <img
                      src="/avatar.png"
                      alt="avatar"
                      className=" rounded-[50%] w-[40px] cursor-pointer"
                      onClick={() => {
                        setVisibleEngPopup(true);
                        // fetchUsers();
                      }}
                    />
                    <span className="text-[17px] text-550 leading-[30px]">
                      {selectedEng.first_name} {selectedEng.last_name}
                    </span>
                    {visibleEngPopup && (
                      <div className="w-[400px] absolute bg-white rounded-[20px] rounded-tl-none shadow-lg p-[24px] flex flex-col gap-[21px] items-start top-10 left-4 ">
                        <div className=" relative w-full">
                          <input
                            type="search"
                            name=""
                            id=""
                            value={searchQuery}
                            onChange={(eo) => {
                              setSearchQuery(eo.target.value);
                              fetchUsers();
                            }}
                            className="w-full h-[38px] rounded-[19px] border-[1px] border-n300 shadow-md md:px-[35px] md:text-[13px] text-[11px]"
                            placeholder="Search"
                          />
                          <svg
                            className="absolute left-[14px] top-[50%] translate-y-[-50%]"
                            xmlns="http://www.w3.org/2000/svg"
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M11 2C15.97 2 20 6.03 20 11C20 15.97 15.97 20 11 20C6.03 20 2 15.97 2 11C2 7.5 4 4.46 6.93 2.97"
                              stroke="#6F6C8F"
                              stroke-width="1.5"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            />
                            <path
                              d="M19.07 20.97C19.6 22.57 20.81 22.73 21.74 21.33C22.6 20.05 22.04 19 20.5 19C19.35 19 18.71 19.89 19.07 20.97Z"
                              stroke="#6F6C8F"
                              stroke-width="1.5"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            />
                          </svg>
                        </div>
                        <div className="flex flex-col items-start gap-[12px] w-full">
                          <div className="flex items-center gap-[5px] w-full">
                            <span className="px-[9px] rounded-[50%] bg-[#EDEBFF] hover:bg-[#d5d4f0] cursor-pointer text-primary text-[21px] font-semibold">
                              +
                            </span>
                            <span className="text-[14px] text-n600">
                              Create new user
                            </span>
                          </div>
                          {Users.length !== 0 &&
                            Users.map((user, index) => {
                              return (
                                <div
                                  key={index}
                                  className="flex items-center gap-[5px] cursor-pointer w-full hover:bg-n300"
                                  onClick={() => {
                                    setSelectedEng(user);
                                    setVisibleEngPopup(false);
                                  }}
                                >
                                  <img
                                    src="/avatar.png"
                                    alt="avatar"
                                    className="w-[31px] rounded-[50%]"
                                  />
                                  <span className="text-[14px] text-n600">
                                    {user.first_name} {user.last_name}
                                  </span>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative flex items-center gap-[12px]">
                    <span
                      className="p-[10px] rounded-[50%] bg-[#EDEBFF] hover:bg-[#d5d4f0] cursor-pointer"
                      onClick={() => {
                        setVisibleEngPopup(true);
                        //fetchUsers();
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                      >
                        <path
                          d="M9.99935 3.33366C13.6752 3.33366 16.666 6.32449 16.666 10.0003C16.666 13.6762 13.6752 16.667 9.99935 16.667C6.32352 16.667 3.33268 13.6762 3.33268 10.0003C3.33268 6.32449 6.32352 3.33366 9.99935 3.33366ZM9.99935 1.66699C5.39685 1.66699 1.66602 5.39783 1.66602 10.0003C1.66602 14.6028 5.39685 18.3337 9.99935 18.3337C14.6018 18.3337 18.3327 14.6028 18.3327 10.0003C18.3327 5.39783 14.6018 1.66699 9.99935 1.66699ZM14.166 9.16699H10.8327V5.83366H9.16602V9.16699H5.83268V10.8337H9.16602V14.167H10.8327V10.8337H14.166V9.16699Z"
                          fill="#4A3AFF"
                        />
                      </svg>
                    </span>
                    <span className="text-[17px] text-550 leading-[30px]">
                      Assign user
                    </span>
                    {visibleEngPopup && (
                      <div className="w-[400px] absolute bg-white rounded-[20px] rounded-tl-none shadow-lg p-[24px] flex flex-col gap-[21px] items-start top-10 left-4 ">
                        <div className=" relative w-full">
                          <input
                            type="search"
                            name=""
                            id=""
                            value={searchQuery}
                            onChange={(eo) => {
                              setSearchQuery(eo.target.value);
                              fetchUsers();
                            }}
                            className="w-full h-[38px] rounded-[19px] border-[1px] border-n300 shadow-md md:px-[35px] md:text-[13px] text-[11px]"
                            placeholder="Search"
                          />
                          <svg
                            className="absolute left-[14px] top-[50%] translate-y-[-50%]"
                            xmlns="http://www.w3.org/2000/svg"
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M11 2C15.97 2 20 6.03 20 11C20 15.97 15.97 20 11 20C6.03 20 2 15.97 2 11C2 7.5 4 4.46 6.93 2.97"
                              stroke="#6F6C8F"
                              stroke-width="1.5"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            />
                            <path
                              d="M19.07 20.97C19.6 22.57 20.81 22.73 21.74 21.33C22.6 20.05 22.04 19 20.5 19C19.35 19 18.71 19.89 19.07 20.97Z"
                              stroke="#6F6C8F"
                              stroke-width="1.5"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            />
                          </svg>
                        </div>
                        <div className="flex flex-col items-start gap-[12px] w-full">
                          <div className="flex items-center gap-[5px] w-full">
                            <span className="px-[9px] rounded-[50%] bg-[#EDEBFF] hover:bg-[#d5d4f0] cursor-pointer text-primary text-[21px] font-semibold">
                              +
                            </span>
                            <span className="text-[14px] text-n600">
                              Create new user
                            </span>
                          </div>
                          {Users &&
                            Users.map((user, index) => {
                              return (
                                <div
                                  key={index}
                                  className="flex items-center gap-[5px] cursor-pointer w-full hover:bg-n300"
                                  onClick={() => {
                                    setSelectedEng(user);
                                    setVisibleEngPopup(false);
                                  }}
                                >
                                  <img
                                    src="/avatar.png"
                                    alt="avatar"
                                    className="w-[31px] rounded-[50%]"
                                  />
                                  <span className="text-[14px] text-n600">
                                    {user.first_name} {user.last_name}
                                  </span>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex flex-col items-start">
                  <span className="text-[17px] font-medium leading-[30px] text-n700 flex items-center gap-[6px]">
                    Description
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      fill="none"
                      className="cursor-pointer"
                    >
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M16.0909 4.06248C16.1622 4.17064 16.1939 4.30007 16.1808 4.42892C16.1677 4.55778 16.1105 4.67815 16.0189 4.76973L9.12418 11.6637C9.05364 11.7342 8.96564 11.7847 8.86918 11.81L5.99743 12.56C5.9025 12.5847 5.80275 12.5842 5.70807 12.5585C5.6134 12.5328 5.52709 12.4828 5.45772 12.4134C5.38835 12.3441 5.33833 12.2578 5.31262 12.1631C5.28692 12.0684 5.28642 11.9687 5.31118 11.8737L6.06118 9.00273C6.08307 8.91655 6.12437 8.83651 6.18193 8.76873L13.1022 1.85298C13.2076 1.74764 13.3506 1.68848 13.4997 1.68848C13.6487 1.68848 13.7917 1.74764 13.8972 1.85298L16.0189 3.97398C16.0458 4.00099 16.07 4.03064 16.0909 4.06248ZM14.8257 4.37148L13.4997 3.04623L7.11118 9.43473L6.64243 11.2295L8.43718 10.7607L14.8257 4.37148Z"
                        fill="#514F6E"
                        fill-opacity="0.75"
                      />
                      <path
                        d="M14.7302 12.8697C14.9352 11.1176 15.0006 9.35208 14.9259 7.58967C14.9243 7.54815 14.9313 7.50674 14.9464 7.46803C14.9615 7.42931 14.9844 7.39413 15.0137 7.36467L15.7517 6.62667C15.7718 6.60639 15.7974 6.59236 15.8254 6.58628C15.8533 6.58019 15.8824 6.58231 15.9092 6.59237C15.936 6.60243 15.9593 6.62 15.9763 6.64299C15.9933 6.66597 16.0034 6.69338 16.0052 6.72192C16.1441 8.81535 16.0914 10.9171 15.8477 13.0009C15.6707 14.5174 14.4527 15.7062 12.9429 15.8749C10.3219 16.1652 7.67692 16.1652 5.05593 15.8749C3.54693 15.7062 2.32818 14.5174 2.15118 13.0009C1.84023 10.3425 1.84023 7.65686 2.15118 4.99842C2.32818 3.48192 3.54618 2.29317 5.05593 2.12442C7.04521 1.90383 9.04948 1.8504 11.0477 1.96467C11.0763 1.96672 11.1037 1.97693 11.1267 1.99408C11.1496 2.01123 11.1672 2.0346 11.1773 2.06144C11.1874 2.08827 11.1896 2.11743 11.1837 2.14548C11.1777 2.17352 11.1638 2.19927 11.1437 2.21967L10.3989 2.96367C10.3698 2.99273 10.335 3.01551 10.2966 3.0306C10.2583 3.04569 10.2173 3.05278 10.1762 3.05142C8.50875 2.99474 6.8394 3.05866 5.18118 3.24267C4.69664 3.2963 4.24432 3.51171 3.8973 3.85411C3.55027 4.19651 3.32881 4.64589 3.26868 5.12967C2.96797 7.70091 2.96797 10.2984 3.26868 12.8697C3.32881 13.3535 3.55027 13.8028 3.8973 14.1452C4.24432 14.4876 4.69664 14.703 5.18118 14.7567C7.69743 15.0379 10.3014 15.0379 12.8184 14.7567C13.303 14.703 13.7553 14.4876 14.1023 14.1452C14.4493 13.8028 14.6701 13.3535 14.7302 12.8697Z"
                        fill="#514F6E"
                        fill-opacity="0.75"
                      />
                    </svg>
                  </span>
                  <p className="text-[17px] text-n600 leading-[27px]">
                    {workorder.workorder.description}
                  </p>
                </div>

                <div className="flex items-center gap-[4px]">
                  <span className="px-[11px] rounded-[50%] bg-[#EDEBFF] hover:bg-[#d5d4f0] cursor-pointer text-primary text-[26px] font-semibold">
                    +
                  </span>
                  {workorder.mail_to &&
                    workorder.mail_to.map((mail, index) => {
                      return (
                        <img
                          key={index}
                          src="/avatar1.png"
                          alt="avatar"
                          className="w-[40px] rounded-[50%]"
                        />
                      );
                    })}
                </div>
              </div>
              <div className="w-full flex flex-col items-start gap-[23px]">
                <div className="w-full flex flex-col gap-[6px]">
                  <label
                    htmlFor="attachements"
                    className="text-[17px] text-n700 leading-[30px] font-medium"
                  >
                    Attachements
                  </label>
                  <div className="w-full flex flex-col gap-[12px]">
                    {workorder.attachments.length > 0
                      ? workorder.attachments.map((attach, index) => {
                        return (
                            <div
                              key={index}
                              className="cursor-pointer w-[50%] flex items-center justify-between px-[12px] py-[8px] border-[1px] border-n400 rounded-[15px]"
                              onClick={() => {
                                downloadFile(
                                  attach.id,
                                  "download-workorder-attachment",
                                  attach.file_name
                                );
                              }}
                            >
                              <div className="flex items-center gap-[9px]">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="22"
                                  height="26"
                                  viewBox="0 0 22 26"
                                  fill="none"
                                >
                                  <path
                                    opacity="0.2"
                                    d="M20.375 6.33984V19.4648C20.375 19.7135 20.2762 19.9519 20.1004 20.1278C19.9246 20.3036 19.6861 20.4023 19.4375 20.4023H16.625V10.0898L11.9375 5.40234H5.375V2.58984C5.375 2.3412 5.47377 2.10275 5.64959 1.92693C5.8254 1.75112 6.06386 1.65234 6.3125 1.65234H15.6875L20.375 6.33984Z"
                                    fill="#6F6C8F"
                                  />
                                  <path
                                    d="M21.0383 5.67656L16.3508 0.989063C16.2637 0.902031 16.1602 0.833017 16.0464 0.785966C15.9326 0.738915 15.8107 0.714747 15.6875 0.714844H6.3125C5.81522 0.714844 5.33831 0.912388 4.98668 1.26402C4.63504 1.61565 4.4375 2.09256 4.4375 2.58984V4.46484H2.5625C2.06522 4.46484 1.58831 4.66239 1.23667 5.01402C0.885044 5.36565 0.6875 5.84256 0.6875 6.33984V23.2148C0.6875 23.7121 0.885044 24.189 1.23667 24.5407C1.58831 24.8923 2.06522 25.0898 2.5625 25.0898H15.6875C16.1848 25.0898 16.6617 24.8923 17.0133 24.5407C17.365 24.189 17.5625 23.7121 17.5625 23.2148V21.3398H19.4375C19.9348 21.3398 20.4117 21.1423 20.7633 20.7907C21.115 20.439 21.3125 19.9621 21.3125 19.4648V6.33984C21.3126 6.21669 21.2884 6.09473 21.2414 5.98092C21.1943 5.86711 21.1253 5.76369 21.0383 5.67656ZM15.6875 23.2148H2.5625V6.33984H11.5496L15.6875 10.4777V23.2148ZM19.4375 19.4648H17.5625V10.0898C17.5626 9.96669 17.5384 9.84473 17.4914 9.73092C17.4443 9.61711 17.3753 9.51369 17.2883 9.42656L12.6008 4.73906C12.5137 4.65203 12.4102 4.58302 12.2964 4.53597C12.1826 4.48891 12.0607 4.46475 11.9375 4.46484H6.3125V2.58984H15.2996L19.4375 6.72773V19.4648ZM12.875 15.7148C12.875 15.9635 12.7762 16.2019 12.6004 16.3778C12.4246 16.5536 12.1861 16.6523 11.9375 16.6523H6.3125C6.06386 16.6523 5.8254 16.5536 5.64959 16.3778C5.47377 16.2019 5.375 15.9635 5.375 15.7148C5.375 15.4662 5.47377 15.2277 5.64959 15.0519C5.8254 14.8761 6.06386 14.7773 6.3125 14.7773H11.9375C12.1861 14.7773 12.4246 14.8761 12.6004 15.0519C12.7762 15.2277 12.875 15.4662 12.875 15.7148ZM12.875 19.4648C12.875 19.7135 12.7762 19.9519 12.6004 20.1278C12.4246 20.3036 12.1861 20.4023 11.9375 20.4023H6.3125C6.06386 20.4023 5.8254 20.3036 5.64959 20.1278C5.47377 19.9519 5.375 19.7135 5.375 19.4648C5.375 19.2162 5.47377 18.9777 5.64959 18.8019C5.8254 18.6261 6.06386 18.5273 6.3125 18.5273H11.9375C12.1861 18.5273 12.4246 18.6261 12.6004 18.8019C12.7762 18.9777 12.875 19.2162 12.875 19.4648Z"
                                    fill="#6F6C8F"
                                  />
                                </svg>
                                <div className="flex flex-col items-start">
                                  <span className="text-[13px] font-medium leading-[20px] text-n600">
                                    {attach.file_name}
                                  </span>
                                  <span className="text-[12px] leading-[20px] text-n600">
                                    {"22.5 mb"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );  
                        })
                      : null}
                  </div>
                </div>

                {workorder.workorder.status > 1 && (
                  <>
                    <div className="w-full flex flex-col gap-[6px]">
                      <label
                        htmlFor="report"
                        className="text-[17px] text-n700 leading-[30px] font-medium"
                      >
                        Report
                      </label>
                      {workorder.report ? (
                        <div
                          className="cursor-pointer w-[50%] flex items-center justify-between px-[12px] py-[8px] border-[1px] border-n400 rounded-[15px]"
                          onClick={() => {
                            downloadFile(
                              workorder.report?.id,
                              "download-workorder-report",
                              workorder.report?.file_name
                            );
                          }}
                        >
                          <div className="flex items-center gap-[9px]">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="22"
                              height="26"
                              viewBox="0 0 22 26"
                              fill="none"
                            >
                              <path
                                opacity="0.2"
                                d="M20.375 6.33984V19.4648C20.375 19.7135 20.2762 19.9519 20.1004 20.1278C19.9246 20.3036 19.6861 20.4023 19.4375 20.4023H16.625V10.0898L11.9375 5.40234H5.375V2.58984C5.375 2.3412 5.47377 2.10275 5.64959 1.92693C5.8254 1.75112 6.06386 1.65234 6.3125 1.65234H15.6875L20.375 6.33984Z"
                                fill="#6F6C8F"
                              />
                              <path
                                d="M21.0383 5.67656L16.3508 0.989063C16.2637 0.902031 16.1602 0.833017 16.0464 0.785966C15.9326 0.738915 15.8107 0.714747 15.6875 0.714844H6.3125C5.81522 0.714844 5.33831 0.912388 4.98668 1.26402C4.63504 1.61565 4.4375 2.09256 4.4375 2.58984V4.46484H2.5625C2.06522 4.46484 1.58831 4.66239 1.23667 5.01402C0.885044 5.36565 0.6875 5.84256 0.6875 6.33984V23.2148C0.6875 23.7121 0.885044 24.189 1.23667 24.5407C1.58831 24.8923 2.06522 25.0898 2.5625 25.0898H15.6875C16.1848 25.0898 16.6617 24.8923 17.0133 24.5407C17.365 24.189 17.5625 23.7121 17.5625 23.2148V21.3398H19.4375C19.9348 21.3398 20.4117 21.1423 20.7633 20.7907C21.115 20.439 21.3125 19.9621 21.3125 19.4648V6.33984C21.3126 6.21669 21.2884 6.09473 21.2414 5.98092C21.1943 5.86711 21.1253 5.76369 21.0383 5.67656ZM15.6875 23.2148H2.5625V6.33984H11.5496L15.6875 10.4777V23.2148ZM19.4375 19.4648H17.5625V10.0898C17.5626 9.96669 17.5384 9.84473 17.4914 9.73092C17.4443 9.61711 17.3753 9.51369 17.2883 9.42656L12.6008 4.73906C12.5137 4.65203 12.4102 4.58302 12.2964 4.53597C12.1826 4.48891 12.0607 4.46475 11.9375 4.46484H6.3125V2.58984H15.2996L19.4375 6.72773V19.4648ZM12.875 15.7148C12.875 15.9635 12.7762 16.2019 12.6004 16.3778C12.4246 16.5536 12.1861 16.6523 11.9375 16.6523H6.3125C6.06386 16.6523 5.8254 16.5536 5.64959 16.3778C5.47377 16.2019 5.375 15.9635 5.375 15.7148C5.375 15.4662 5.47377 15.2277 5.64959 15.0519C5.8254 14.8761 6.06386 14.7773 6.3125 14.7773H11.9375C12.1861 14.7773 12.4246 14.8761 12.6004 15.0519C12.7762 15.2277 12.875 15.4662 12.875 15.7148ZM12.875 19.4648C12.875 19.7135 12.7762 19.9519 12.6004 20.1278C12.4246 20.3036 12.1861 20.4023 11.9375 20.4023H6.3125C6.06386 20.4023 5.8254 20.3036 5.64959 20.1278C5.47377 19.9519 5.375 19.7135 5.375 19.4648C5.375 19.2162 5.47377 18.9777 5.64959 18.8019C5.8254 18.6261 6.06386 18.5273 6.3125 18.5273H11.9375C12.1861 18.5273 12.4246 18.6261 12.6004 18.8019C12.7762 18.9777 12.875 19.2162 12.875 19.4648Z"
                                fill="#6F6C8F"
                              />
                            </svg>
                            <div className="flex flex-col items-start">
                              <span className="text-[13px] font-medium leading-[20px] text-n600">
                                {workorder.report.file_name}
                              </span>
                              <span className="text-[12px] leading-[20px] text-n600">
                                2 mb
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : reportFile ? (
                        <div className="w-[50%] flex items-center justify-between px-[12px] py-[8px] border-[1px] border-n400 rounded-[15px]">
                          <div className="flex items-center gap-[9px]">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="22"
                              height="26"
                              viewBox="0 0 22 26"
                              fill="none"
                            >
                              <path
                                opacity="0.2"
                                d="M20.375 6.33984V19.4648C20.375 19.7135 20.2762 19.9519 20.1004 20.1278C19.9246 20.3036 19.6861 20.4023 19.4375 20.4023H16.625V10.0898L11.9375 5.40234H5.375V2.58984C5.375 2.3412 5.47377 2.10275 5.64959 1.92693C5.8254 1.75112 6.06386 1.65234 6.3125 1.65234H15.6875L20.375 6.33984Z"
                                fill="#6F6C8F"
                              />
                              <path
                                d="M21.0383 5.67656L16.3508 0.989063C16.2637 0.902031 16.1602 0.833017 16.0464 0.785966C15.9326 0.738915 15.8107 0.714747 15.6875 0.714844H6.3125C5.81522 0.714844 5.33831 0.912388 4.98668 1.26402C4.63504 1.61565 4.4375 2.09256 4.4375 2.58984V4.46484H2.5625C2.06522 4.46484 1.58831 4.66239 1.23667 5.01402C0.885044 5.36565 0.6875 5.84256 0.6875 6.33984V23.2148C0.6875 23.7121 0.885044 24.189 1.23667 24.5407C1.58831 24.8923 2.06522 25.0898 2.5625 25.0898H15.6875C16.1848 25.0898 16.6617 24.8923 17.0133 24.5407C17.365 24.189 17.5625 23.7121 17.5625 23.2148V21.3398H19.4375C19.9348 21.3398 20.4117 21.1423 20.7633 20.7907C21.115 20.439 21.3125 19.9621 21.3125 19.4648V6.33984C21.3126 6.21669 21.2884 6.09473 21.2414 5.98092C21.1943 5.86711 21.1253 5.76369 21.0383 5.67656ZM15.6875 23.2148H2.5625V6.33984H11.5496L15.6875 10.4777V23.2148ZM19.4375 19.4648H17.5625V10.0898C17.5626 9.96669 17.5384 9.84473 17.4914 9.73092C17.4443 9.61711 17.3753 9.51369 17.2883 9.42656L12.6008 4.73906C12.5137 4.65203 12.4102 4.58302 12.2964 4.53597C12.1826 4.48891 12.0607 4.46475 11.9375 4.46484H6.3125V2.58984H15.2996L19.4375 6.72773V19.4648ZM12.875 15.7148C12.875 15.9635 12.7762 16.2019 12.6004 16.3778C12.4246 16.5536 12.1861 16.6523 11.9375 16.6523H6.3125C6.06386 16.6523 5.8254 16.5536 5.64959 16.3778C5.47377 16.2019 5.375 15.9635 5.375 15.7148C5.375 15.4662 5.47377 15.2277 5.64959 15.0519C5.8254 14.8761 6.06386 14.7773 6.3125 14.7773H11.9375C12.1861 14.7773 12.4246 14.8761 12.6004 15.0519C12.7762 15.2277 12.875 15.4662 12.875 15.7148ZM12.875 19.4648C12.875 19.7135 12.7762 19.9519 12.6004 20.1278C12.4246 20.3036 12.1861 20.4023 11.9375 20.4023H6.3125C6.06386 20.4023 5.8254 20.3036 5.64959 20.1278C5.47377 19.9519 5.375 19.7135 5.375 19.4648C5.375 19.2162 5.47377 18.9777 5.64959 18.8019C5.8254 18.6261 6.06386 18.5273 6.3125 18.5273H11.9375C12.1861 18.5273 12.4246 18.6261 12.6004 18.8019C12.7762 18.9777 12.875 19.2162 12.875 19.4648Z"
                                fill="#6F6C8F"
                              />
                            </svg>
                            <div className="flex flex-col items-start">
                              <span className="text-[13px] font-medium leading-[20px] text-n600">
                                {reportFile.name}
                              </span>
                              <span className="text-[12px] leading-[20px] text-n600">
                                {formatFileSize(reportFile.size)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-start gap-[8px] w-[100%]">
                          <input
                            type="file"
                            name="report"
                            id="report"
                            onChange={(e) => {
                              handleFileChange(e, setReportFile);
                            }}
                            className="hidden"
                          />
                          <label
                            htmlFor="report"
                            className="cursor-pointer w-full py-[40px] flex flex-col items-center justify-center gap-[21.5px] border-dashed border-[2px] border-n400 rounded-[15px]"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="18"
                              height="22"
                              viewBox="0 0 18 22"
                              fill="none"
                            >
                              <path
                                opacity="0.2"
                                d="M17.125 4.91406V16.2891C17.125 16.5046 17.0394 16.7112 16.887 16.8636C16.7347 17.016 16.528 17.1016 16.3125 17.1016H13.875V8.16406L9.8125 4.10156H4.125V1.66406C4.125 1.44857 4.2106 1.24191 4.36298 1.08954C4.51535 0.937165 4.72201 0.851562 4.9375 0.851562H13.0625L17.125 4.91406Z"
                                fill="#6F6C8F"
                              />
                              <path
                                d="M17.6998 4.33922L13.6373 0.276719C13.5618 0.201291 13.4722 0.14148 13.3736 0.100702C13.2749 0.0599241 13.1692 0.0389788 13.0625 0.0390628H4.9375C4.50652 0.0390628 4.0932 0.210268 3.78845 0.515014C3.48371 0.819761 3.3125 1.23309 3.3125 1.66406V3.28906H1.6875C1.25652 3.28906 0.843198 3.46027 0.538451 3.76501C0.233705 4.06976 0.0625 4.48309 0.0625 4.91406V19.5391C0.0625 19.97 0.233705 20.3834 0.538451 20.6881C0.843198 20.9929 1.25652 21.1641 1.6875 21.1641H13.0625C13.4935 21.1641 13.9068 20.9929 14.2115 20.6881C14.5163 20.3834 14.6875 19.97 14.6875 19.5391V17.9141H16.3125C16.7435 17.9141 17.1568 17.7429 17.4615 17.4381C17.7663 17.1334 17.9375 16.72 17.9375 16.2891V4.91406C17.9376 4.80733 17.9166 4.70163 17.8759 4.603C17.8351 4.50436 17.7753 4.41473 17.6998 4.33922ZM13.0625 19.5391H1.6875V4.91406H9.47633L13.0625 8.50023V19.5391ZM16.3125 16.2891H14.6875V8.16406C14.6876 8.05733 14.6666 7.95163 14.6259 7.853C14.5851 7.75436 14.5253 7.66473 14.4498 7.58922L10.3873 3.52672C10.3118 3.45129 10.2222 3.39148 10.1236 3.3507C10.0249 3.30992 9.91923 3.28898 9.8125 3.28906H4.9375V1.66406H12.7263L16.3125 5.25023V16.2891ZM10.625 13.0391C10.625 13.2546 10.5394 13.4612 10.387 13.6136C10.2347 13.766 10.028 13.8516 9.8125 13.8516H4.9375C4.72201 13.8516 4.51535 13.766 4.36298 13.6136C4.2106 13.4612 4.125 13.2546 4.125 13.0391C4.125 12.8236 4.2106 12.6169 4.36298 12.4645C4.51535 12.3122 4.72201 12.2266 4.9375 12.2266H9.8125C10.028 12.2266 10.2347 12.3122 10.387 12.4645C10.5394 12.6169 10.625 12.8236 10.625 13.0391ZM10.625 16.2891C10.625 16.5046 10.5394 16.7112 10.387 16.8636C10.2347 17.016 10.028 17.1016 9.8125 17.1016H4.9375C4.72201 17.1016 4.51535 17.016 4.36298 16.8636C4.2106 16.7112 4.125 16.5046 4.125 16.2891C4.125 16.0736 4.2106 15.8669 4.36298 15.7145C4.51535 15.5622 4.72201 15.4766 4.9375 15.4766H9.8125C10.028 15.4766 10.2347 15.5622 10.387 15.7145C10.5394 15.8669 10.625 16.0736 10.625 16.2891Z"
                                fill="#6F6C8F"
                              />
                            </svg>
                            <span className="text-[13px] text-n600 font-medium leading-[13px]">
                              Drag & drop your files here or{" "}
                              <span className="text-primary">
                                chooses files
                              </span>
                            </span>
                          </label>
                        </div>
                      )}
                    </div>
                    {workorder.workorder.status > 2 &&
                      workorder.workorder.require_acceptence && (
                        <div className="w-full flex flex-col gap-[6px]">
                          <label
                            htmlFor="acceptence"
                            className="text-[17px] text-n700 leading-[30px] font-medium"
                          >
                            Acceptance certificat
                          </label>
                          {workorder.acceptance_certificate ? (
                            <div
                              className="cursor-pointer w-[50%] flex items-center justify-between px-[12px] py-[8px] border-[1px] border-n400 rounded-[15px]"
                              onClick={() => {
                                downloadFile(
                                  workorder.acceptance_certificate?.id,
                                  "download-workorder-acceptance-certificate",
                                  workorder.acceptance_certificate?.file_name
                                );
                              }}
                            >
                              <div className="flex items-center gap-[9px]">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="22"
                                  height="26"
                                  viewBox="0 0 22 26"
                                  fill="none"
                                >
                                  <path
                                    opacity="0.2"
                                    d="M20.375 6.33984V19.4648C20.375 19.7135 20.2762 19.9519 20.1004 20.1278C19.9246 20.3036 19.6861 20.4023 19.4375 20.4023H16.625V10.0898L11.9375 5.40234H5.375V2.58984C5.375 2.3412 5.47377 2.10275 5.64959 1.92693C5.8254 1.75112 6.06386 1.65234 6.3125 1.65234H15.6875L20.375 6.33984Z"
                                    fill="#6F6C8F"
                                  />
                                  <path
                                    d="M21.0383 5.67656L16.3508 0.989063C16.2637 0.902031 16.1602 0.833017 16.0464 0.785966C15.9326 0.738915 15.8107 0.714747 15.6875 0.714844H6.3125C5.81522 0.714844 5.33831 0.912388 4.98668 1.26402C4.63504 1.61565 4.4375 2.09256 4.4375 2.58984V4.46484H2.5625C2.06522 4.46484 1.58831 4.66239 1.23667 5.01402C0.885044 5.36565 0.6875 5.84256 0.6875 6.33984V23.2148C0.6875 23.7121 0.885044 24.189 1.23667 24.5407C1.58831 24.8923 2.06522 25.0898 2.5625 25.0898H15.6875C16.1848 25.0898 16.6617 24.8923 17.0133 24.5407C17.365 24.189 17.5625 23.7121 17.5625 23.2148V21.3398H19.4375C19.9348 21.3398 20.4117 21.1423 20.7633 20.7907C21.115 20.439 21.3125 19.9621 21.3125 19.4648V6.33984C21.3126 6.21669 21.2884 6.09473 21.2414 5.98092C21.1943 5.86711 21.1253 5.76369 21.0383 5.67656ZM15.6875 23.2148H2.5625V6.33984H11.5496L15.6875 10.4777V23.2148ZM19.4375 19.4648H17.5625V10.0898C17.5626 9.96669 17.5384 9.84473 17.4914 9.73092C17.4443 9.61711 17.3753 9.51369 17.2883 9.42656L12.6008 4.73906C12.5137 4.65203 12.4102 4.58302 12.2964 4.53597C12.1826 4.48891 12.0607 4.46475 11.9375 4.46484H6.3125V2.58984H15.2996L19.4375 6.72773V19.4648ZM12.875 15.7148C12.875 15.9635 12.7762 16.2019 12.6004 16.3778C12.4246 16.5536 12.1861 16.6523 11.9375 16.6523H6.3125C6.06386 16.6523 5.8254 16.5536 5.64959 16.3778C5.47377 16.2019 5.375 15.9635 5.375 15.7148C5.375 15.4662 5.47377 15.2277 5.64959 15.0519C5.8254 14.8761 6.06386 14.7773 6.3125 14.7773H11.9375C12.1861 14.7773 12.4246 14.8761 12.6004 15.0519C12.7762 15.2277 12.875 15.4662 12.875 15.7148ZM12.875 19.4648C12.875 19.7135 12.7762 19.9519 12.6004 20.1278C12.4246 20.3036 12.1861 20.4023 11.9375 20.4023H6.3125C6.06386 20.4023 5.8254 20.3036 5.64959 20.1278C5.47377 19.9519 5.375 19.7135 5.375 19.4648C5.375 19.2162 5.47377 18.9777 5.64959 18.8019C5.8254 18.6261 6.06386 18.5273 6.3125 18.5273H11.9375C12.1861 18.5273 12.4246 18.6261 12.6004 18.8019C12.7762 18.9777 12.875 19.2162 12.875 19.4648Z"
                                    fill="#6F6C8F"
                                  />
                                </svg>
                                <div className="flex flex-col items-start">
                                  <span className="text-[13px] font-medium leading-[20px] text-n600">
                                    {workorder.acceptance_certificate.file_name}
                                  </span>
                                  <span className="text-[12px] leading-[20px] text-n600">
                                    2 mb
                                  </span>
                                </div>
                              </div>
                            </div>
                          ) : acceptenceFile ? (
                            <div className="w-[50%] flex items-center justify-between px-[12px] py-[8px] border-[1px] border-n400 rounded-[15px]">
                              <div className="flex items-center gap-[9px]">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="22"
                                  height="26"
                                  viewBox="0 0 22 26"
                                  fill="none"
                                >
                                  <path
                                    opacity="0.2"
                                    d="M20.375 6.33984V19.4648C20.375 19.7135 20.2762 19.9519 20.1004 20.1278C19.9246 20.3036 19.6861 20.4023 19.4375 20.4023H16.625V10.0898L11.9375 5.40234H5.375V2.58984C5.375 2.3412 5.47377 2.10275 5.64959 1.92693C5.8254 1.75112 6.06386 1.65234 6.3125 1.65234H15.6875L20.375 6.33984Z"
                                    fill="#6F6C8F"
                                  />
                                  <path
                                    d="M21.0383 5.67656L16.3508 0.989063C16.2637 0.902031 16.1602 0.833017 16.0464 0.785966C15.9326 0.738915 15.8107 0.714747 15.6875 0.714844H6.3125C5.81522 0.714844 5.33831 0.912388 4.98668 1.26402C4.63504 1.61565 4.4375 2.09256 4.4375 2.58984V4.46484H2.5625C2.06522 4.46484 1.58831 4.66239 1.23667 5.01402C0.885044 5.36565 0.6875 5.84256 0.6875 6.33984V23.2148C0.6875 23.7121 0.885044 24.189 1.23667 24.5407C1.58831 24.8923 2.06522 25.0898 2.5625 25.0898H15.6875C16.1848 25.0898 16.6617 24.8923 17.0133 24.5407C17.365 24.189 17.5625 23.7121 17.5625 23.2148V21.3398H19.4375C19.9348 21.3398 20.4117 21.1423 20.7633 20.7907C21.115 20.439 21.3125 19.9621 21.3125 19.4648V6.33984C21.3126 6.21669 21.2884 6.09473 21.2414 5.98092C21.1943 5.86711 21.1253 5.76369 21.0383 5.67656ZM15.6875 23.2148H2.5625V6.33984H11.5496L15.6875 10.4777V23.2148ZM19.4375 19.4648H17.5625V10.0898C17.5626 9.96669 17.5384 9.84473 17.4914 9.73092C17.4443 9.61711 17.3753 9.51369 17.2883 9.42656L12.6008 4.73906C12.5137 4.65203 12.4102 4.58302 12.2964 4.53597C12.1826 4.48891 12.0607 4.46475 11.9375 4.46484H6.3125V2.58984H15.2996L19.4375 6.72773V19.4648ZM12.875 15.7148C12.875 15.9635 12.7762 16.2019 12.6004 16.3778C12.4246 16.5536 12.1861 16.6523 11.9375 16.6523H6.3125C6.06386 16.6523 5.8254 16.5536 5.64959 16.3778C5.47377 16.2019 5.375 15.9635 5.375 15.7148C5.375 15.4662 5.47377 15.2277 5.64959 15.0519C5.8254 14.8761 6.06386 14.7773 6.3125 14.7773H11.9375C12.1861 14.7773 12.4246 14.8761 12.6004 15.0519C12.7762 15.2277 12.875 15.4662 12.875 15.7148ZM12.875 19.4648C12.875 19.7135 12.7762 19.9519 12.6004 20.1278C12.4246 20.3036 12.1861 20.4023 11.9375 20.4023H6.3125C6.06386 20.4023 5.8254 20.3036 5.64959 20.1278C5.47377 19.9519 5.375 19.7135 5.375 19.4648C5.375 19.2162 5.47377 18.9777 5.64959 18.8019C5.8254 18.6261 6.06386 18.5273 6.3125 18.5273H11.9375C12.1861 18.5273 12.4246 18.6261 12.6004 18.8019C12.7762 18.9777 12.875 19.2162 12.875 19.4648Z"
                                    fill="#6F6C8F"
                                  />
                                </svg>
                                <div className="flex flex-col items-start">
                                  <span className="text-[13px] font-medium leading-[20px] text-n600">
                                    {acceptenceFile.name}
                                  </span>
                                  <span className="text-[12px] leading-[20px] text-n600">
                                    {formatFileSize(acceptenceFile.size)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <>
                              {" "}
                              <input
                                type="file"
                                name="acceptence"
                                id="acceptence"
                                className="hidden"
                                onChange={(e) => {
                                  handleFileChange(e, setAcceptenceFile);
                                }}
                              />
                              <label
                                htmlFor="acceptence"
                                className="cursor-pointer w-full py-[40px] flex flex-col items-center justify-center gap-[21.5px] border-dashed border-[2px] border-n400 rounded-[15px]"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="18"
                                  height="22"
                                  viewBox="0 0 18 22"
                                  fill="none"
                                >
                                  <path
                                    opacity="0.2"
                                    d="M17.125 4.91406V16.2891C17.125 16.5046 17.0394 16.7112 16.887 16.8636C16.7347 17.016 16.528 17.1016 16.3125 17.1016H13.875V8.16406L9.8125 4.10156H4.125V1.66406C4.125 1.44857 4.2106 1.24191 4.36298 1.08954C4.51535 0.937165 4.72201 0.851562 4.9375 0.851562H13.0625L17.125 4.91406Z"
                                    fill="#6F6C8F"
                                  />
                                  <path
                                    d="M17.6998 4.33922L13.6373 0.276719C13.5618 0.201291 13.4722 0.14148 13.3736 0.100702C13.2749 0.0599241 13.1692 0.0389788 13.0625 0.0390628H4.9375C4.50652 0.0390628 4.0932 0.210268 3.78845 0.515014C3.48371 0.819761 3.3125 1.23309 3.3125 1.66406V3.28906H1.6875C1.25652 3.28906 0.843198 3.46027 0.538451 3.76501C0.233705 4.06976 0.0625 4.48309 0.0625 4.91406V19.5391C0.0625 19.97 0.233705 20.3834 0.538451 20.6881C0.843198 20.9929 1.25652 21.1641 1.6875 21.1641H13.0625C13.4935 21.1641 13.9068 20.9929 14.2115 20.6881C14.5163 20.3834 14.6875 19.97 14.6875 19.5391V17.9141H16.3125C16.7435 17.9141 17.1568 17.7429 17.4615 17.4381C17.7663 17.1334 17.9375 16.72 17.9375 16.2891V4.91406C17.9376 4.80733 17.9166 4.70163 17.8759 4.603C17.8351 4.50436 17.7753 4.41473 17.6998 4.33922ZM13.0625 19.5391H1.6875V4.91406H9.47633L13.0625 8.50023V19.5391ZM16.3125 16.2891H14.6875V8.16406C14.6876 8.05733 14.6666 7.95163 14.6259 7.853C14.5851 7.75436 14.5253 7.66473 14.4498 7.58922L10.3873 3.52672C10.3118 3.45129 10.2222 3.39148 10.1236 3.3507C10.0249 3.30992 9.91923 3.28898 9.8125 3.28906H4.9375V1.66406H12.7263L16.3125 5.25023V16.2891ZM10.625 13.0391C10.625 13.2546 10.5394 13.4612 10.387 13.6136C10.2347 13.766 10.028 13.8516 9.8125 13.8516H4.9375C4.72201 13.8516 4.51535 13.766 4.36298 13.6136C4.2106 13.4612 4.125 13.2546 4.125 13.0391C4.125 12.8236 4.2106 12.6169 4.36298 12.4645C4.51535 12.3122 4.72201 12.2266 4.9375 12.2266H9.8125C10.028 12.2266 10.2347 12.3122 10.387 12.4645C10.5394 12.6169 10.625 12.8236 10.625 13.0391ZM10.625 16.2891C10.625 16.5046 10.5394 16.7112 10.387 16.8636C10.2347 17.016 10.028 17.1016 9.8125 17.1016H4.9375C4.72201 17.1016 4.51535 17.016 4.36298 16.8636C4.2106 16.7112 4.125 16.5046 4.125 16.2891C4.125 16.0736 4.2106 15.8669 4.36298 15.7145C4.51535 15.5622 4.72201 15.4766 4.9375 15.4766H9.8125C10.028 15.4766 10.2347 15.5622 10.387 15.7145C10.5394 15.8669 10.625 16.0736 10.625 16.2891Z"
                                    fill="#6F6C8F"
                                  />
                                </svg>
                                <span className="text-[13px] text-n600 font-medium leading-[13px]">
                                  Drag & drop your files here or{" "}
                                  <span className="text-primary">
                                    chooses files
                                  </span>
                                </span>
                              </label>
                            </>
                          )}
                        </div>
                      )}
                  </>
                )}
              </div>
            </div>
            {workorder.workorder.status === 0 ? (
              <button
                className={`py-[12px] px-[48px] rounded-[30px] ${
                  selectedEng
                    ? "text-primary border-primary"
                    : "text-n400 border-n400"
                } border-[2px]  leading-[20px] font-semibold text-[14px]`}
                disabled={selectedEng ? false : true}
                onClick={() => {
                  handleAssignment(workorder.workorder.id, selectedEng!.email);
                }}
              >
                Assign
              </button>
            ) : workorder.workorder.status > 0 ? (
              <button
                className={`py-[12px] px-[48px] rounded-[30px]  text-white  border-[2px] leading-[20px] font-semibold text-[14px] ${
                  (workorder.workorder.status === 2 &&
                    reportFile === undefined) ||
                  (workorder.workorder.status === 3 &&
                    acceptenceFile === undefined)
                    ? "bg-n400"
                    : "bg-primary"
                }`}
                disabled={
                  workorder.workorder.status === 2 && reportFile === undefined
                    ? true
                    : false
                }
                onClick={() => {
                  workorder.workorder.status === 1
                    ? handleExecute(workorder.workorder.id)
                    : workorder.workorder.status === 2
                    ? handleValidate(workorder.workorder.id, reportFile!)
                    : workorder.workorder.status === 3
                    ? handleAcceptence(workorder.workorder.id, acceptenceFile!)
                    : null;
                }}
              >
                {isLoading ? (
                  <RotatingLines
                    visible={true}
                    width="20"
                    strokeWidth="3"
                    strokeColor="white"
                  />
                ) : workorder.workorder.status === 1 ? (
                  "Execute"
                ) : workorder.workorder.status === 2 ? (
                  "Validate"
                ) : workorder.workorder.status === 3 ? (
                  "Accepted"
                ) : workorder.workorder.status === 4 ? (
                  "Close"
                ) : null}
              </button>
            ) : (
              ""
            )}
          </div>
        )}
      </div>
      <MissionPopup
        ref={addTaskDialogRef}
        title={false}
        textAreaTitle="Instruction"
        textAreaPlaceholder="instruction"
      />
      <MissionPopup
        ref={refuseTaskDialogRef}
        title={false}
        textAreaTitle="Comment"
        textAreaPlaceholder="Add a comment"
      />
      <SuccessPopup ref={submitMissionDialogRef} />
    </div>
  );
};

export default MissionDetails;
