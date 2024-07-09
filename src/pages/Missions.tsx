import { useRef,useState } from "react";
import SideBar from "../components/SideBar";
import Header from "../components/Header";
import Main from "../components/Main";
import Pagination from "../components/Pagination";
import MissionPopup from "../components/MissionPopup";
const Missions = () => {
  const missionDialogRef = useRef<HTMLDialogElement>(null);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [isOpen, setIsOpen] = useState(false);

  const handladdMissionButtonClick = () => {
    const dialog = missionDialogRef.current;
    if (dialog) {
      dialog.style.display = "flex";
      missionDialogRef.current?.showModal();
    }
  };


  return (
    <div className="flex w-full h-[100vh]">
      <SideBar />
      <div className="lg:pl-[33px] md:pt-[60px] pt-[20px] lg:pr-[56px] sm:px-[30px] px-[15px] md:pb-[38px] flex flex-col gap-[32px] w-full h-full overflow-auto">
        <Header pageSentence="Here are information about all missions" searchBar={true}/>
        <Main
          flitration={["All", "To Do", "Done"]}
          functionalties={{ primaryFunc: "Add mission +" }}
          handleAddPrimaryButtonClick={handladdMissionButtonClick}
        >
          <div className="flex items-center justify-between w-full">



          <div className="relative lg:hidden">
                  <h3 className="text-[20px] font-medium leading-[30px] text-primary flex items-center gap-[5px]"
                  onClick={() => { setIsOpen(!isOpen) }}>
                    {selectedStatus}
                    <svg
                      className="w-[11px] h-[7px]  md:w-[15px] md:h-[10px]"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 11 7"
                      fill="none"
                    >
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M9.3405 0.215332L5.42905 4.266L1.54938 0.215332L0.358935 1.44815L5.41939 6.73163L10.5213 1.44815L9.3405 0.215332Z"
                        fill="#4A3AFF"
                      />
                    </svg>
                  </h3>

                  {isOpen && (
                    <ul className="absolute sm:w-[300px] w-[190px] bg-white rounded-[30px] shadow-lg mt-2 z-10">
                      {[
                        "All",
                        "To Do",
                        "Done",
                      ].map((option) => (
                        <li
                          key={option}
                          className={`px-[18px] py-[10px] text-n600 sm:text-[16px] text-[14px] cursor-pointer hover:bg-gray-100 ${
                            option === selectedStatus ? "bg-gray-100" : ""
                          }`}
                          onClick={() => {
                            setSelectedStatus(option);
                            setIsOpen(false);
                          }}
                        >
                          {option}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <button
                className=" hidden md:inline-block capitalize lg:lg:hidden text-[14px] items-center gap-[3px] text-center justify-center leading-[21px] font-semibold xl:px-[20px] px-[16px]  py-[12px] text-white rounded-[21px] bg-primary"
                onClick={handladdMissionButtonClick}
              >
                add mission +
              </button>

           

          </div>
          <div className="flex items-center gap-[20px] flex-wrap w-full mt-[8px]">
            {Array.from({ length: 9 }).map((_, index) => {
              return (
                <div
                  key={index}
                  className="relative flex flex-col items-start gap-[9px] rounded-[20px] border-[1px] flex-grow border-n400 pl-[23px] pr-[35px] py-[16px] w-[48%] lg:w-[31%]"
                >
                  <h2 className="text-[20.5px] text-primary font-semibold">
                    Mission title
                  </h2>
                  <p
                    className="text-[14px] leading-[21px] text-n500 overflow-hidden text-ellipsis "
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: "3",
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    Sigh view high neat half to what. Sent late held than set
                    why wife our Sigh view view view . . .
                  </p>
                  <div className="flex items-center gap-[5px]">
                    <img src="/avatar1.png" alt="avatar" className="w-[29px]" />
                    <span className="text-[14px] leading-[21px] text-n600">
                      Mariem Boukennouche
                    </span>
                  </div>

                  <svg
                    className="absolute top-[18px] right-[18px]"
                    xmlns="http://www.w3.org/2000/svg"
                    width="21"
                    height="21"
                    viewBox="0 0 21 21"
                    fill="none"
                  >
                    <path
                      d="M10.5 5.01938V2.50977M10.5 17.5675V15.8944M16.625 10.0386H18.375M2.625 10.0386H5.25M15.4499 5.30631L16.0685 4.71488M4.9315 15.3623L6.16875 14.1795M14.8313 14.1795L16.0685 15.3623M4.9315 4.71488L6.78737 6.48918"
                      stroke="#A0A3BD"
                      stroke-width="1.66667"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </div>
              );
            })}
          </div>
          <Pagination
            buttonTitle="add mission +"
            buttonFunc={handladdMissionButtonClick}
          />
        </Main>
      </div>
      <MissionPopup ref={missionDialogRef} />
    </div>
  );
};

export default Missions;
