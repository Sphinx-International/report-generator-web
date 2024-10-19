import SideBar from "../components/SideBar";
import Header from "../components/Header";
import Main from "../components/Main";
import WorkOrderStatus from "../components/workorder/WorkOrderStatus";
import WorkOrderpriority from "../components/workorder/WorkOrderPriorities";
import { useState,useRef } from "react";
import { useNavigate } from "react-router-dom";
import LosPopup from "../components/los/LosPopup";
import SearchBar from "../components/searchBar";
const LosCommands = () => {
  const navigate = useNavigate()

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [currentPage, setCurrentPage] = useState(1);
  console.log(currentPage)
  const [commands, setCommands] = useState<any | null >();
  console.log(commands)
  const losRef = useRef<HTMLDialogElement>(null);


  return (
    <div className="w-full flex md:h-[100vh]">
      <SideBar />
      <div className="lg:pl-[26px] md:pt-[32px] pt-[20px] lg:pr-[30px] sm:px-[30px] px-[15px] pb-[20px] flex flex-col gap-[26px] w-full md:h-[100vh] overflow-y-auto">
        <Header
          pageSentence="Here are all  los commands"
          searchBar={false}
          // wsUrl="search-account"
        />
        <SearchBar openDialogRef={losRef} page="Los" wsUrl="" setSearchResult={setCommands} setLoaderSearch={setIsLoading}/>
        <Main
          page="workorders"
          flitration={["All", "Created","Assigned", "Submitted", "Regected" , "Approved", "Refused" ,  "Accepted"]}
         // FiltrationFunc={fetchWorkOrders}
         /* functionalties={{
            primaryFunc: { name: "Add workorder" },
            secondaryFuncs: [{ name: "Delete" }],
          }} */
         // handleAddPrimaryButtonClick={handladdMissionButtonClick}
         // handleSecondaryButtonClick={handleDeleteButtonClick}
          setCurrentPage={setCurrentPage}
        >
          {
           
           !isLoading  ? (
                <>
                  <div className="flex items-center gap-[20px] flex-wrap w-full mt-[8px]">
                    {Array.from({length: 6}).map(
                      (_, index: number) => (
                        <div
                          key={index}
                          className="group relative flex flex-col flex-grow sm:flex-grow-0 items-start gap-[12px] rounded-[20px] border-[1px] border-[#E6EDFF] w-[48%] lg:w-[31%] cursor-pointer hover:bg-slate-50 hover:shadow-xl transition-all duration-300"
                        >
                          <div
                            className="flex flex-col items-start gap-[12px] w-full px-[24px] py-[16px] relative z-20"
                            onClick={() =>
                              navigate(
                                `/workorders/${encodeURIComponent(
                                  "workorder.id"
                                )}`
                              )
                            }
                          >
                            <h2 className="sm:text-[20.5px] text-[18px] text-primary font-semibold text-nowrap overflow-hidden w-full text-ellipsis whitespace-nowrap">
                            BO2398
                            </h2>
                            <p
                              className="sm:text-[14px] text-[12px] leading-[21px] text-n500 h-[43px] overflow-hidden text-ellipsis w-full"
                              style={{
                                display: "-webkit-box",
                                WebkitLineClamp: "2",
                                WebkitBoxOrient: "vertical",
                              }}
                            >
                              BJ0501 TO BJ0606 TO BJ0609 TO BJ0607
                            </p>
                            <div className="flex items-center gap-[8px]">
                              <WorkOrderStatus
                                status={2}
                                styles={{ fontSize: 10, px: 6, py: 4.5 }}
                              />
                              <WorkOrderpriority
                                priority={1}
                                styles={{ fontSize: 10, px: 6, py: 4.5 }}
                              />
                            </div>
                          </div>

                          <div className="w-full h-[65px] flex items-center justify-between border-t-[1px] border-t-[#E6EDFF] pt-[10px] px-[24px] py-[16px]">

                              <div className="w-full flex items-center gap-[5px]">
                                <img
                                  src="/avatar1.png"
                                  alt="avatar"
                                  className="sm:w-[29px] w-[26px]"
                                />
                                <span className="sm:text-[12px] text-[10px] leading-[21px] text-n600">
                                Mariem Boukennouche
                                </span>
                              </div>
                            {localStorage.getItem("role") === "0" && (
                              <input
                                type="checkbox"
                                name="select-workOrder"
                                id={`${index}`}
                                className="checked:opacity-100 opacity-0 group-hover:opacity-100 peer cursor-pointer w-[15px] h-[15px] transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation();
                               //   handleCheckboxChange(`${workorder.id}`);
                                }}
                              />
                            )}
                          </div>

                          <span className="absolute top-[18px] right-[18px] text-[14px] font-medium text-primary leading-[19.5px] z-0">
                            {++index}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-6 items-center justify-center">
                  <img
                    src="/astronaut/astronaut.png"
                    alt="astro"
                    className="w-[230px]"
                  />
                  <h3 className="text-[30px] font-bold text-n800">
                    No Workorder Founded
                  </h3>
                </div>
              )
            }

        </Main>
        <LosPopup ref={losRef}/>
      </div>{" "}
    </div>
  );
};

export default LosCommands;
