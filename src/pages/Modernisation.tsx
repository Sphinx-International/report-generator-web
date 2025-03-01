import { useRef, useEffect, useState } from "react";
import SideBar from "../components/SideBar";
import Header from "../components/Header";
import Main from "../components/Main";
import Pagination from "../components/Pagination";
import ModernisationPopup from "../components/Modernisation/ModernisationPopup";
import WorkOrderStatus from "../components/workorder/WorkOrderStatus";
import WorkOrderpriority from "../components/workorder/WorkOrderPriorities";
import DeletePopup from "../components/DeletePopup";
import { useNavigate } from "react-router-dom";
import { RootState } from "../Redux/store";
import { ResModernisation } from "../assets/types/Modernisation";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { toggleExtantionInTab } from "../Redux/slices/selectedExtantionsSlice";
import { AppDispatch } from "../Redux/store";
import { RotatingLines } from "react-loader-spinner";
import useWebSocketSearch from "../hooks/useWebSocketSearch";
import { User } from "../assets/types/User";
import { getRole } from "../func/getUserRole";
import { handleOpenDialog } from "../func/openDialog";
const baseUrl = import.meta.env.VITE_BASE_URL;

const Modernisation = () => {
  const navigate = useNavigate();

  const dispatch = useDispatch<AppDispatch>();
  const selectedModernisation = useSelector(
    (state: RootState) => state.selectedExtantions.modernisationsTab
  );

  const modernisationDialogRef = useRef<HTMLDialogElement>(null);
  const deleteDialogRef = useRef<HTMLDialogElement>(null);

  const [modernisations, setModernisations] = useState<
    ResModernisation[] | null
  >(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [usersWs, setUsersWs] = useState<User[] | null>(null);
  const [isLoadingUsersWs, setIsLoadingUsersWs] = useState<boolean>(true);
  const [modernisationWs, setModernisationWs] = useState<
    ResModernisation[] | null
  >(null);
  const [isLoadingmodernisationWs, setIsLoadingmodernisationWs] =
    useState<boolean>(true);

  const [totalWorkorders, setTotalWorkorders] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 6;
  const totalPages = Math.ceil(totalWorkorders / limit);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [typeOfSearch, setTypeOfSearch] = useState<"Wo" | "User">("Wo");
  const [typeOfSearchPopupVisible, setTypeOfSearchPopupVisible] =
    useState<boolean>(false);

  const [selectedMonth, setSelectedMonth] = useState<
    1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | null
  >(null);
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );

  const handladdMissionButtonClick = () => {
    const dialog = modernisationDialogRef.current;
    if (dialog) {
      dialog.style.display = "flex";
      modernisationDialogRef.current?.showModal();
    }
  };

  const handleCheckboxChange = (userId: string) => {
    dispatch(toggleExtantionInTab({ tab: "modernisationsTab", id: userId }));
  };

  const handleDeleteButtonClick = () => {
    if (selectedModernisation.length === 0) {
      return;
    }
    // Perform the action when users are selected
    const dialog = deleteDialogRef.current;
    if (dialog) {
      dialog.style.display = "flex";
      deleteDialogRef.current?.showModal();
    }
  };

  const fetchModernisations = async (
    offset = 0,
    limit = 6,
    status?: string,
    month?: number,
    year?: number
  ) => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return { total: 0, current_offset: 0 };
    }

    setIsLoading(true);

    const url = status
      ? `${baseUrl}/modernisation/get-modernisations/${status}?offset=${offset}&limit=${limit}`
      : month
      ? `${baseUrl}/modernisation/get-modernisations-by-date/${month}/${year}?offset=${offset}&limit=${limit}`
      : `${baseUrl}/modernisation/get-modernisations?offset=${offset}&limit=${limit}`;
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
            setModernisations(data.data);
            setTotalWorkorders(data.total);
            return { total: data.total, current_offset: offset };
          }
          break;

        case 204:
          setModernisations(null);
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

  const filterExcuted = async (
    offset = 0,
    limit = 6,
    report: boolean | null,
    certificate: boolean | null,
    voucher: boolean | null
  ) => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return { total: 0, current_offset: 0 };
    }

    setIsLoading(true);

    const url = `${baseUrl}/modernisation/get-executed-modernisation?offset=${offset}&limit=${limit}&report=${report}&certificate=${certificate}&voucher=${voucher}`;
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      });
      console.log(response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response text: ", errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      switch (response.status) {
        case 200:
          {
            const data = await response.json();
            setModernisations(data.data);
            setTotalWorkorders(data.total);
            return { total: data.total, current_offset: offset };
          }
          break;

        case 204:
          setModernisations(null);
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
    const filter = localStorage.getItem("selectedFilterForWorkorders");
    const subFilter = localStorage.getItem("selectedSubExecutedFilter");

    if (filter !== "all" && filter) {
      if (filter === "executed" && subFilter && subFilter !== "All") {
        filterExcuted(
          (currentPage - 1) * limit,
          limit,
          subFilter === "Missing reports" ? false : null,
          subFilter === "Missing acceptance certificate" ? false : null,
          subFilter === "Missing return voucher" ? false : null
        );
      } else {
        fetchModernisations((currentPage - 1) * limit, limit, filter);
      }
    } else {
      if (selectedMonth) {
        console.log("3");

        fetchModernisations(
          (currentPage - 1) * limit,
          limit,
          undefined,
          selectedMonth,
          selectedYear
        );
      } else {
        fetchModernisations((currentPage - 1) * limit, limit);
      }
    }
  }, [currentPage, selectedMonth, selectedYear]);

  useWebSocketSearch({
    searchQuery: searchQuery,
    endpointPath:
      typeOfSearch === "User" ? "search-account" : "search-modernisation",
    setResults: typeOfSearch === "User" ? setUsersWs : setModernisationWs,
    setLoader:
      typeOfSearch === "User"
        ? setIsLoadingUsersWs
        : setIsLoadingmodernisationWs,
  });
  return (
    <div className="flex w-full md:h-[100vh]">
      <SideBar />
      <div className="lg:pl-[26px] md:pt-[32px] pt-[20px] lg:pr-[30px] sm:px-[30px] px-[15px] pb-[20px] flex flex-col gap-[26px] w-full md:h-[100vh] overflow-y-auto">
        <Header
          pageSentence="Here are information about all modernisation "
          searchBar={false}
        />
        <div className="flex items-center gap-2">
          <div className="relative w-full ">
            <input
              type="search"
              name=""
              id=""
              className="w-full h-[44px] rounded-[40px] border-[1px] border-n300 shadow-md md:px-[54px] pl-[54px] pr-[15px] md:text-[14px] text-[12px]"
              placeholder={`Search for modernisation`}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
              value={searchQuery}
            />
            <svg
              className="absolute left-[20px] top-[50%] translate-y-[-50%]"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M11 2C15.97 2 20 6.03 20 11C20 15.97 15.97 20 11 20C6.03 20 2 15.97 2 11C2 7.5 4 4.46 6.93 2.97"
                stroke="#6F6C8F"
                strokeWidth="1.5"
                fillOpacity="round"
                strokeLinejoin="round"
              />
              <path
                d="M19.07 20.97C19.6 22.57 20.81 22.73 21.74 21.33C22.6 20.05 22.04 19 20.5 19C19.35 19 18.71 19.89 19.07 20.97Z"
                stroke="#6F6C8F"
                strokeWidth="1.5"
                fillOpacity="round"
                strokeLinejoin="round"
              />
            </svg>

            {getRole() !== 2 && (
              <>
                <div
                  className="absolute right-1 top-[50%] translate-y-[-50%] z-50 flex items-center gap-2 cursor-pointer sm:border-[2px] sm:border-n500 rounded-[20px] p-[6px]"
                  onClick={() => {
                    setTypeOfSearchPopupVisible(!typeOfSearchPopupVisible);
                  }}
                >
                  <span className="text-n500 text-[14px] sm:flex hidden">
                    {typeOfSearch === "Wo"
                      ? "Search by modernisation "
                      : "Search by user"}
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="16"
                    viewBox="0 0 18 16"
                    fill="none"
                  >
                    <path
                      d="M16.7077 8.00023H6.41185M2.77768 8.00023H1.29102M2.77768 8.00023C2.77768 7.51842 2.96908 7.05635 3.30977 6.71566C3.65046 6.37497 4.11254 6.18357 4.59435 6.18357C5.07616 6.18357 5.53824 6.37497 5.87893 6.71566C6.21962 7.05635 6.41102 7.51842 6.41102 8.00023C6.41102 8.48204 6.21962 8.94412 5.87893 9.28481C5.53824 9.6255 5.07616 9.8169 4.59435 9.8169C4.11254 9.8169 3.65046 9.6255 3.30977 9.28481C2.96908 8.94412 2.77768 8.48204 2.77768 8.00023ZM16.7077 13.5061H11.9177M11.9177 13.5061C11.9177 13.988 11.7258 14.4506 11.3851 14.7914C11.0443 15.1321 10.5821 15.3236 10.1002 15.3236C9.61837 15.3236 9.1563 15.1313 8.81561 14.7906C8.47491 14.45 8.28352 13.9879 8.28352 13.5061M11.9177 13.5061C11.9177 13.0241 11.7258 12.5624 11.3851 12.2216C11.0443 11.8808 10.5821 11.6894 10.1002 11.6894C9.61837 11.6894 9.1563 11.8808 8.81561 12.2215C8.47491 12.5622 8.28352 13.0243 8.28352 13.5061M8.28352 13.5061H1.29102M16.7077 2.4944H14.1202M10.486 2.4944H1.29102M10.486 2.4944C10.486 2.01259 10.6774 1.55051 11.0181 1.20982C11.3588 0.869133 11.8209 0.677734 12.3027 0.677734C12.5412 0.677734 12.7775 0.724724 12.9979 0.81602C13.2183 0.907316 13.4186 1.04113 13.5873 1.20982C13.756 1.37852 13.8898 1.57878 13.9811 1.79919C14.0724 2.0196 14.1193 2.25583 14.1193 2.4944C14.1193 2.73297 14.0724 2.9692 13.9811 3.18961C13.8898 3.41002 13.756 3.61028 13.5873 3.77898C13.4186 3.94767 13.2183 4.08149 12.9979 4.17278C12.7775 4.26408 12.5412 4.31107 12.3027 4.31107C11.8209 4.31107 11.3588 4.11967 11.0181 3.77898C10.6774 3.43829 10.486 2.97621 10.486 2.4944Z"
                      stroke="#A0A3BD"
                      strokeWidth="1.25"
                      strokeMiterlimit="10"
                      strokeLinecap="round"
                    />
                  </svg>
                  {typeOfSearchPopupVisible && (
                    <div className="bg-white shadow-xl shadow-slate-400 p-[17px] rounded-[10px] flex flex-col items-start gap-[14px] absolute right-1 top-8">
                      <span className="text-[13px] text-n700 font-medium">
                        Search by :{" "}
                      </span>
                      <div className="flex items-center gap-[4px]">
                        <button
                          className={`px-[20px] py-[5px] rounded-[26px] border-[1px]  text-[12px] leading-[18px]  font-medium ${
                            typeOfSearch === "Wo"
                              ? "text-primary border-primary"
                              : "text-n600 border-n400"
                          }`}
                          onClick={() => {
                            setTypeOfSearch("Wo");
                          }}
                        >
                          Modernisation
                        </button>
                        <button
                          className={`px-[20px] py-[5px] rounded-[26px] border-[1px] text-[12px] leading-[18px] font-medium ${
                            typeOfSearch === "User"
                              ? "text-primary border-primary"
                              : "text-n600 border-n400"
                          }`}
                          onClick={() => {
                            setTypeOfSearch("User");
                          }}
                        >
                          User
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                {searchQuery && typeOfSearch === "User" && (
                  <div className="w-full bg-white shadow-xl shadow-slate-200 rounded-[20px] py-2 flex flex-col items-start gap-[10px] absolute z-40">
                    {!isLoadingUsersWs ? (
                      usersWs && usersWs.length > 0 ? (
                        usersWs.map((user) => {
                          return (
                            <div
                              className="flex items-center gap-2 px-3 w-full hover:bg-slate-300 cursor-pointer"
                              onClick={() => {
                                navigate(
                                  `/modernisations-by-user/${user.email}-${user.id}`
                                );
                              }}
                            >
                              <img
                                src="/avatar.png"
                                alt="avatar"
                                className="rounded-[50%] w-[35px]"
                              />
                              <div className="flex flex-col items-start">
                                <span className="text-n700 font-medium">
                                  {user.email} ({user.first_name}{" "}
                                  {user.last_name})
                                </span>
                                <span
                                  className={`text-[12px] font-medium leading-[18px] ${
                                    user.is_active
                                      ? "text-[#23B4A6]"
                                      : "text-[#DB2C2C]"
                                  }`}
                                >
                                  {user.is_active ? "active" : "banned"}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="flex items-center justify-center w-full py-2">
                          <span className="text-n700 font-medium">
                            no result founded . . .
                          </span>
                        </div>
                      )
                    ) : (
                      <div className="flex items-center justify-center w-full py-3">
                        <RotatingLines
                          strokeWidth="4"
                          strokeColor="#4A3AFF"
                          width="20"
                        />
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
          { [0, 1, 2].includes(getRole()!) && <button
            className="hidden md:inline-block rounded-[30px] py-[12px] sm:px-[25px] px-[15px] bg-primary text-white sm:text-[14px] text-[11px] font-medium text-nowrap"
            onClick={() => {
              handleOpenDialog(modernisationDialogRef);
            }}
          >
            Add modernisation
          </button>}
        </div>

        <Main
          page="modernisation"
          flitration={
            searchQuery
              ? typeOfSearch === "Wo"
                ? []
                : ["0", "1", "3"].includes(localStorage.getItem("role")!)
                ? ["All", "Created", "Assigned", "Executed", "Closed"]
                : ["All", "To do", "Executed"]
              : ["0", "1", "3"].includes(localStorage.getItem("role")!)
              ? ["All", "Created", "Assigned", "Executed", "Closed"]
              : ["All", "To do", "Executed", "Closed"]
          }
          FiltrationFunc={fetchModernisations}
          subFilterFunc={filterExcuted}
          functionalties={{
            primaryFunc: { name: "Add modernisation" },
            secondaryFuncs: [{ name: "Delete" }],
            setState: setSelectedMonth as React.Dispatch<
              React.SetStateAction<unknown>
            >,
            State: selectedMonth,
            setState2: setSelectedYear as React.Dispatch<
              React.SetStateAction<unknown>
            >,
            State2: selectedYear,
          }}
          handleSecondaryButtonClick={handleDeleteButtonClick}
          setCurrentPage={setCurrentPage}
        >
          {typeOfSearch === "Wo" && searchQuery && modernisationWs !== null ? (
            !isLoadingmodernisationWs ? (
              modernisationWs.length > 0 ? (
                <>
                  <div className="flex items-center gap-[20px] flex-wrap w-full mt-[8px]">
                    {modernisationWs.map(
                      (modernisation: ResModernisation, index: number) => (
                        <div
                          key={modernisation.id}
                          className="group relative flex flex-col flex-grow sm:flex-grow-0 items-start gap-[12px] rounded-[20px] border-[1px] border-[#E6EDFF] w-[48%] lg:w-[31%] cursor-pointer hover:bg-slate-50 hover:shadow-xl transition-all duration-300"
                        >
                          <div
                            className="flex flex-col items-start gap-[12px] w-full px-[24px] py-[16px] relative z-20"
                            onClick={() =>
                              navigate(
                                `/modernisations/${encodeURIComponent(
                                  modernisation.id
                                )}`
                              )
                            }
                          >
                            <h2 className="sm:text-[20.5px] text-[18px] text-primary font-semibold text-nowrap overflow-hidden w-full text-ellipsis whitespace-nowrap">
                              {modernisation.title}
                            </h2>
                            <p
                              className="sm:text-[14px] text-[12px] leading-[21px] text-n500 h-[43px] overflow-hidden text-ellipsis w-full"
                              style={{
                                display: "-webkit-box",
                                WebkitLineClamp: "2",
                                WebkitBoxOrient: "vertical",
                              }}
                            >
                              {modernisation.description}
                            </p>
                            <div className="flex items-center gap-[8px]">
                              <WorkOrderStatus
                                status={modernisation.status}
                                styles={{ fontSize: 10, px: 6, py: 4.5 }}
                              />
                              <WorkOrderpriority
                                priority={modernisation.priority}
                                styles={{ fontSize: 10, px: 6, py: 4.5 }}
                              />
                            </div>
                          </div>

                          <div className="w-full h-[65px] flex items-center justify-between border-t-[1px] border-t-[#E6EDFF] pt-[10px] px-[24px] py-[16px]">
                            {modernisation.assigned_to ? (
                              <div className="w-full flex items-center gap-[5px]">
                                <img
                                  src="/avatar1.png"
                                  alt="avatar"
                                  className="sm:w-[29px] w-[26px]"
                                />
                                <span className="sm:text-[12px] text-[10px] leading-[21px] text-n600">
                                  {modernisation.assigned_to.email}
                                </span>
                              </div>
                            ) : null}
                            {localStorage.getItem("role") === "0" && (
                              <input
                                type="checkbox"
                                name="select-workOrder"
                                id={`${index}`}
                                className="checked:opacity-100 opacity-0 group-hover:opacity-100 peer cursor-pointer w-[15px] h-[15px] transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCheckboxChange(`${modernisation.id}`);
                                }}
                              />
                            )}
                          </div>

                          <span className="absolute top-[18px] right-[18px] text-[14px] font-medium text-primary leading-[19.5px] z-0">
                            {modernisation.id}
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
            ) : (
              <div className="w-full flex items-center justify-center py-[40px]">
                <RotatingLines
                  strokeWidth="4"
                  strokeColor="#4A3AFF"
                  width="60"
                />
              </div>
            )
          ) : modernisations && !isLoading ? (
            <>
              <div className="w-full flex flex-col gap-[40px]">
                <div className="flex items-center gap-[20px] flex-wrap w-full mt-[8px]">
                  {modernisations.map(
                    (modernisation: ResModernisation, index: number) => (
                      <div
                        key={modernisation.id}
                        className="group relative flex flex-col flex-grow sm:flex-grow-0 items-start gap-[12px] rounded-[20px] border-[1px] border-[#E6EDFF] w-[48%] lg:w-[31%] cursor-pointer hover:bg-slate-50 hover:shadow-xl transition-all duration-300"
                      >
                        <div
                          className="flex flex-col items-start gap-[12px] w-full px-[24px] py-[16px] relative z-20"
                          onClick={() =>
                            navigate(
                              `/modernisations/${encodeURIComponent(
                                modernisation.id
                              )}`
                            )
                          }
                        >
                          <h2 className="sm:text-[20.5px] text-[18px] text-primary font-semibold text-nowrap overflow-hidden w-full text-ellipsis whitespace-nowrap">
                            {modernisation.title}
                          </h2>
                          <p
                            className="sm:text-[14px] text-[12px] leading-[21px] text-n500 h-[43px] overflow-hidden text-ellipsis w-full"
                            style={{
                              display: "-webkit-box",
                              WebkitLineClamp: "2",
                              WebkitBoxOrient: "vertical",
                            }}
                          >
                            {modernisation.description}
                          </p>
                          <div className="flex items-center gap-[8px] flex-wrap">
                            <WorkOrderStatus
                              status={modernisation.status}
                              styles={{ fontSize: 10, px: 6, py: 4.5 }}
                            />
                            <WorkOrderpriority
                              priority={modernisation.priority}
                              styles={{ fontSize: 10, px: 6, py: 4.5 }}
                            />
                            {modernisation.report_status === 1 ? (
                              <WorkOrderStatus
                                status="rep"
                                styles={{ fontSize: 10, px: 6, py: 4.5 }}
                              />
                            ) : (
                              <WorkOrderStatus
                                status="noRep"
                                styles={{ fontSize: 10, px: 6, py: 4.5 }}
                              />
                            )}
                            {modernisation.certificate_status === 1 ? (
                              <WorkOrderStatus
                                status="acc"
                                styles={{ fontSize: 10, px: 6, py: 4.5 }}
                              />
                            ) : (
                              <WorkOrderStatus
                                status="noAcc"
                                styles={{ fontSize: 10, px: 6, py: 4.5 }}
                              />
                            )}
                            {modernisation.require_return_voucher ? (
                              modernisation.voucher_status ? (
                                <WorkOrderStatus
                                  status="vo"
                                  styles={{ fontSize: 10, px: 6, py: 4.5 }}
                                />
                              ) : (
                                <WorkOrderStatus
                                  status="noVo"
                                  styles={{ fontSize: 10, px: 6, py: 4.5 }}
                                />
                              )
                            ) : null}
                          </div>
                        </div>

                        <div className="w-full h-[65px] flex items-center justify-between border-t-[1px] border-t-[#E6EDFF] pt-[10px] px-[24px] py-[16px]">
                          {modernisation.assigned_to ? (
                            <div className="w-full flex items-center gap-[5px]">
                              <img
                                src="/avatar1.png"
                                alt="avatar"
                                className="sm:w-[29px] w-[26px]"
                              />
                              <span className="sm:text-[12px] text-[10px] leading-[21px] text-n600">
                                {modernisation.assigned_to.email}
                              </span>
                            </div>
                          ) : null}
                          {localStorage.getItem("role") === "0" && (
                            <input
                              type="checkbox"
                              name="select-workOrder"
                              id={`${index}`}
                              className="checked:opacity-100 opacity-0 group-hover:opacity-100 peer cursor-pointer w-[15px] h-[15px] transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCheckboxChange(`${modernisation.id}`);
                              }}
                            />
                          )}
                        </div>

                        <span className="absolute top-[18px] right-[18px] text-[14px] font-medium text-primary leading-[19.5px] z-0">
                          {modernisation.id}
                        </span>
                      </div>
                    )
                  )}

                  <Pagination
                    buttonTitle="Add modernisations"
                    buttonFunc={handladdMissionButtonClick}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    totalPages={totalPages}
                  />
                </div>
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
                className="w-[230px]"
              />
              <h3 className="text-[30px] font-bold text-n800">
                No Modernisation Founded
              </h3>
            </div>
          )}
        </Main>
      </div>
      <ModernisationPopup
        ref={modernisationDialogRef}
        fetchModernisations={fetchModernisations}
      />
      <DeletePopup
        page="modernisation"
        ref={deleteDialogRef}
        deleteItems={selectedModernisation}
        deleteUrl={`${baseUrl}/modernisation/delete-modernisations`}
        jsonTitle="modernisations"
        fetchFunc={fetchModernisations}
        fetchUrl={`${baseUrl}/modernisation/get-modernisations`}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        limit={limit}
      />
    </div>
  );
};

export default Modernisation;
