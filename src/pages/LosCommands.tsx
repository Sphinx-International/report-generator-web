import SideBar from "../components/SideBar";
import Header from "../components/Header";
import Main from "../components/Main";
import WorkOrderStatus from "../components/workorder/WorkOrderStatus";
import WorkOrderpriority from "../components/workorder/WorkOrderPriorities";
import { useState, useRef, useEffect } from "react";
//import { useNavigate } from "react-router-dom";
import LosPopup from "../components/los/LosPopup";
import SearchBar from "../components/searchBar";
import { resOrders } from "../assets/types/LosCommands";
import EmptyData from "../components/EmptyData";
import { RotatingLines } from "react-loader-spinner";

const baseUrl = import.meta.env.VITE_BASE_URL;

const LosCommands = () => {
 // const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [currentPage, setCurrentPage] = useState(1);
  console.log(currentPage)
  const [orders, setOrders] = useState<resOrders[] | null>(null);
  const losRef = useRef<HTMLDialogElement>(null);

  const fetchOrders = async (offset = 0, limit = 6, status?: string) => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return { total: 0, current_offset: 0 };
    }

    setIsLoading(true);

    const url = status
      ? `${baseUrl}/line-of-sight/get-line-of-sights/${status}?offset=${offset}&limit=${limit}`
      : `${baseUrl}/line-of-sight/get-line-of-sights?offset=${offset}&limit=${limit}`;
    console.log(url);
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response text: ", errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      switch (response.status) {
        case 200:
          {
            const data = await response.json();
            setOrders(data.data);
            // console.log(data)
            // setTotalWorkorders(data.total);
            return { total: data.total, current_offset: offset };
          }
          break;

        case 204:
          setOrders(null);
          break;

        default:
          break;
      }
    } catch (err) {
      console.error("Error: ", err);
      return { total: 0, current_offset: 0 };
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="w-full flex md:h-[100vh]">
      <SideBar />
      <div className="lg:pl-[26px] md:pt-[32px] pt-[20px] lg:pr-[30px] sm:px-[30px] px-[15px] pb-[20px] flex flex-col gap-[26px] w-full md:h-[100vh] overflow-y-auto">
        <Header pageSentence="Here are all  los commands" searchBar={false} />
        <SearchBar
          openDialogRef={losRef}
          page="Los"
          wsUrl=""
          setSearchResult={setOrders}
          setLoaderSearch={setIsLoading}
        />
        <Main
          page="workorders"
          flitration={[
            "All",
            "Created",
            "Assigned",
            "Submitted",
            "Rejected",
            "Approved",
          ]}
          // FiltrationFunc={fetchWorkOrders}
          /* functionalties={{
            primaryFunc: { name: "Add workorder" },
            secondaryFuncs: [{ name: "Delete" }],
          }} */
          // handleAddPrimaryButtonClick={handladdMissionButtonClick}
          // handleSecondaryButtonClick={handleDeleteButtonClick}
          setCurrentPage={setCurrentPage}
        >
          {!isLoading ? (
            orders ? (
              <>
                <div className="flex items-center gap-[20px] flex-wrap w-full mt-[8px]">
                  {orders.map((order, index: number) => (
                    <div
                      key={index}
                      className="group relative flex flex-col flex-grow sm:flex-grow-0 items-start gap-[12px] rounded-[20px] border-[1px] border-[#E6EDFF] w-[48%] lg:w-[31%] cursor-pointer hover:bg-slate-50 hover:shadow-xl transition-all duration-300"
                    >
                      <div
                        className="flex flex-col items-start gap-[12px] w-full px-[24px] py-[16px] relative z-20"
                        /*   onClick={() =>
                              navigate(
                                `/workorders/${encodeURIComponent(
                                  "workorder.id"
                                )}`
                              )
                            } */
                      >
                        <h2 className="sm:text-[20.5px] text-[18px] text-primary font-semibold text-nowrap overflow-hidden w-full text-ellipsis whitespace-nowrap">
                          {order.near_end_location.site_code}
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
                  ))}
                </div>
              </>
            ) : (
              <EmptyData data="orders" />
            )
          ) : (
            <div className="flex items-center justify-center py-10">
              <RotatingLines strokeColor="#4A3AFF" width="60" />
            </div>
          )}
        </Main>
        <LosPopup ref={losRef} fetchOrders={fetchOrders} />
      </div>{" "}
    </div>
  );
};

export default LosCommands;
