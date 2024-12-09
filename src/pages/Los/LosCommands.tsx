import SideBar from "../../components/SideBar";
import Header from "../../components/Header";
import Main from "../../components/Main";
import LosStatus from "../../components/los/losStatus";
import WorkOrderpriority from "../../components/workorder/WorkOrderPriorities";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LosPopup from "../../components/los/LosPopup";
import SearchBar from "../../components/searchBar";
import { resOrders } from "../../assets/types/LosCommands";
import EmptyData from "../../components/EmptyData";
import { RotatingLines } from "react-loader-spinner";
import { useDispatch } from "react-redux";
import { toggleLosOrdersInTab } from "../../Redux/slices/selectedLosOrders";
import { AppDispatch } from "../../Redux/store";
import { RootState } from "../../Redux/store";
import { useSelector } from "react-redux";
import DeletePopup from "../../components/DeletePopup";
import Pagination from "../../components/Pagination";
import { handleOpenDialog } from "../../func/openDialog";

const baseUrl = import.meta.env.VITE_BASE_URL;

const LosCommands = () => {
  const navigate = useNavigate();

  const selecteOrders = useSelector(
    (state: RootState) => state.selectedLosOrders.OrdersTab
  );
  const dispatch = useDispatch<AppDispatch>();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [totalWorkorders, setTotalWorkorders] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 6;
  const totalPages = Math.ceil(totalWorkorders / limit);

  const [orders, setOrders] = useState<resOrders[] | null>(null);
  const losRef = useRef<HTMLDialogElement>(null);
  const deleteDialogRef = useRef<HTMLDialogElement>(null);

  const fetchOrders = async (offset = 0, limit = 6, status?: string) => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return { total: 0, current_offset: 0 };
    }

    setIsLoading(true);

    // Map status to its corresponding index
    let statusIndex: number | undefined;

    if (status) {
      switch (status) {
        case "created":
          statusIndex = 0;
          break;
        case "assigned":
          statusIndex = 1;
          break;
        case "launched":
          statusIndex = 2;
          break;
        case "executed":
          statusIndex = 3;
          break;
        case "generated":
          statusIndex = 4;
          break;
        case "rejected":
          statusIndex = 5;
          break;
        case "approved":
          statusIndex = 6;
          break;
        case "closed":
          statusIndex = 7;
          break;
        default:
          console.warn(`Unknown status: ${status}`);
          statusIndex = undefined;
      }
    }

    const url =
      statusIndex !== undefined
        ? `${baseUrl}/line-of-sight/get-line-of-sights-by-status/${statusIndex}?offset=${offset}&limit=${limit}`
        : `${baseUrl}/line-of-sight/get-line-of-sights?offset=${offset}&limit=${limit}`;

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
          console.log(data.data);
          setOrders(data.data);
          setTotalWorkorders(data.total);
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

  const handleCheckboxChange = (siteId: number) => {
    dispatch(toggleLosOrdersInTab(siteId));
  };

  const handleDeleteButtonClick = () => {
    if (selecteOrders.length === 0) {
      return;
    }
    // Perform the action when users are selected
    const dialog = deleteDialogRef.current;
    if (dialog) {
      dialog.style.display = "flex";
      deleteDialogRef.current?.showModal();
    }
  };

  useEffect(() => {
    const offset = (currentPage - 1) * limit;
    const filter = localStorage.getItem("selectedFilterForLos");

    if (filter === "all" || !filter) {
      fetchOrders(offset, limit);
    } else {
      fetchOrders(offset, limit, filter);
    }
  }, [currentPage]);

  return (
    <div className="w-full flex md:h-[100vh]">
      <SideBar />
      <div className="lg:pl-[26px] md:pt-[32px] pt-[20px] lg:pr-[30px] sm:px-[30px] px-[15px] pb-[20px] flex flex-col gap-[26px] w-full md:h-[100vh] overflow-y-auto">
        <Header pageSentence="Here are all  los commands" searchBar={false} />
        <SearchBar
          openDialogRef={losRef}
          page="los orders"
          wsUrl=""
          setSearchResult={setOrders}
          setLoaderSearch={setIsLoading}
        />
        <Main
          page="los orders"
          flitration={[
            "All",
            "Created",
            "Assigned",
            "Launched",
            "Executed",
            "Generated",
            "Rejected",
            "Approved",
            "Closed",
          ]}
          FiltrationFunc={fetchOrders}
          functionalties={{
             primaryFunc: { name: "filter by month" },
            secondaryFuncs: [{ name: "Delete" }],
          }}
          // handleAddPrimaryButtonClick={handladdMissionButtonClick}
          handleSecondaryButtonClick={handleDeleteButtonClick}
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
                        onClick={() =>
                          navigate(`${encodeURIComponent(`${order.id}`)}`)
                        }
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
                          {order.type.name}
                        </p>
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
                        {++index}
                      </span>
                    </div>
                  ))}
                </div>

                <Pagination
                  buttonTitle="Add New LOS Order"
                  buttonFunc={() => {
                    handleOpenDialog(losRef);
                  }}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  totalPages={totalPages}
                />
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
        <DeletePopup
          page="los orders"
          ref={deleteDialogRef}
          deleteItems={selecteOrders}
          deleteUrl={`${baseUrl}/line-of-sight/delete-line-of-sights`}
          jsonTitle="line_of_sights"
          fetchFunc={fetchOrders}
          fetchUrl={`${baseUrl}/line-of-sight/get-line-of-sights`}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          limit={limit}
        />
      </div>{" "}
    </div>
  );
};

export default LosCommands;
