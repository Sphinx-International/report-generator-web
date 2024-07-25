import { useRef, useEffect, useState } from "react";
import SideBar from "../components/SideBar";
import Header from "../components/Header";
import Main from "../components/Main";
import Pagination from "../components/Pagination";
import MissionPopup from "../components/MissionPopup";
import SuccessPopup from "../components/SuccessPopup";
import WorkOrderStatus from "../components/WorkOrderStatus";
import WorkOrderpriority from "../components/WorkOrderPriorities";
import DeletePopup from "../components/DeletePopup";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../Redux/store";
import { ResMission } from "../assets/types/Mission";
import { useDispatch } from "react-redux";
import { toggleWorkorderInTab } from "../Redux/slices/selectedWorkordersSlice";
import { AppDispatch } from "../Redux/store";
const Missions = () => {
  const navigate = useNavigate();

  const dispatch = useDispatch<AppDispatch>();
  const selectedWorkorders = useSelector(
    (state: RootState) => state.selectedWorkorders.workOrdersTab
  );

  const missionDialogRef = useRef<HTMLDialogElement>(null);
  const submitMissionDialogRef = useRef<HTMLDialogElement>(null);
  const deleteDialogRef = useRef<HTMLDialogElement>(null);

  const [workorders, setWorkorders] = useState<ResMission[] | null>(null);
  const isDialogOpen = useSelector((state: RootState) => state.dialog.isOpen);

  const handladdMissionButtonClick = () => {
    const dialog = missionDialogRef.current;
    if (dialog) {
      dialog.style.display = "flex";
      missionDialogRef.current?.showModal();
    }
  };

  const handleCheckboxChange = (userId: string) => {
    dispatch(toggleWorkorderInTab(userId));
  };

  const handleDeleteButtonClick = () => {
    if (selectedWorkorders.length === 0) {
      return;
    }
    // Perform the action when users are selected
    const dialog = deleteDialogRef.current;
    if (dialog) {
      dialog.style.display = "flex";
      deleteDialogRef.current?.showModal();
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
      <div className="lg:pl-[26px] md:pt-[32px] pt-[20px] lg:pr-[30px] sm:px-[30px] px-[15px] flex flex-col gap-[24px] w-full h-[100vh] overflow-hidden">
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
          functionalties={{
            primaryFunc: { name: "Add workorder"},
            secondaryFuncs: [{ name: "Delete"}],
          }}
          handleAddPrimaryButtonClick={handladdMissionButtonClick}
          handleSecondaryButtonClick={handleDeleteButtonClick}
        >
          <div className="flex items-center gap-[20px] flex-wrap w-full mt-[8px]">
            {workorders
              ? workorders.map((workorder: ResMission, index: number) => {
                  return (
                    <div
                      key={workorder.id}
                      className="group relative flex flex-col items-start gap-[12px] rounded-[20px] border-[1px] border-[#E6EDFF] w-[48%] lg:w-[31%] cursor-pointer hover:bg-slate-50 hover:shadow-xl transition-all duration-300"
                    >
                      <div
                        className="flex flex-col items-start gap-[12px] w-full px-[24px] py-[16px] relative z-20"
                        onClick={() => navigate(`/missions/${workorder.id}`)}
                      >
                        <h2 className="sm:text-[20.5px] text-[18px] text-primary font-semibold text-nowrap overflow-hidden w-full text-ellipsis whitespace-nowrap">
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
                          <WorkOrderStatus
                            status={workorder.status}
                            styles={{ fontSize: 10, px: 6, py: 4.5 }}
                          />
                          <WorkOrderpriority
                            priority={workorder.priority}
                            styles={{ fontSize: 10, px: 6, py: 4.5 }}
                          />
                        </div>
                      </div>

                      <div className="w-full flex items-center justify-between border-t-[1px] border-t-[#E6EDFF] pt-[10px]  px-[24px] py-[16px]">
                        {workorder.assigned_to ? (
                          <div className="w-full flex items-center gap-[5px]">
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
                        {localStorage.getItem("role") ==="0"&& (
                        <input
                        type="checkbox"
                        name="select-workOrder"
                        id={`${index}`}
                        className="checked:opacity-100 opacity-0 group-hover:opacity-100 peer cursor-pointer w-[15px] h-[15px] transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCheckboxChange(`${workorder.id}`);
                        }}
                      />
                        )}

                      </div>

                      <span className="absolute top-[18px] right-[18px] text-[14px] font-medium text-primary leading-[19.5px] z-0">
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
      <DeletePopup ref={deleteDialogRef} deleteItems={selectedWorkorders} deleteUrl="/workorder/delete-workorders" jsonTitle="workorders"/>
    </div>
  );
};

export default Missions;