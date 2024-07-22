import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import { openDialog } from "../Redux/slices/dialogSlice";
import { AppDispatch } from "../Redux/store";
import { useParams } from "react-router-dom";
import WorkOrderStatus from "../components/WorkOrderStatus";
import WorkOrderpriority from "../components/WorkOrderPriorities";
import SideBar from "../components/SideBar";
import Header from "../components/Header";
import MissionPopup from "../components/MissionPopup";
import SuccessPopup from "../components/SuccessPopup";
import { ResOfOneMission } from "../assets/types/Mission";
const MissionDetails = () => {
  const { id } = useParams();

  const [visibleEngPopup, setVisibleEngPopup] = useState<boolean>(false);
  const [selectedEng, setSelectedEng] = useState<number>();
  const addTaskDialogRef = useRef<HTMLDialogElement>(null);
  const refuseTaskDialogRef = useRef<HTMLDialogElement>(null);
  const submitMissionDialogRef = useRef<HTMLDialogElement>(null);
  const [workorder, setWorkorder] = useState<ResOfOneMission | null>(null);

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const handlAddTaskButtonClick = () => {
    const dialog = addTaskDialogRef.current;
    if (dialog) {
      dialog.style.display = "flex";
      addTaskDialogRef.current?.showModal();
    }
  };
  const handlRefuseTaskButtonClick = () => {
    const dialog = refuseTaskDialogRef.current;
    if (dialog) {
      dialog.style.display = "flex";
      refuseTaskDialogRef.current?.showModal();
    }
  };
  const handlSubmitMissionButtonClick = () => {
    dispatch(openDialog());
    navigate("/missions");
  };

  const handleClickedEng = (eng: number) => {
    setSelectedEng(eng);
    setVisibleEngPopup(false);
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
        console.log(data);
      } catch (err) {
        console.error("Error: ", err);
      }
    };
    fetchOneWorkOrder();
  }, [id]);

  return (
    <div className="w-full flex h-[100vh]">
      <SideBar />
      <div className=" md:pt-[60px] pt-[20px] pr-[60px] pl-[36px] md:pb-[38px] flex flex-col gap-[58px] w-full h-full overflow-auto">
        <Header pageSentence="Here is workorder details" searchBar={false} />
        {workorder && (
          <div className="flex flex-col w-full gap-[31px] px-[25px] py-[32px] border-[1px] border-n400 rounded-[20px]">
            <div className="w-full flex justify-between items-start gap-[14px] pl-[6px]">
              <h1 className="text-primary font-semibold text-[24px] leading-[36px]">
                {workorder.workorder.title}
              </h1>
              <span className="text-primary font-semibold text-[24px] leading-[36px]">
                {workorder.workorder.id}
              </span>
            </div>
            <div className="w-full flex flex-col items-start gap-[12px]">
              <div className="flex items-center gap-[12px]">
                <img src="/avatar.png" alt="avatar" />
                <span className="text-[18px] text-n600 font-medium leading-[27px]">
                  Mariem Boukennouche
                </span>
              </div>
              <p className="text-[17px] text-n600 leading-[27px]">
                {workorder.workorder.description}
              </p>
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
            <div className="w-full flex flex-col items-start gap-[23px]">
              <div className="w-full flex flex-col gap-[6px]">
                <label
                  htmlFor="attachements"
                  className="text-[17px] text-n700 leading-[30px] font-medium"
                >
                  Attachements
                </label>
                <div className="w-full flex flex-col gap-[12px]">
                  {Array.from({ length: 2 }).map((_, index) => {
                    return (
                      <div
                        key={index}
                        className="w-[50%] flex items-center justify-between px-[12px] py-[8px] border-[1px] border-n400 rounded-[15px]"
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
                              {"Filename.pdf"}
                            </span>
                            <span className="text-[12px] leading-[20px] text-n600">
                              {"22.5 mb"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="w-full flex flex-col gap-[6px]">
                <label
                  htmlFor="attachements"
                  className="text-[17px] text-n700 leading-[30px] font-medium"
                >
                  Uploaded files
                </label>
                <div className="w-full flex flex-col gap-[12px]">
                  {Array.from({ length: 1 }).map((_, index) => {
                    return (
                      <div
                        key={index}
                        className="w-[50%] flex items-center justify-between px-[12px] py-[8px] border-[1px] border-n400 rounded-[15px]"
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
                              {"Filename.pdf"}
                            </span>
                            <span className="text-[12px] leading-[20px] text-n600">
                              {"22.5 mb"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="w-full flex flex-col gap-[6px]">
                <label
                  htmlFor="attachements"
                  className="text-[17px] text-n700 leading-[30px] font-medium"
                >
                  Acceptance certificat
                </label>
                <input
                  type="file"
                  name="attachement"
                  id="attachement"
                  className="hidden"
                />
                <label
                  htmlFor="attachement"
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
                    <span className="text-primary">chooses files</span>
                  </span>
                </label>
              </div>
            </div>
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
