import { useRef, useEffect, useState } from "react";
import SideBar from "../../components/SideBar";
import Header from "../../components/Header";
import Pagination from "../../components/Pagination";
import LosStatus from "../../components/los/losStatus";
import WorkOrderpriority from "../../components/workorder/WorkOrderPriorities";
import { useNavigate, useParams } from "react-router-dom";
import { resOrders } from "../../assets/types/LosCommands";
import { useDispatch } from "react-redux";
import { toggleLosOrdersInTab } from "../../Redux/slices/selectedLosOrders";
import { AppDispatch } from "../../Redux/store";
import { RotatingLines } from "react-loader-spinner";

const baseUrl = import.meta.env.VITE_BASE_URL;

const LosCommandByUser = () => {
  const navigate = useNavigate();
  const { userInfo } = useParams<{ userInfo?: string }>();

  const dispatch = useDispatch<AppDispatch>();

  const missionDialogRef = useRef<HTMLDialogElement>(null);

  const [orders, setOrders] = useState<resOrders[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [totalOrders, setTotalOrders] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 6;

  const totalPages = Math.ceil(totalOrders / limit);

  const handladdMissionButtonClick = () => {
    const dialog = missionDialogRef.current;
    if (dialog) {
      dialog.style.display = "flex";
      missionDialogRef.current?.showModal();
    }
  };

  const handleCheckboxChange = (losId: number) => {
    dispatch(toggleLosOrdersInTab(losId));
  };
  useEffect(() => {
    fetchLosOrders((currentPage - 1) * limit, limit);
  }, [currentPage]);

  if (!userInfo) {
    return <div>No user info provided</div>;
  }

  const lastDashIndex = userInfo.lastIndexOf("-");
  const email = userInfo.slice(0, lastDashIndex); // Everything before the last dash
  const id = userInfo.slice(lastDashIndex + 1);

  const fetchLosOrders = async (offset = 0, limit = 6) => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return { total: 0, current_offset: 0 };
    }

    setIsLoading(true);
    const url = `${baseUrl}/line-of-sight/get-line-of-sights-by-account/${id}?offset=${offset}&limit=${limit}`;

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
        case 200: {
          const data = await response.json();
          setOrders(data.data);
          setTotalOrders(data.total);
          return { total: data.total, current_offset: offset };
        }
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

  return (
    <div className="flex w-full md:h-[100vh]">
      <SideBar />
      <div className="lg:pl-[26px] md:pt-[32px] pt-[20px] lg:pr-[30px] sm:px-[30px] px-[15px] pb-[20px] flex flex-col gap-[0px] w-full md:h-[100vh] overflow-y-auto">
        <Header
          pageSentence="Here are information about all los orders"
          searchBar={false}
          wsUrl=""
        />
        <div className="w-full p-3 flex items-center justify-between sm:flex-row flex-col-reverse sm:gap-0 gap-3">
          <span className="sm:text-[17px] text-[14px] font-bold text-primary">
            User:{" "}
            <span className="sm:text-[17px] text-[14px] font-medium text-n700">
              {" "}
              {email}
            </span>
          </span>
          <div
            className="sm:flex hidden items-center gap-3 sm:px-3 sm:py-[5px] p-2 border-[1px] border-primary rounded-[30px] hover:bg-gray-50 cursor-pointer transition-all duration-200"
            onClick={() => {
              navigate("/los/orders");
            }}
          >
            <svg
              className="sm:w-[23px] w-[21px]"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
            >
              <path
                fill="#4A3AFF"
                fill-rule="evenodd"
                d="M4.297105,3.29289 L0.59,7 L4.297105,10.7071 C4.687635,11.0976 5.320795,11.0976 5.711315,10.7071 C6.101845,10.3166 6.101845,9.68342 5.711315,9.29289 L4.418425,8 L11.504215,8 C12.332615,8 13.004215,8.67157 13.004215,9.5 C13.004215,10.3284 12.332615,11 11.504215,11 L10.004215,11 C9.451935,11 9.004215,11.4477 9.004215,12 C9.004215,12.5523 9.451935,13 10.004215,13 L11.504215,13 C13.437215,13 15.004215,11.433 15.004215,9.5 C15.004215,7.567 13.437215,6 11.504215,6 L4.418425,6 L5.711315,4.70711 C6.101845,4.31658 6.101845,3.68342 5.711315,3.29289 C5.320795,2.90237 4.687635,2.90237 4.297105,3.29289 Z"
              />
            </svg>

            <span className="sm:text-[16px] text-[14px] text-primary">
              Get back
            </span>
          </div>
        </div>

        {orders && !isLoading ? (
          <>
            <div className="flex items-center gap-[20px] flex-wrap w-full mt-[8px]">
              {orders.map((order: resOrders, index: number) => (
                <div
                  key={index}
                  className="group relative flex flex-col flex-grow sm:flex-grow-0 items-start gap-[12px] rounded-[20px] border-[1px] border-[#E6EDFF] w-[48%] lg:w-[31%] cursor-pointer hover:bg-slate-50 hover:shadow-xl transition-all duration-300"
                >
                  <div
                    className="flex flex-col items-start gap-[12px] w-full px-[24px] py-[16px] relative z-20"
                    onClick={() =>
                      navigate(`${encodeURIComponent(`${order.id}`)}`)
                    }
                  >
                    <h2 className="sm:text-[20.5px] text-[18px] text-primary font-semibold text-nowrap overflow-hidden w-full text-ellipsis whitespace-nowrap">
                      {order.near_end_location.site_code}
                    </h2>
                    <div className="flex items-center flex-wrap w-full">
                      <span className="sm:text-[14px] text-[12px] leading-[21px] text-n500 ">
                        {order.near_end_location.site_code}
                      </span>
                      {order.alternative_far_ends.map((site, index) => {
                        return (
                          <span
                            key={index}
                            className="sm:text-[14px] text-[12px] leading-[21px] text-n500"
                          >
                            {" "}
                            -{site.site_location.site_code}
                          </span>
                        );
                      })}
                    </div>
                    <div className="flex items-center gap-[8px]">
                      <LosStatus
                        status={order.status}
                        styles={{ fontSize: 10, px: 6, py: 5 }}
                      />
                      <WorkOrderpriority
                        priority={order.priority}
                        styles={{ fontSize: 10, px: 6, py: 5 }}
                      />
                    </div>
                  </div>

                  <div className="w-full h-[65px] flex items-center justify-between border-t-[1px] border-t-[#E6EDFF] pt-[10px] px-[24px] py-[16px]">
                    {order.assigned_to && (
                      <div className="w-full flex items-center gap-[5px]">
                        <img
                          src="/avatar1.png"
                          alt="avatar"
                          className="sm:w-[29px] w-[26px]"
                        />
                        <span className="sm:text-[12px] text-[10px] leading-[21px] text-n600">
                          {order.assigned_to.first_name}{" "}
                          {order.assigned_to.last_name}
                        </span>
                      </div>
                    )}

                    {localStorage.getItem("role") === "0" && (
                      <input
                        type="checkbox"
                        name="select-los"
                        id={`${index}`}
                        className="checked:opacity-100 opacity-0 group-hover:opacity-100 peer cursor-pointer w-[15px] h-[15px] transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCheckboxChange(order.id);
                        }}
                      />
                    )}
                  </div>

                  <span className="absolute top-[18px] right-[18px] text-[14px] font-medium text-primary leading-[19.5px] z-0">
                    {order.id}
                  </span>
                </div>
              ))}

              <Pagination
                buttonTitle="New LOS Order"
                buttonFunc={handladdMissionButtonClick}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                totalPages={totalPages}
              />
            </div>
          </>
        ) : isLoading ? (
          <div className="w-full flex items-center justify-center py-[40px]">
            <RotatingLines strokeWidth="4" strokeColor="#4A3AFF" width="60" />
          </div>
        ) : (
          <div className="flex flex-col gap-6 items-center justify-center">
            <img
              src="/astronaut/astronaut.png"
              alt="astro"
              className="w-[300px]"
            />
            <h3 className="text-[30px] font-bold text-n800">
              No Los order founded for this user
            </h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default LosCommandByUser;
