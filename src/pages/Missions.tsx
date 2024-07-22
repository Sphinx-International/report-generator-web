import { useRef, useEffect, useState } from "react";
import SideBar from "../components/SideBar";
import Header from "../components/Header";
import Main from "../components/Main";
import Pagination from "../components/Pagination";
import MissionPopup from "../components/MissionPopup";
import SuccessPopup from "../components/SuccessPopup";
import WorkOrderStatus from "../components/WorkOrderStatus";
import WorkOrderpriority from "../components/WorkOrderPriorities";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../Redux/store";
import { ResMission } from "../assets/types/Mission";
const Missions = () => {
  const navigate = useNavigate();

  const missionDialogRef = useRef<HTMLDialogElement>(null);
  const submitMissionDialogRef = useRef<HTMLDialogElement>(null);

  const [workorders, setWorkorders] = useState<ResMission[] | null>(null);
  const isDialogOpen = useSelector((state: RootState) => state.dialog.isOpen);

  const handladdMissionButtonClick = () => {
    const dialog = missionDialogRef.current;
    if (dialog) {
      dialog.style.display = "flex";
      missionDialogRef.current?.showModal();
    }
  };

  const fetchWorkOrders = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return;
    }

    const offset = 0;
    const limit = 8;

    const url = `/workorder/get-workorders?offset=${offset}&limit=${limit}`;

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
      setWorkorders(data.data);
    } catch (err) {
      console.error("Error: ", err);
    }
  };

  useEffect(() => {
    fetchWorkOrders();
    const dialog = submitMissionDialogRef.current;
    if (dialog && isDialogOpen) {
      dialog.style.display = "flex";
      dialog.showModal();
    }
  }, [isDialogOpen, workorders]);

  return (
    <div className="flex w-full h-[100vh]">
      <SideBar />
      <div className="lg:pl-[33px] md:pt-[60px] pt-[20px] lg:pr-[56px] sm:px-[30px] px-[15px] md:pb-[38px] flex flex-col gap-[32px] w-full h-full overflow-auto">
        <Header
          pageSentence="Here are information about all missions"
          searchBar={true}
        />
        <Main
          flitration={
            ["0", "1"].includes(localStorage.getItem("role")!)
              ? [
                  "All",
                  "Created",
                  "Assigned",
                  "Executed",
                  "Validated",
                  "Acceptance",
                  "Done",
                ]
              : ["To do", "Acceptance", "Done"]
          }
          functionalties={{ primaryFunc: "Add mission +" }}
          handleAddPrimaryButtonClick={handladdMissionButtonClick}
        >
          <div className="flex items-center gap-[20px] flex-wrap w-full mt-[8px]">
            {workorders
              ? workorders.map((workorder: ResMission, index: number) => {
                  return (
                    <div
                      key={index}
                      className="relative flex flex-col items-start gap-[12px] rounded-[20px] border-[1px] flex-grow border-[#E6EDFF] px-[24px] py-[16px] w-[48%] lg:w-[31%] cursor-pointer hover:rotate-1"
                      onClick={() => navigate(`/missions/${workorder.id}`)}
                    >
                      <h2 className="sm:text-[20.5px] text-[18px] text-primary font-semibold text-nowrap">
                        {workorder.title}
                      </h2>
                      <p
                        className="sm:text-[14px] text-[12px] leading-[21px] text-n500 overflow-hidden text-ellipsis "
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: "3",
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {workorder.description}
                      </p>
                      <div className="flex items-center gap-[8px]">
                      <WorkOrderStatus  status={workorder.status} styles={{ fontSize: 10, px: 6, py: 4.5 }}/>
                      <WorkOrderpriority  priority={workorder.priority} styles={{ fontSize: 10, px: 6, py: 4.5 }}/>

                      </div>
                      {workorder.assigned_to ? (
                        <div className="w-full flex items-center gap-[5px] border-t-[1px] border-t-[#E6EDFF] pt-[10px]">
                          <img
                            src="/avatar1.png"
                            alt="avatar"
                            className="sm:w-[29px] w-[26px]"
                          />
                          <span className="sm:text-[12px] text-[10px] leading-[21px] text-n600">
                            {workorder.assigned_to}
                          </span>
                        </div>
                      ) : null}

                      <span className="absolute top-[18px] right-[18px] text-[14px] font-medium text-primary leading-[19.5px]">
                        {" "}
                        {++index}
                      </span>
                    </div>
                  );
                })
              : null}
          </div>
          <Pagination
            buttonTitle="add mission +"
            buttonFunc={handladdMissionButtonClick}
          />
        </Main>
      </div>
      <MissionPopup
        ref={missionDialogRef}
        title={true}
        textAreaTitle="Description"
        textAreaPlaceholder="Description"
      />
      <SuccessPopup ref={submitMissionDialogRef} />
    </div>
  );
};

export default Missions;
