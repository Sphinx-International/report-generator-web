import { useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { openDialog } from "../Redux/slices/dialogSlice";
import { AppDispatch } from "../Redux/store";

import SideBar from "../components/SideBar";
import Header from "../components/Header";
import MissionPopup from "../components/MissionPopup";
import SuccessPopup from "../components/SuccessPopup";
const MissionDetails = () => {
  const [visibleEngPopup, setVisibleEngPopup] = useState<boolean>(false);
  const [selectedEng, setSelectedEng] = useState<number>();
  const addTaskDialogRef = useRef<HTMLDialogElement>(null);
  const refuseTaskDialogRef = useRef<HTMLDialogElement>(null);
  const submitMissionDialogRef = useRef<HTMLDialogElement>(null);

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

  return (
    <div className="w-full flex h-[100vh]">
      <SideBar />
      <div className=" md:pt-[60px] pt-[20px] pr-[60px] pl-[36px] md:pb-[38px] flex flex-col gap-[58px] w-full h-full overflow-auto">
        <Header pageSentence="Mission details" searchBar={false} />
        <div className="flex flex-col w-full gap-[31px] ">
          <div className="flex flex-col items-start gap-[14px] pl-[6px]">
            <h1 className="text-primary font-semibold text-[24px] leading-[36px]">
              Mission title
            </h1>
            <p className="text-[18px] leading-[30px] text-n600">
              Certainly elsewhere my do allowance at. The address farther six
              hearted hundred towards husband. Are securing off occasion
              remember daughter replying. Held that feel his see own yet.
              Strangers ye to he sometimes propriety in. She right plate seven
              has. Bed who perceive judgment did marianne Bed who perceive
              judgment did marianne Bed who perceive judgment did marianne Bed
              who perceive judgment did marianne:
            </p>
            <div className="flex flex-col items-start gap-[14px]">
              <h5 className="text-n700 text-[18px] leading-[27px] font-medium">
                Engineer
              </h5>
              <div className="flex items-center gap-[12px]">
                <div className="relative">
                  <span
                    className={` ${
                      selectedEng !== undefined
                        ? "w-[40px] h-[40px] flex"
                        : "bg-[#EAE3FF] py-[6px] px-[15px]"
                    }  rounded-[50%] text-primary font-semibold text-[21px] cursor-pointer hover:bg-n400`}
                    onClick={() => {
                      setVisibleEngPopup(!visibleEngPopup);
                    }}
                  >
                    {selectedEng !== undefined ? (
                      <img
                        src="/avatar.png"
                        alt="Selected"
                        className="absolute inset-0 w-full h-full object-cover rounded-[50%] z-0"
                      />
                    ) : (
                      "+"
                    )}
                  </span>
                  {visibleEngPopup && (
                    <div className="flex flex-col items-start gap-[21px] w-[279px] px-[13px] py-[24px] z-50 bg-white rounded-br-[20px] rounded-bl-[20px] rounded-tr-[20px] shadow-xl absolute left-[46px] top-4">
                      <div className="relative w-full">
                        <input
                          type="search"
                          name=""
                          id=""
                          className="w-full h-[38px] rounded-[19px] border-[1px] border-n300 shadow-md pl-[35px] pr-[12px] md:text-[15px] text-[13px] text-n600"
                          placeholder="Search members"
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
                      <div className="flex flex-col items-start gap-[12px] pl-[10px] w-full">
                        {Array.from({ length: 6 }).map((_, index) => {
                          return (
                            <div
                              key={index}
                              className="flex items-center gap-[5px] cursor-pointer hover:bg-n200 w-full"
                              onClick={() => {
                                handleClickedEng(index);
                              }}
                            >
                              <img
                                src="/avatar.png"
                                alt="logo"
                                className="w-[31px] rounded-[50%]"
                              />
                              <span className="text-[14px] text-n600 leading-[21px]">
                                Mariem Boukennouche
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                {selectedEng !== undefined && (
                  <span className="text-n600 ">Mariem Boukennouche</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-[20px] w-full">
            <div className="flex w-full items-center justify-between">
              <span className="text-n800 text-[21px] leading-[31.5px] font-semibold">
                Tasks
              </span>
              <button
                className="bg-primary rounded-[20px] px-[18px] py-[7.5px] text-white leading-[20px] text-[12px] font-semibold"
                onClick={handlAddTaskButtonClick}
              >
                Add Task +
              </button>
            </div>
            <div className="flex flex-col items-center gap-[75px] w-full">
              <div className="flex flex-col items-start gap-[16px] w-full">
                {["done", "not yet", "not yet", "done"].map((task, index) => {
                  if (
                    /*this condition will be change after likning the apis with the mission status */
                    task === "done"
                  ) {
                    return (
                      <p
                        key={index}
                        className="w-full px-[25px] py-[14px] border-[1px] border-n400 rounded-[15px] text-550 text-[17px] leading-[30px]"
                      >
                        perceive judgment did marianne Bed who perceive judgment
                        did marianne.perceive judgment did marianne Bed who
                        perceive judgment did marianne.
                      </p>
                    );
                  } else {
                    return (
                      <div
                        key={index}
                        className="w-full flex flex-col items-start gap-[24px] pr-[25px] py-[14px]"
                      >
                        <p className="text-550 text-[17px] leading-[30px]">
                          perceive judgment did marianne Bed who perceive
                          judgment did marianne.perceive judgment did marianne
                          Bed who perceive judgment did marianne.
                        </p>
                        <div className="border-[1px] border-n400 rounded-[15px] px-[42px] py-[32px] flex flex-col gap-[21px] items-start">
                          <img
                            src="/task.png"
                            alt="task image"
                            className="rounded-[15px]"
                          />
                          <p className="text-[17px] leading-[30px] text-550">
                            perceive judgment did marianne Bed who perceive
                            judgment did marianne.perceive judgment did marianne
                            Bed who perceive judgment did marianne.perceive
                            judgment did marianne Bed who perceive judgment did
                            marianne.perceive judgment did marianne Bed who
                            perceive judgment did marianne.
                          </p>
                          <div className="flex items-center gap-[5px] w-full justify-end">
                            <button
                              className="px-[31.5px] py-[8.5px] rounded-[86px] border-[1px] border-[#DB2C2C] bg-[#FFF5F3] text-[14px] font-semibold leading-[20px] text-[#DB2C2C]"
                              onClick={handlRefuseTaskButtonClick}
                            >
                              Refuse
                            </button>
                            <button className="px-[31.5px] py-[8.5px] rounded-[86px] border-[1px] border-[#48C1B5] bg-[##F6FFF9] text-[14px] font-semibold leading-[20px] text-[#48C1B5]">
                              Validate
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  }
                })}
              </div>

              {
                /*this condition will be change after likning the apis with the mission status */
                selectedEng === undefined && (
                  <button
                    className="py-[15px] px-[40px] sm:px-0 sm:w-[40%] bg-primary rounded-[86px] text-[14px] font-semibold leading-[20px] text-white"
                    onClick={handlSubmitMissionButtonClick}
                  >
                    Submit mission
                  </button>
                )
              }
            </div>
          </div>
        </div>
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
