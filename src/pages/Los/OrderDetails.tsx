import { useState, useRef, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import handleChange from "../../func/handleChangeFormsInput";
import { getRole } from "../../func/getUserRole";
import { resOfOneOrder } from "../../assets/types/LosCommands";
import { RotatingLines } from "react-loader-spinner";
import Page404 from "../Page404";
//import useWebSocketSearch from "../hooks/useWebSocketSearch";
import CircularProgress from "../../components/CircleProgress";
import Header from "../../components/Header";
import SideBar from "../../components/SideBar";
import { User } from "../../assets/types/User";
import LosStatus from "../../components/los/losStatus";
import WorkOrderpriority from "../../components/workorder/WorkOrderPriorities";
import useWebSocketSearch from "../../hooks/useWebSocketSearch";
import {
  handleAssingLos,
  handleExecuteLos,
  losResult,
  updateLosResult,
  addOrDeleteAlt,
  handleFinishLos,
  generateReport,
  selectCGPS_toWorkWith,
  downloadGeneratedReport,
  approveLineOfSight,
  closeLineOfSight,
} from "../../func/los/orders";
import { losAltTabHeader, losOrdersTabHeader } from "../../assets/los";
import {
  calculateAzimuths,
  calculateDistance,
} from "../../func/los/geographicFunctions";
import { handleOpenDialog } from "../../func/openDialog";
import LosExcutionPopup from "../../components/los/LosExecutionPopup";
import { ResSite } from "../../assets/types/LosSites";
import { NearEndLocation } from "../../assets/types/LosCommands";
import { useSnackbar } from "notistack";
import RequestUpdatePopup from "../../components/los/RequestUpdateReportPopup";
const baseUrl = import.meta.env.VITE_BASE_URL;

const OrderDetails = () => {
  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();

  const [isPageLoading, setIsPageLoading] = useState(true);
  const [HaveAccess, setHaveAccess] = useState(true);

  const [inputWidth, setInputWidth] = useState(380);
  const spanRef = useRef<HTMLSpanElement>(null);
  const executeLosPopupRef = useRef<HTMLDialogElement>(null);
  const reqUpdateReportPopup = useRef<HTMLDialogElement>(null);

  // const [showPriority, setShowPriority] = useState(false);

  const [basicDataOrder, setbasicDataOrder] = useState<{
    title: string;
    id: number | null;
  }>({
    title: "",
    id: null,
  });
  const [order, setOrder] = useState<resOfOneOrder | null>(null);
  const [visibleEngPopup, setVisibleEngPopup] = useState<boolean>(false);
  const [visibleCoordPopup, setVisibleCoordPopup] = useState<boolean>(false);
  const [searchQueryEng, setSearchQueryEng] = useState<string>("");
  const [searchQuerySite, setSearchQuerySite] = useState<string>("");

  const [searchEngs, setSearchEngs] = useState<User[]>([]);
  const [searchSites, setSearchSites] = useState<ResSite[]>([]);

  const [selectedEng, setSelectedEng] = useState<User | null>(null);

  const [loaderAssignSearch, setLoaderAssignSearch] = useState(false);
  const [loaderSiteSearch, setLoaderSiteSearch] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoadingMainButton, setIsLoadingMainButton] = useState(false);

  const [isLoadingAltSites, setIsLoadingAltSites] = useState(false);
  console.log(isLoadingAltSites);
  const [isLoadingDeleteFile, setIsLoadingDeleteFile] = useState(false);
  console.log(setIsLoadingDeleteFile);
  const [isLoadingCancelUpload] = useState(false);
  const [isLoadingAttach] = useState(false);

  const [currentSlide, setCurrentSlide] = useState<1 | 2>(1);

  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(
    null
  );
  const [isLosStatusLoading, setIsLosStatusLoading] = useState(false);
  console.log(isLosStatusLoading);
  const [selectedSiteInfo, setSelectedSiteInfo] = useState<{
    losId: number | null;
    altId: number | null;
    site_type: 1 | 2 | null;
    site_location: NearEndLocation | null;
    losStatus: 1 | 2 | 3 | null;
    accessibility: boolean;
    image_count: number | null;
    siteIndex?: number;
  }>({
    losId: null,
    altId: null,
    site_type: null,
    site_location: null,
    losStatus: null,
    accessibility: true,
    image_count: null,
  });
  const [isLoadingGeneration, setIsLoadingGeneration] = useState(false);
  const [isLoadingChoicingCGPS, setIsLoadingChoicingCGPS] = useState(false);

  const [isLoadingDownloadReport, setIsLoadingDownloadReport] = useState(false);

  const handleDropdownToggle = (index: number) => {
    // Toggle the dropdown for the clicked item
    setOpenDropdownIndex(openDropdownIndex === index ? null : index);
  };

  const fetchOneLOS = useCallback(async () => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return;
    }
    const url = `${baseUrl}/line-of-sight/get-line-of-sight/${encodeURIComponent(
      id!
    )}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      });
      switch (response.status) {
        case 200:
          {
            const data = await response.json();
            // console.log(data)
            setOrder(data);
            setbasicDataOrder({
              title: data.line_of_sight.near_end_location.site_code,
              id: data.line_of_sight.id,
            });
            if (spanRef.current) {
              setInputWidth(spanRef.current.offsetWidth + 45);
            }
            // Sync files with IndexedDB
            // await syncIndexedDBWithFetchedFiles(data.modernisation.id, data);
          }
          break;

        case 403:
          setHaveAccess(false);
          setIsPageLoading(false);
          break;

        case 404:
          setHaveAccess(false);
          setIsPageLoading(false);
          break;

        default: {
          const errorText = await response.text(); // Read the response body as text
          console.error("Error response text: ", errorText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }
    } catch (err) {
      console.error("Error: ", err);
    } finally {
      setIsPageLoading(false);
    }
  }, [id]);
  console.log(order);
  useEffect(() => {
    fetchOneLOS();
  }, [fetchOneLOS]);

  useWebSocketSearch({
    searchQuery: searchQueryEng,
    endpointPath: "search-account/engineer",
    setResults: setSearchEngs,
    setLoader: setLoaderAssignSearch,
  });

  useWebSocketSearch({
    searchQuery: searchQuerySite,
    endpointPath: "search-site",
    setResults: setSearchSites,
    setLoader: setLoaderSiteSearch,
  });

  if (!HaveAccess) {
    return <Page404 />;
  }

  if (isPageLoading) {
    return (
      <div className="w-full h-[100vh] flex items-center justify-center">
        {" "}
        <RotatingLines
          visible={true}
          width="100"
          strokeWidth="4"
          strokeColor="#4A3AFF"
        />
      </div>
    );
  }

  return (
    <div className="w-full flex h-[100vh]">
      <SideBar />
      <div className="lg:pl-[26px] md:pt-[32px] pt-[20px] lg:pr-[30px] sm:px-[30px] px-[15px] pb-[20px] flex flex-col gap-[26px] w-full md:h-[100vh] overflow-y-auto">
        <Header pageSentence="Here is los order details" searchBar={false} />
        {order &&
          (currentSlide === 1 ? (
            <div className="flex flex-col items-end gap-[30px] w-full sm:px-[25px] px-[14px]">
              <div className="flex flex-col gap-[30px] w-full md:border-[1px] md:border-n400 rounded-[20px] md:px-[25px] md:py-[32px]">
                <div className="flex items-center justify-between w-[100%] text-primary font-semibold md:text-[24px] text-[17px]">
                  <>
                    {/* Hidden span to measure text width */}
                    <span
                      ref={spanRef}
                      style={{
                        visibility: "hidden",
                        whiteSpace: "nowrap",
                        position: "absolute",
                      }}
                      className={`text-primary font-semibold md:text-[24px] text-[16px] max-w-[90%] overflow-hidden`}
                    >
                      {`${basicDataOrder.title} | ${basicDataOrder.id}`}
                    </span>

                    <input
                      className={`text-primary font-semibold md:text-[24px] text-[16px] rounded-[20px] py-[7px] sm:px-[20px] px-[8px] bg-white w-[${inputWidth}] max-w-[92%]`}
                      style={{ width: `${inputWidth}px` }}
                      type="text"
                      name="title"
                      disabled={true}
                      value={`${basicDataOrder.title}    ${basicDataOrder.id}`}
                      onChange={(e) => {
                        handleChange(e, setbasicDataOrder);
                      }}
                    />
                  </>
                  {order.line_of_sight.status === 5 &&
                    order.line_of_sight.reject_message && (
                      <div
                        className="relative"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <svg
                          className="peer"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="#DB2C2C"
                          version="1.1"
                          id="Capa_1"
                          width="20px"
                          height="20px"
                          viewBox="0 0 32 32"
                        >
                          <g>
                            <path d="M17.962,24.725l1.806,0.096v2.531h-7.534v-2.406l1.045-0.094c0.568-0.063,0.916-0.254,0.916-1.014v-8.801c0-0.699-0.188-0.92-0.791-0.92l-1.106-0.062v-2.626h5.666L17.962,24.725L17.962,24.725z M15.747,4.648c1.394,0,2.405,1.047,2.405,2.374c0,1.331-1.014,2.313-2.438,2.313c-1.454,0-2.404-0.982-2.404-2.313C13.31,5.695,14.26,4.648,15.747,4.648z M16,32C7.178,32,0,24.822,0,16S7.178,0,16,0c8.82,0,16,7.178,16,16S24.82,32,16,32z M16,3C8.832,3,3,8.832,3,16s5.832,13,13,13s13-5.832,13-13S23.168,3,16,3z" />
                          </g>
                        </svg>
                        <div className="absolute lg:right-0 sm:-right-24 right-0 bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-lg shadow-2xl p-4 sm:text-[14px] text-[12px] text-neutral-700 sm:w-[330px] w-[260px] z-40 hidden peer-hover:flex hover:flex transition-all duration-300 ease-in-out transform hover:scale-105">
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="#FF6B6B"
                                width="16px"
                                height="16px"
                                viewBox="0 0 24 24"
                                className="mr-2"
                              >
                                <path d="M12 2C6.485 2 2 6.485 2 12s4.485 10 10 10 10-4.485 10-10S17.515 2 12 2zm-1 14h2v2h-2v-2zm1-12c-.552 0-1 .448-1 1v9c0 .552.448 1 1 1s1-.448 1-1V5c0-.552-.448-1-1-1z" />
                              </svg>
                            </div>
                            <div className="flex-grow">
                              <span>{order.line_of_sight.reject_message}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                </div>

                <div className="w-full flex flex-col items-start gap-[24px]">
                  <div className="w-fit">
                    <div className="flex items-center gap-x-10 gap-y-4 flex-wrap">
                      {order.alternative_far_ends.map((alt, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 sm:text-[17px] text-[14px] text-n600 leading-[27px]"
                        >
                          <div className="relative group w-fit">
                            <img
                              src="/site.png"
                              alt="site"
                              className={`rounded-full transition duration-300 ease-in-out  ${
                                order.line_of_sight.status < 2 &&
                                "group-hover:blur-[2px]"
                              } `}
                            />

                            <div
                              className={`absolute inset-0 flex items-center justify-center border-n400 border-[2px] rounded-full opacity-0 transition duration-300 ease-in-out ${
                                order.line_of_sight.status < 2 &&
                                "group-hover:opacity-100"
                              }`}
                            >
                              <button
                                className="text-red-500 text-xl font-bold"
                                onClick={() =>
                                  addOrDeleteAlt(
                                    alt.id,
                                    "delete",
                                    setIsLoadingAltSites,
                                    fetchOneLOS
                                  )
                                }
                              >
                                ×
                              </button>
                            </div>
                          </div>

                          <span>{alt.site_location.site_code}</span>
                        </div>
                      ))}
                      <div className="relative z-50">
                        {order.line_of_sight.status < 2 && (
                          <span
                            className="px-[11px] rounded-[50%] relative z-0 bg-[#EDEBFF] hover:bg-[#d5d4f0] cursor-pointer text-primary text-[26px] font-semibold"
                            onClick={() => {
                              setVisibleCoordPopup(!visibleCoordPopup);
                            }}
                          >
                            +
                          </span>
                        )}

                        {visibleCoordPopup && (
                          <div className="sm:w-[400px] w-[280px] max-h-[300px] absolute z-20 bg-white rounded-[20px] rounded-tl-none shadow-lg p-[24px] flex flex-col gap-[21px] items-start top-10 right-0 ">
                            <div className=" relative w-full">
                              <input
                                type="search"
                                name=""
                                id=""
                                value={searchQuerySite}
                                onChange={(eo) => {
                                  setSearchQuerySite(eo.target.value);
                                }}
                                className="w-full h-[38px] rounded-[19px] border-[1px] border-n300 shadow-md px-[35px] md:text-[13px] text-[11px]"
                                placeholder="Search"
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
                            </div>
                            <div className="flex flex-col items-start gap-[12px] w-full  overflow-auto">
                              {loaderSiteSearch ? (
                                <div className="w-full py-[10px] flex items-center justify-center">
                                  <RotatingLines
                                    strokeWidth="4"
                                    strokeColor="#4A3AFF"
                                    width="20"
                                  />
                                </div>
                              ) : searchQuerySite !== "" ? (
                                searchSites !== null &&
                                searchSites.length > 0 ? (
                                  searchSites.map((site, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center gap-[5px] cursor-pointer w-full hover:bg-n300"
                                      onClick={() => {
                                        // Check if the site exist
                                        const codesExists =
                                          order.alternative_far_ends.some(
                                            (alt) =>
                                              alt.site_location.site_code ===
                                              site.code
                                          );

                                        if (!codesExists) {
                                          addOrDeleteAlt(
                                            order.line_of_sight.id,
                                            "add",
                                            setIsLoadingAltSites,
                                            fetchOneLOS,
                                            site.id
                                          );
                                        }
                                        setSearchQuerySite("");
                                        setVisibleCoordPopup(false);
                                      }}
                                    >
                                      <img
                                        src="/site.png"
                                        alt="site"
                                        className="w-[31px] rounded-[50%]"
                                      />
                                      <span className="text-[14px] text-n600">
                                        {site.code}
                                      </span>
                                    </div>
                                  ))
                                ) : (
                                  <span className="text-n700 w-full flex justify-center text-[14px]">
                                    no result founded
                                  </span>
                                )
                              ) : (
                                <span className="text-n700 w-full flex justify-center text-[14px]">
                                  Search for a site
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {order?.line_of_sight.assigned_to !== null ? (
                    <div className="flex items-center gap-[12px] relative">
                      <div
                        className="relative w-[36px] h-[36px] sm:w-[41px] sm:h-[41px] rounded-[50%]"
                        onClick={() => {
                          if (
                            getRole() !== 2 &&
                            order!.line_of_sight.status < 2
                          ) {
                            setVisibleEngPopup(!visibleEngPopup);
                          }
                        }}
                      >
                        <img
                          src="/avatar.png"
                          alt="avatar"
                          className="rounded-[50%] w-full h-full relative z-0"
                        />
                        {getRole() !== 2 && order.line_of_sight.status < 2 && (
                          <span className="bg-550 bg-opacity-0 w-full h-full absolute z-30 top-0 group rounded-[50%] hover:bg-opacity-40 cursor-pointer flex items-center justify-center">
                            <svg
                              className="opacity-0 transition-opacity duration-100 ease-in-out group-hover:opacity-100"
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 20 20"
                              fill="white"
                            >
                              <title>reassign</title>
                              <path d="M15.65 4.35A8 8 0 1 0 17.4 13h-2.22a6 6 0 1 1-1-7.22L11 9h7V2z" />
                            </svg>
                          </span>
                        )}
                      </div>
                      <span className="sm:text-[18px] text-[15px] text-n600 font-medium leading-[27px]">
                        {order?.line_of_sight.assigned_to.email}
                      </span>
                      {visibleEngPopup && (
                        <div className="sm:w-[400px] w-[280px] absolute z-30 bg-white rounded-[20px] rounded-tl-none shadow-lg p-[24px] flex flex-col gap-[21px] items-start top-10 left-4 ">
                          <div className=" relative w-full">
                            <input
                              type="search"
                              name=""
                              id=""
                              value={searchQueryEng}
                              onChange={(eo) => {
                                setSearchQueryEng(eo.target.value);
                              }}
                              className="w-full h-[38px] rounded-[19px] border-[1px] border-n300 shadow-md px-[35px] md:text-[13px] text-[11px]"
                              placeholder="Search"
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
                          </div>
                          <div className="flex flex-col items-start gap-[12px] w-full">
                            <div className="flex items-center gap-[5px] w-full">
                              <span className="px-[9px] rounded-[50%] bg-[#EDEBFF] hover:bg-[#d5d4f0] cursor-pointer text-primary text-[21px] font-semibold">
                                +
                              </span>
                              <span className="text-[14px] text-n600">
                                Create new user
                              </span>
                            </div>
                            {loaderAssignSearch ? (
                              <div className="w-full py-[10px] flex items-center justify-center">
                                <RotatingLines
                                  strokeWidth="4"
                                  strokeColor="#4A3AFF"
                                  width="20"
                                />
                              </div>
                            ) : searchQueryEng !== "" ? (
                              searchEngs !== null && searchEngs.length > 0 ? (
                                searchEngs.map((user, index) => {
                                  return (
                                    <div
                                      key={index}
                                      className="flex items-center gap-[5px] cursor-pointer w-full hover:bg-n300"
                                      /* onClick={() => {
                              handle_Assignment_and_execute(
                                modernisation.line_of_sight.id,
                                "reassign-modernisation",
                                "PATCH",
                                "modernisation",
                                setIsLoading,
                                undefined,
                                user.id
                              );
                              setModernisation((prevState) => ({
                                ...prevState!,
                                modernisation: {
                                  ...prevState!.modernisation,
                                  assigned_to: user,
                                },
                              }));
                              setVisibleEngPopup(false);
                            }}  */
                                    >
                                      <img
                                        src="/avatar.png"
                                        alt="avatar"
                                        className="w-[31px] rounded-[50%]"
                                      />
                                      <div className="flex flex-col items-start">
                                        <span className="text-[14px] text-n600">
                                          {user.first_name} {user.last_name}
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
                                <span className="text-n700 w-full flex justify-center text-[14px]">
                                  no result founded
                                </span>
                              )
                            ) : (
                              <span className="text-n700 w-full flex justify-center text-[14px]">
                                search for engineer
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : selectedEng ? (
                    <div className="relative flex items-center gap-[12px]">
                      <img
                        src="/avatar.png"
                        alt="avatar"
                        className=" rounded-[50%] w-[40px] cursor-pointer"
                        onClick={() => {
                          setVisibleEngPopup(!visibleEngPopup);
                        }}
                      />
                      <span className="text-[17px] text-550 leading-[30px]">
                        {selectedEng.email}
                      </span>
                      {visibleEngPopup && (
                        <div className="sm:w-[400px] w-[280px] absolute z-30 bg-white rounded-[20px] rounded-tl-none shadow-lg p-[24px] flex flex-col gap-[21px] items-start top-10 left-4 ">
                          <div className=" relative w-full">
                            <input
                              type="search"
                              name=""
                              id=""
                              value={searchQueryEng}
                              onChange={(eo) => {
                                setSearchQueryEng(eo.target.value);
                              }}
                              className="w-full h-[38px] rounded-[19px] border-[1px] border-n300 shadow-md px-[35px] md:text-[13px] text-[11px]"
                              placeholder="Search"
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
                          </div>
                          <div className="flex flex-col items-start gap-[12px] w-full">
                            <div className="flex items-center gap-[5px] w-full">
                              <span className="px-[9px] rounded-[50%] bg-[#EDEBFF] hover:bg-[#d5d4f0] cursor-pointer text-primary text-[21px] font-semibold">
                                +
                              </span>
                              <span className="text-[14px] text-n600">
                                Create new user
                              </span>
                            </div>
                            {loaderAssignSearch ? (
                              <div className="w-full py-[10px] flex items-center justify-center">
                                <RotatingLines
                                  strokeWidth="4"
                                  strokeColor="#4A3AFF"
                                  width="20"
                                />
                              </div>
                            ) : searchQueryEng !== "" ? (
                              searchEngs !== null && searchEngs.length > 0 ? (
                                searchEngs.map((user, index) => {
                                  return (
                                    <div
                                      key={index}
                                      className="flex items-center gap-[5px] cursor-pointer w-full hover:bg-n300"
                                      onClick={() => {
                                        setSelectedEng(user);
                                        setVisibleEngPopup(false);
                                      }}
                                    >
                                      <img
                                        src="/avatar.png"
                                        alt="avatar"
                                        className="w-[31px] rounded-[50%]"
                                      />
                                      <div className="flex flex-col items-start">
                                        <span className="text-[14px] text-n600">
                                          {user.first_name} {user.last_name}
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
                                <span className="text-n700 w-full flex justify-center text-[14px]">
                                  no result founded
                                </span>
                              )
                            ) : (
                              <span className="text-n700 w-full flex justify-center text-[14px]">
                                search for engineer
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="relative flex items-center gap-[12px]">
                      <span
                        className="p-[10px] rounded-[50%] bg-[#EDEBFF] hover:bg-[#d5d4f0] cursor-pointer"
                        onClick={() => {
                          setVisibleEngPopup(!visibleEngPopup);
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                        >
                          <path
                            d="M9.99935 3.33366C13.6752 3.33366 16.666 6.32449 16.666 10.0003C16.666 13.6762 13.6752 16.667 9.99935 16.667C6.32352 16.667 3.33268 13.6762 3.33268 10.0003C3.33268 6.32449 6.32352 3.33366 9.99935 3.33366ZM9.99935 1.66699C5.39685 1.66699 1.66602 5.39783 1.66602 10.0003C1.66602 14.6028 5.39685 18.3337 9.99935 18.3337C14.6018 18.3337 18.3327 14.6028 18.3327 10.0003C18.3327 5.39783 14.6018 1.66699 9.99935 1.66699ZM14.166 9.16699H10.8327V5.83366H9.16602V9.16699H5.83268V10.8337H9.16602V14.167H10.8327V10.8337H14.166V9.16699Z"
                            fill="#4A3AFF"
                          />
                        </svg>
                      </span>
                      <span className="text-[17px] text-550 leading-[30px]">
                        Assign user
                      </span>
                      {visibleEngPopup && (
                        <div className="sm:w-[400px] w-[280px] z-30 absolute bg-white rounded-[20px] rounded-tl-none shadow-lg p-[24px] flex flex-col gap-[21px] items-start top-10 left-4 ">
                          <div className=" relative w-full">
                            <input
                              type="search"
                              name=""
                              id=""
                              value={searchQueryEng}
                              onChange={(eo) => {
                                setSearchQueryEng(eo.target.value);
                              }}
                              className="w-full h-[38px] rounded-[19px] border-[1px] border-n300 shadow-md px-[35px] md:text-[13px] text-[11px]"
                              placeholder="Search"
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
                          </div>
                          <div className="flex flex-col items-start gap-[12px] w-full">
                            <div className="flex items-center gap-[5px] w-full">
                              <span className="px-[9px] rounded-[50%] bg-[#EDEBFF] hover:bg-[#d5d4f0] cursor-pointer text-primary text-[21px] font-semibold">
                                +
                              </span>
                              <span className="text-[14px] text-n600">
                                Create new user
                              </span>
                            </div>
                            {loaderAssignSearch ? (
                              <div className="w-full py-[10px] flex items-center justify-center">
                                <RotatingLines
                                  strokeWidth="4"
                                  strokeColor="#4A3AFF"
                                  width="20"
                                />
                              </div>
                            ) : searchQueryEng !== "" ? (
                              searchEngs !== null && searchEngs.length > 0 ? (
                                searchEngs.map((user, index) => {
                                  return (
                                    <div
                                      key={index}
                                      className="flex items-center gap-[5px] cursor-pointer w-full hover:bg-n300"
                                      onClick={() => {
                                        setSelectedEng(user);
                                        setVisibleEngPopup(false);
                                      }}
                                    >
                                      <img
                                        src="/avatar.png"
                                        alt="avatar"
                                        className="w-[31px] rounded-[50%]"
                                      />
                                      <div className="flex flex-col items-start">
                                        <span className="text-[14px] text-n600">
                                          {user.first_name} {user.last_name}
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
                                <span className="text-n700 w-full flex justify-center text-[14px]">
                                  no result founded
                                </span>
                              )
                            ) : (
                              <span className="text-n700 w-full flex justify-center text-[14px]">
                                search for engineer
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <LosStatus
                      status={order.line_of_sight.status}
                      styles={{ fontSize: 13, px: 22, py: 8.5 }}
                    />
                    <WorkOrderpriority
                      priority={order.line_of_sight.priority}
                      styles={{ fontSize: 13, px: 22, py: 8.5 }}
                    />
                    <span className="flex items-center rounded-[100px] py-[8px] px-[17px] bg-[#FFF5F3] text-[13px] font-medium text-[#DB2C2C] leading-5 ">
                      {order.line_of_sight.type.name}
                    </span>
                    <span
                      className={`rounded-full py-[5px] px-[11px] font-bold  ${
                        order.line_of_sight.execute_with_all_alternatives
                          ? "text-[#48C1B5] bg-[#48C1B54D]"
                          : "text-[#DB2C2C] bg-[#fcf0ee]"
                      }`}
                    >
                      {order.line_of_sight.execute_with_all_alternatives
                        ? "✓"
                        : "☓"}
                    </span>
                  </div>
                </div>

                <div className="w-full flex flex-col gap-[6px]">
                  <div className="w-full flex flex-col items-end gap-[16px]">
                    <>
                      <div className="w-full flex flex-col gap-[12px]">
                        {getRole() !== 2 ? (
                          <label
                            htmlFor="attachements"
                            className="text-[17px] text-n700 leading-[30px] font-medium"
                          >
                            Attachements
                          </label>
                        ) : (
                          order!.attachments.length !== 0 && (
                            <label
                              htmlFor="attachements"
                              className="text-[17px] text-n700 leading-[30px] font-medium"
                            >
                              Attachements
                            </label>
                          )
                        )}

                        <div className="flex gap-[20px] flex-wrap">
                          {order?.attachments &&
                            order!.attachments.length > 0 &&
                            order!.attachments.map((attach, index) => {
                              //  .filter((attachment) => !combinedIds.has(attachment.id))     we will add this line latter
                              return (
                                <div
                                  key={index}
                                  className={`cursor-pointer sm:w-[46%] w-full flex items-center justify-between px-[12px] py-[8px]  rounded-[15px] group ${
                                    attach.is_completed
                                      ? "border-[1px] border-n400"
                                      : attach.uploaded_by ===
                                        Number(
                                          Number(
                                            Number(
                                              Number(
                                                Number(
                                                  localStorage.getItem(
                                                    "user_id"
                                                  )!
                                                )
                                              )
                                            )
                                          )
                                        )
                                      ? "border-[2px] border-[#DB2C2C]"
                                      : "border-[2px] border-[#FFB84D]"
                                  }`}
                                  /*  onClick={() => {
                            if (attach.is_completed) {
                              downloadFile(
                                attach.id,
                                "attachment",
                                attach.file_name,
                                "modernisation",
                                (progress) => {
                                  setModernisation((prev) => {
                                    if (!prev) return null;

                                    return {
                                      ...prev,
                                      attachments: prev.attachments.map(
                                        (att) =>
                                          att.id === attach.id
                                            ? {
                                                ...att,
                                                downloadProgress: `${progress.toFixed(
                                                  0
                                                )}`,
                                              }
                                            : att
                                      ),
                                    };
                                  });
                                },
                                () => {
                                  // Reset progress to 0% after download is complete
                                  setModernisation((prev) => {
                                    if (!prev) return null;

                                    return {
                                      ...prev,
                                      attachments: prev.attachments.map(
                                        (att) =>
                                          att.id === attach.id
                                            ? {
                                                ...att,
                                                downloadProgress: `0`,
                                              }
                                            : att
                                      ),
                                    };
                                  });
                                }
                              );
                            }
                          }}  */
                                >
                                  <div className="flex items-center gap-[9px] w-[90%]">
                                    {attach.downloadProgress &&
                                      attach.downloadProgress !== "0" && (
                                        <CircularProgress
                                          progress={parseFloat(
                                            attach.downloadProgress || "0"
                                          )}
                                        />
                                      )}
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
                                        fill={
                                          attach.is_completed
                                            ? "#6F6C8F"
                                            : attach.uploaded_by ===
                                              Number(
                                                localStorage.getItem("user_id")!
                                              )
                                            ? "#DB2C2C"
                                            : " #FFB84D"
                                        }
                                      />
                                    </svg>
                                    <div className="flex flex-col items-start w-full">
                                      <span
                                        className={`text-[13px] font-medium leading-[20px] overflow-hidden w-[90%] text-ellipsis text-nowrap ${
                                          attach.is_completed
                                            ? "text-n600"
                                            : attach.uploaded_by ===
                                              Number(
                                                localStorage.getItem("user_id")!
                                              )
                                            ? "text-[#DB2C2C]"
                                            : "text-[#FFB84D]"
                                        }`}
                                      >
                                        {attach.file_name}
                                      </span>
                                      <span
                                        className={`text-[12px] leading-[20px] ${
                                          attach.is_completed
                                            ? "text-n600"
                                            : attach.uploaded_by ===
                                              Number(
                                                localStorage.getItem("user_id")!
                                              )
                                            ? "text-[#DB2C2C]"
                                            : "text-[#FFB84D]"
                                        }`}
                                      >
                                        {"22.5 mb"}
                                      </span>
                                    </div>
                                  </div>
                                  {getRole() !== 2 &&
                                    (attach.is_completed ? (
                                      <span
                                        className="w-[8%] border-l-[2px] h-full border-n400 px-[3px] text-[12px] hidden group-hover:flex items-center justify-center"
                                        /*  onClick={(e) => {
                                  e.stopPropagation();
                                  upload_or_delete_workorder_files_for_attachements(
                                    modernisation.line_of_sight.id,
                                    attach.id,
                                    "delete",
                                    "modernisation",
                                    setIsLoadingDeleteFile,
                                    fetchOneModernisation
                                  );
                                }}  */
                                      >
                                        {isLoadingDeleteFile ? (
                                          <RotatingLines
                                            visible={true}
                                            width="20"
                                            strokeWidth="3"
                                            strokeColor="#db2323"
                                          />
                                        ) : (
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="17"
                                            height="18"
                                            viewBox="0 0 18 20"
                                            fill="none"
                                          >
                                            <path
                                              fillRule="evenodd"
                                              clipRule="evenodd"
                                              d="M15.412 4.5L14.611 18.117C14.5812 18.6264 14.3577 19.1051 13.9865 19.4551C13.6153 19.8052 13.1243 20.0001 12.614 20H5.386C4.87575 20.0001 4.38475 19.8052 4.0135 19.4551C3.64226 19.1051 3.41885 18.6264 3.389 18.117L2.59 4.5H0.5V3.5C0.5 3.36739 0.552679 3.24021 0.646447 3.14645C0.740215 3.05268 0.867392 3 1 3H17C17.1326 3 17.2598 3.05268 17.3536 3.14645C17.4473 3.24021 17.5 3.36739 17.5 3.5V4.5H15.412ZM7 0.5H11C11.1326 0.5 11.2598 0.552679 11.3536 0.646447C11.4473 0.740215 11.5 0.867392 11.5 1V2H6.5V1C6.5 0.867392 6.55268 0.740215 6.64645 0.646447C6.74021 0.552679 6.86739 0.5 7 0.5ZM6 7L6.5 16H8L7.6 7H6ZM10.5 7L10 16H11.5L12 7H10.5Z"
                                              fill="#db2323"
                                            />
                                          </svg>
                                        )}
                                      </span>
                                    ) : (
                                      attach.uploaded_by ===
                                        Number(
                                          Number(
                                            Number(
                                              Number(
                                                Number(
                                                  localStorage.getItem(
                                                    "user_id"
                                                  )!
                                                )
                                              )
                                            )
                                          )
                                        ) &&
                                      !isLoadingCancelUpload && (
                                        <div className="flex flex-col gap-2 items-center">
                                          <label
                                            className="px-[3px] text-[12px] flex items-center justify-center hover:scale-110 cursor-pointer"
                                            htmlFor="reupload"
                                            /* onClick={async (e) => {
                                      e.stopPropagation();

                                      const fileFromIndexedDB =
                                        await getFilesByIdFromIndexedDB(
                                          attach.id
                                        );
                                      if (fileFromIndexedDB[0]) {
                                        handleFileInputChangeOfResumeUpload(
                                          fileFromIndexedDB[0]
                                        );
                                      } else {
                                        handleLabelClick(
                                          attach.id,
                                          "attachements"
                                        );
                                      }
                                    }}  */
                                          >
                                            <svg
                                              xmlns="http://www.w3.org/2000/svg"
                                              width="14"
                                              height="14"
                                              viewBox="0 0 14 14"
                                              fill="none"
                                            >
                                              <g clipPath="url(#clip0_968_6186)">
                                                <path
                                                  d="M2.63742 4.08301H4.08301C4.40518 4.08301 4.66634 4.34418 4.66634 4.66634C4.66634 4.98851 4.40517 5.24967 4.08301 5.24967H1.74967C1.10534 5.24967 0.583008 4.72734 0.583008 4.08301V1.74967C0.583008 1.42751 0.844178 1.16634 1.16634 1.16634C1.4885 1.16634 1.74967 1.42751 1.74967 1.74967V3.31032C2.49023 2.25647 3.53504 1.44445 4.75298 0.989188C6.21993 0.440844 7.83676 0.447918 9.29888 1.00908C10.761 1.57023 11.9674 2.64674 12.6908 4.03574C13.4142 5.42475 13.6046 7.03036 13.2262 8.55006C12.8478 10.0698 11.9267 11.3986 10.6365 12.2862C9.34619 13.1738 7.77586 13.5589 6.22133 13.369C4.66683 13.179 3.23544 12.4271 2.19688 11.2549C1.28778 10.2288 0.734634 8.9427 0.609987 7.58756C0.580474 7.26678 0.846768 7.00481 1.16894 7.00457C1.4911 7.00428 1.75172 7.26602 1.78774 7.58622C1.90798 8.65482 2.35466 9.66586 3.074 10.4778C3.92288 11.4359 5.09286 12.0505 6.36349 12.2058C7.63411 12.361 8.91768 12.0463 9.97228 11.3207C11.0269 10.5952 11.7798 9.50906 12.0891 8.26691C12.3984 7.02476 12.2427 5.71237 11.6515 4.57703C11.0601 3.4417 10.0741 2.56179 8.879 2.10312C7.68392 1.64444 6.36232 1.63865 5.16328 2.08686C4.14722 2.46665 3.27859 3.15022 2.6713 4.03768C2.66058 4.05334 2.64927 4.06845 2.63742 4.08301Z"
                                                  fill="#C70000"
                                                />
                                              </g>
                                              <defs>
                                                <clipPath id="clip0_968_6186">
                                                  <rect
                                                    width="14"
                                                    height="14"
                                                    fill="white"
                                                  />
                                                </clipPath>
                                              </defs>
                                            </svg>
                                          </label>
                                          <span
                                            className="px-[3px] rounded-[50%] text-white bg-[#f33e3e] text-[12px] cursor-pointer hover:scale-105"
                                            /* onClick={() => {
                                      handleCancelUpload(
                                        attach.id,
                                        undefined,
                                        undefined,
                                        setIsLoadingCancelUpload,
                                        fetchOneModernisation
                                      );  
                                    }}  */
                                          >
                                            🗙
                                          </span>
                                        </div>
                                      )
                                    ))}
                                </div>
                              );
                            })}

                          {/* uploadedAttachOnCreation.length !== 0 &&
                  uploadedAttachOnCreation
                    .filter(
                      (attach) =>
                        attach.workorder === modernisation.line_of_sight.id
                    )
                    .map((attach, index) => {
                      return (
                        <div
                          key={index}
                          className={`cursor-pointer sm:w-[46%] w-full flex items-center justify-between px-[12px] py-[8px] rounded-[15px] group border-[1px] border-n400`}
                          onClick={() => {
                            downloadFile(
                              attach.id,
                              "attachment",
                              attach.file_name,
                              "modernisation",
                              (progress) => {
                                dispatch(
                                  setDownloadProgress({
                                    id: attach.id,
                                    progress: `${progress.toFixed(0)}`,
                                  })
                                );
                              },
                              () => {
                                // Reset progress to 0% after download is complete
                                dispatch(
                                  setDownloadProgress({
                                    id: attach.id,
                                    progress: "0",
                                  })
                                );
                              }
                            );
                          }}
                        >
                          <div className="flex items-center gap-[9px] w-[90%]">
                            {attach.downloadProgress &&
                              attach.downloadProgress !== "0" && (
                                <CircularProgress
                                  progress={parseFloat(
                                    attach.downloadProgress || "0"
                                  )}
                                />
                              )}
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
                            <div className="flex flex-col items-start w-full">
                              <span
                                className={`text-[13px] font-medium leading-[20px] overflow-hidden w-[90%] text-ellipsis text-nowrap text-n600`}
                              >
                                {attach.file_name}
                              </span>
                              <span
                                className={`text-[12px] leading-[20px] text-n600`}
                              >
                                {"22.5 mb"}
                              </span>
                            </div>
                          </div>
                          {getRole() !== 2 && (
                            <span
                              className={`w-[8%] border-l-[2px] h-full border-n400 px-[3px] text-[12px] hidden group-hover:flex items-center justify-centers`}
                              onClick={async (e) => {
                                e.stopPropagation();

                                await upload_or_delete_workorder_files_for_attachements(
                                  modernisation.line_of_sight.id,
                                  attach.id,
                                  "delete",
                                  "modernisation",
                                  setIsLoadingDeleteFile,
                                  fetchOneModernisation
                                );
                                //await fetchOneModernisation ();
                                dispatch(
                                  removeAttachOnCreationArray(attach.id)
                                );
                              }}
                            >
                              {isLoadingDeleteFile ? (
                                <RotatingLines
                                  visible={true}
                                  width="20"
                                  strokeWidth="3"
                                  strokeColor="#db2323"
                                />
                              ) : (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="17"
                                  height="18"
                                  viewBox="0 0 18 20"
                                  fill="none"
                                >
                                  <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M15.412 4.5L14.611 18.117C14.5812 18.6264 14.3577 19.1051 13.9865 19.4551C13.6153 19.8052 13.1243 20.0001 12.614 20H5.386C4.87575 20.0001 4.38475 19.8052 4.0135 19.4551C3.64226 19.1051 3.41885 18.6264 3.389 18.117L2.59 4.5H0.5V3.5C0.5 3.36739 0.552679 3.24021 0.646447 3.14645C0.740215 3.05268 0.867392 3 1 3H17C17.1326 3 17.2598 3.05268 17.3536 3.14645C17.4473 3.24021 17.5 3.36739 17.5 3.5V4.5H15.412ZM7 0.5H11C11.1326 0.5 11.2598 0.552679 11.3536 0.646447C11.4473 0.740215 11.5 0.867392 11.5 1V2H6.5V1C6.5 0.867392 6.55268 0.740215 6.64645 0.646447C6.74021 0.552679 6.86739 0.5 7 0.5ZM6 7L6.5 16H8L7.6 7H6ZM10.5 7L10 16H11.5L12 7H10.5Z"
                                    fill="#db2323"
                                  />
                                </svg>
                              )}
                            </span>
                          )}
                        </div>
                      );
                    })  */}
                          {/* uploadingFiles.attachFiles.length !== 0 &&
                  uploadingFiles.attachFiles
                    .filter((attach) =>
                      modernisation.attachments.some(
                        (attachment) => attachment.id === attach.id
                      )
                    )
                    .map((attach, index) => {
                      return (
                        <div className=" w-[100%] sm:w-[46%]" key={index}>
                          <UploadingFile
                            key={index}
                            fetchFunc={fetchOneModernisation}
                            id={attach.id}
                            progress={attach.progress}
                            file={attach.file}
                            fileType="attachements"
                          />
                        </div>
                      );
                    })  */}
                          {getRole() !== 2 && (
                            <div
                              className="flex flex-col sm:w-[46%] w-full"
                              onDragOver={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                              /* onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const files = e.dataTransfer.files;

                      // Ensure files is not null and handle each file
                      if (files) {
                        Array.from(files).forEach(async (file) => {
                          await handleFileChange(
                            dispatch,
                            modernisation.line_of_sight.id,
                            "attachements",
                            "modernisation",
                            file,
                            setIsLoadingAttach,
                            fetchOneModernisation,
                            fileInputRef
                          );
                        });
                      }
                    }}  */
                            >
                              <input
                                type="file"
                                name="attachement"
                                id="attachement"
                                accept=".doc,.docx,.xls,.xlsx,.ppt,.pptx,.pdf,.txt,.jpg,.jpeg,.png,.gif,.bmp,.webp,.svg"
                                ref={fileInputRef}
                                /*  onChange={async (e) => {
                        const file = e.target.files
                          ? e.target.files[0]
                          : null;
                        if (file) {
                          await handleFileChange(
                            dispatch,
                            modernisation.line_of_sight.id,
                            "attachements",
                            "modernisation",
                            file,
                            setIsLoadingAttach,
                            fetchOneModernisation,
                            fileInputRef
                          );
                        }
                      }}  */
                                className="hidden"
                              />
                              <label
                                htmlFor="attachement"
                                className="cursor-pointer w-full px-[12px] py-[15px] flex items-center justify-start gap-[14px] border-dashed border-[2px] border-n400 rounded-[15px]"
                              >
                                {isLoadingAttach ? (
                                  <div className="w-full flex items-center justify-center">
                                    <RotatingLines
                                      visible={true}
                                      width="20"
                                      strokeWidth="3"
                                      strokeColor="#4A3AFF"
                                    />
                                  </div>
                                ) : (
                                  <>
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
                                      <span className="text-primary">
                                        choose files
                                      </span>
                                    </span>
                                  </>
                                )}
                              </label>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  </div>
                </div>
                <div className="w-full flex justify-end">
                  {(order.line_of_sight.status < 4 ||
                    order.line_of_sight.status === 5) && (
                    <button
                      className={`${
                        order.line_of_sight.status === 0
                          ? selectedEng
                            ? "text-primary border-primary"
                            : "text-n500 cursor-not-allowed border-n500"
                          : order.line_of_sight.status === 1
                          ? "bg-primary text-white"
                          : "text-primary border-primary"
                      }  border-[2px] rounded-[30px] font-semibold leading-5 py-[10px] px-[30px]`}
                      onClick={() => {
                        order.line_of_sight.status === 0
                          ? handleAssingLos(
                              order.line_of_sight.id,
                              selectedEng!.id,
                              setIsLoadingMainButton,
                              fetchOneLOS
                            )
                          : order.line_of_sight.status === 1
                          ? handleExecuteLos(
                              order.line_of_sight.id,
                              setIsLoadingMainButton,
                              setCurrentSlide,
                              fetchOneLOS
                            )
                          : order.line_of_sight.status === 2 ||
                            order.line_of_sight.status === 3 ||
                            order.line_of_sight.status === 5
                          ? setCurrentSlide(2)
                          : null;
                      }}
                    >
                      {isLoadingMainButton ? (
                        <RotatingLines
                          visible={true}
                          width="20"
                          strokeWidth="3"
                          strokeColor={
                            order.line_of_sight.status === 0
                              ? "#4A3AFF"
                              : "#FFF"
                          }
                        />
                      ) : order.line_of_sight.status === 0 ? (
                        "Assign"
                      ) : order.line_of_sight.status === 1 ? (
                        "Execute"
                      ) : order.line_of_sight.status === 2 ? (
                        "continue execution ->"
                      ) : (
                        "Open exection"
                      )}
                    </button>
                  )}
                </div>
              </div>

              {order.line_of_sight.status === 3 && getRole() !== 2 && (
                <div className="w-full flex flex-col items-center gap-4 md:border-[1px] md:border-n400 rounded-[20px] md:p-[20px]">
                  <div className="flex flex-col w-full">
                    <div className="flex items-center w-full border-b-[1px] border-b-[#E6EDFF] py-4">
                      {losOrdersTabHeader.map((header, index) => {
                        return (
                          <span
                            key={index}
                            className={`flex items-center justify-center text-[13px] text-n800 font-medium `}
                            style={{ width: `${header.width}` }}
                          >
                            {header.title}
                          </span>
                        );
                      })}
                    </div>
                    <div className="flex items-center w-full border-b-[1px] border-b-[#E6EDFF] py-4">
                      <div className="w-[10%] flex items-center justify-center">
                        <span className="text-[12px] text-n800">
                          {order.line_of_sight.near_end_location.site_code}
                        </span>
                      </div>
                      <div className="w-[14%] flex items-center justify-center">
                        <span className="text-[12px] text-n800">
                          {order.line_of_sight.near_end_location.longitude.toFixed(
                            6
                          )}
                        </span>
                      </div>
                      <div className="w-[14%] flex items-center justify-center">
                        <span className="text-[12px] text-n800">
                          {order.line_of_sight.near_end_location.latitude.toFixed(
                            6
                          )}
                        </span>
                      </div>
                      <div className="w-[14%] flex items-center justify-center">
                        <span className="text-[12px] text-n800">
                          {order.line_of_sight.execution_cgps.longitude.toFixed(
                            6
                          )}
                        </span>
                      </div>
                      <div className="w-[14%] flex items-center justify-center">
                        <span className="text-[12px] text-n800">
                          {order.line_of_sight.execution_cgps.latitude.toFixed(
                            6
                          )}
                        </span>
                      </div>

                      <div className="w-[10%] flex items-center justify-center">
                        <span className="text-[12px] text-n800">0 km</span>
                      </div>
                      <div className="w-[10%] flex items-center justify-center">
                        <span className="p-[7px] rounded-full bg-sec cursor-pointer">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                          >
                            <path
                              d="M14 2.23438L13.297 2.54688L9.9845 3.96837L6.172 2.53087L5.9845 2.46837L5.797 2.54688L2.297 4.04688L2 4.17188V13.7649L2.703 13.4524L6.0155 12.0309L9.828 13.4684L10.0155 13.5309L10.203 13.4524L13.703 11.9524L14 11.8274V2.23438ZM6.5 3.71837L9.5 4.84338V12.2814L6.5 11.1564V3.71837ZM5.5 3.74988V11.1719L3 12.2499V4.82788L5.5 3.74988ZM13 3.74988V11.1719L10.5 12.2499V4.82788L13 3.74988Z"
                              fill="#4A3AFF"
                            />
                          </svg>
                        </span>
                      </div>
                      <div className="w-[14%] flex gap-[6px] items-center justify-center">
                        <div className="items-center gap-[7px] hidden sm:flex">
                          <input
                            type="checkbox"
                            id={`CGPS-${order.line_of_sight.id}`}
                            className="hidden peer"
                            checked={
                              order.line_of_sight.execution_cgps.is_valid
                            }
                            onChange={(e) => {
                              console.log("first");
                              if (!isLoadingChoicingCGPS) {
                                if (e.target.checked) {
                                  selectCGPS_toWorkWith(
                                    order.line_of_sight.id,
                                    1,
                                    "suggested",
                                    setIsLoadingChoicingCGPS,
                                    fetchOneLOS
                                  );
                                } else {
                                  selectCGPS_toWorkWith(
                                    order.line_of_sight.id,
                                    1,
                                    "original",
                                    setIsLoadingChoicingCGPS,
                                    fetchOneLOS
                                  );
                                }
                              }
                            }}
                          />
                          <label
                            htmlFor={`CGPS-${order.line_of_sight.id}`}
                            className="w-[24px] h-[24px] rounded-full border-2 border-gray-400 peer-checked:bg-primary flex items-center justify-center cursor-pointer"
                          >
                            <svg
                              className="text-white hidden"
                              xmlns="http://www.w3.org/2000/svg"
                              width="12"
                              height="10"
                              viewBox="0 0 12 10"
                              fill="none"
                            >
                              <path
                                d="M4 9.4L0 5.4L1.4 4L4 6.6L10.6 0L12 1.4L4 9.4Z"
                                fill="white"
                              />
                            </svg>
                          </label>
                        </div>
                      </div>
                    </div>
                    {order.alternative_far_ends
                      .filter((alt) => alt.los_status !== null)
                      .map((alt, index) => {
                        return (
                          <div
                            key={index}
                            className="flex items-center w-full border-b-[1px] border-b-[#E6EDFF] py-4"
                          >
                            <div className="w-[10%] flex items-center justify-center">
                              <span className="text-[12px] text-n800">
                                {alt.site_location.site_code}
                              </span>
                            </div>
                            <div className="w-[14%] flex items-center justify-center">
                              <span className="text-[12px] text-n800">
                                {alt.site_location.longitude.toFixed(6)}
                              </span>
                            </div>
                            <div className="w-[14%] flex items-center justify-center">
                              <span className="text-[12px] text-n800">
                                {alt.site_location.latitude.toFixed(6)}
                              </span>
                            </div>
                            <div className="w-[14%] flex items-center justify-center">
                              <span className="text-[12px] text-n800">
                                {alt.execution_cgps.longitude.toFixed(6)}
                              </span>
                            </div>
                            <div className="w-[14%] flex items-center justify-center">
                              <span className="text-[12px] text-n800">
                                {alt.execution_cgps.latitude.toFixed(6)}
                              </span>
                            </div>

                            <div className="w-[10%] flex items-center justify-center">
                              <span className="text-[12px] text-n800">
                                {calculateDistance(
                                  {
                                    latitude: alt.site_location.latitude,
                                    longitude: alt.site_location.longitude,
                                  },
                                  {
                                    latitude:
                                      order.line_of_sight.near_end_location
                                        .latitude,
                                    longitude:
                                      order.line_of_sight.near_end_location
                                        .longitude,
                                  }
                                ).toFixed(2)}
                                km
                              </span>
                            </div>
                            <div className="w-[10%] flex items-center justify-center">
                              <span className="p-[7px] rounded-full bg-sec cursor-pointer">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 16 16"
                                  fill="none"
                                >
                                  <path
                                    d="M14 2.23438L13.297 2.54688L9.9845 3.96837L6.172 2.53087L5.9845 2.46837L5.797 2.54688L2.297 4.04688L2 4.17188V13.7649L2.703 13.4524L6.0155 12.0309L9.828 13.4684L10.0155 13.5309L10.203 13.4524L13.703 11.9524L14 11.8274V2.23438ZM6.5 3.71837L9.5 4.84338V12.2814L6.5 11.1564V3.71837ZM5.5 3.74988V11.1719L3 12.2499V4.82788L5.5 3.74988ZM13 3.74988V11.1719L10.5 12.2499V4.82788L13 3.74988Z"
                                    fill="#4A3AFF"
                                  />
                                </svg>
                              </span>
                            </div>
                            <div className="w-[14%] flex gap-[6px] items-center justify-center">
                              <div className="items-center gap-[7px] hidden sm:flex">
                                <input
                                  type="checkbox"
                                  id={`CGPS-${alt.id}`}
                                  className="hidden peer"
                                  checked={alt.execution_cgps.is_valid}
                                  onChange={(e) => {
                                    console.log("first");
                                    if (!isLoadingChoicingCGPS) {
                                      if (e.target.checked) {
                                        selectCGPS_toWorkWith(
                                          alt.id,
                                          2,
                                          "suggested",
                                          setIsLoadingChoicingCGPS,
                                          fetchOneLOS
                                        );
                                      } else {
                                        selectCGPS_toWorkWith(
                                          alt.id,
                                          2,
                                          "original",
                                          setIsLoadingChoicingCGPS,
                                          fetchOneLOS
                                        );
                                      }
                                    }
                                  }}
                                />
                                <label
                                  htmlFor={`CGPS-${alt.id}`}
                                  className="w-[24px] h-[24px] rounded-full border-2 border-gray-400 peer-checked:bg-primary flex items-center justify-center cursor-pointer"
                                >
                                  <svg
                                    className="text-white hidden"
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="12"
                                    height="10"
                                    viewBox="0 0 12 10"
                                    fill="none"
                                  >
                                    <path
                                      d="M4 9.4L0 5.4L1.4 4L4 6.6L10.6 0L12 1.4L4 9.4Z"
                                      fill="white"
                                    />
                                  </svg>
                                </label>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  <button
                    className="flex items-center justify-center rounded-[30px] font-semibold leading-5 py-[10px] px-[30px] text-white bg-primary"
                    onClick={() => {
                      generateReport(
                        order.line_of_sight.id,
                        setIsLoadingGeneration,
                        fetchOneLOS
                      );
                    }}
                  >
                    {isLoadingGeneration ? (
                      <RotatingLines
                        strokeWidth="4"
                        strokeColor="#fff"
                        width="20"
                      />
                    ) : (
                      "Generate"
                    )}
                  </button>
                </div>
              )}

              {order.line_of_sight.status > 3 && (
                <div className="w-full flex flex-col items-start gap-4 md:border-[1px] md:border-n400 rounded-[20px] md:p-[20px]">
                  <h1 className="text-[24px] font-semibold text-primary">
                    Reports
                  </h1>
                  <div
                    className="relative p-[15px] cursor-pointer h-[60px] shadow-lg shadow-slate-200 rounded-[15px] flex flex-col items-start justify-start gap-3 sm:w-1/4 w-full"
                    onClick={() => {
                      if (!isLoadingDownloadReport) {
                        downloadGeneratedReport(
                          order.line_of_sight.id,
                          setIsLoadingDownloadReport
                        );
                      }
                    }}
                  >
                    <span className="text-n700 font-medium text-[15px]">
                      Report.pdf
                    </span>
                    {isLoadingDownloadReport ? (
                      <div className="absolute top-4 right-4">
                        <RotatingLines
                          visible={true}
                          width="20"
                          strokeWidth="3"
                          strokeColor={"#4A3AFF"}
                        />
                      </div>
                    ) : (
                      <svg
                        className="absolute top-4 right-4"
                        xmlns="http://www.w3.org/2000/svg"
                        width="17"
                        height="17"
                        viewBox="0 0 17 17"
                        fill="none"
                      >
                        <path
                          d="M2.92188 14.875C2.42874 14.875 1.9558 14.6791 1.6071 14.3304C1.2584 13.9817 1.0625 13.5088 1.0625 13.0156V10.3594C1.0625 10.148 1.14646 9.94534 1.2959 9.7959C1.44534 9.64646 1.64803 9.5625 1.85938 9.5625C2.07072 9.5625 2.27341 9.64646 2.42285 9.7959C2.57229 9.94534 2.65625 10.148 2.65625 10.3594V13.0156C2.65625 13.1623 2.77525 13.2812 2.92188 13.2812H14.0781C14.1486 13.2812 14.2161 13.2533 14.266 13.2035C14.3158 13.1536 14.3438 13.0861 14.3438 13.0156V10.3594C14.3438 10.148 14.4277 9.94534 14.5771 9.7959C14.7266 9.64646 14.9293 9.5625 15.1406 9.5625C15.352 9.5625 15.5547 9.64646 15.7041 9.7959C15.8535 9.94534 15.9375 10.148 15.9375 10.3594V13.0156C15.9375 13.5088 15.7416 13.9817 15.3929 14.3304C15.0442 14.6791 14.5713 14.875 14.0781 14.875H2.92188Z"
                          fill="#514F6E"
                        />
                        <path
                          d="M7.70263 8.16956V2.125C7.70263 1.91366 7.78659 1.71097 7.93603 1.56152C8.08547 1.41208 8.28816 1.32813 8.4995 1.32812C8.71085 1.32812 8.91354 1.41208 9.06298 1.56152C9.21242 1.71097 9.29638 1.91366 9.29638 2.125V8.16956L11.3895 6.0775C11.4635 6.00355 11.5512 5.94489 11.6479 5.90487C11.7445 5.86484 11.848 5.84425 11.9526 5.84425C12.0572 5.84425 12.1608 5.86484 12.2574 5.90487C12.354 5.94489 12.4418 6.00355 12.5158 6.0775C12.5897 6.15145 12.6484 6.23924 12.6884 6.33586C12.7284 6.43248 12.749 6.53604 12.749 6.64062C12.749 6.74521 12.7284 6.84876 12.6884 6.94539C12.6484 7.04201 12.5897 7.1298 12.5158 7.20375L9.06263 10.6569C8.91321 10.8061 8.71068 10.8899 8.4995 10.8899C8.28833 10.8899 8.08579 10.8061 7.93638 10.6569L4.48325 7.20375C4.4093 7.1298 4.35064 7.04201 4.31062 6.94539C4.2706 6.84876 4.25 6.74521 4.25 6.64062C4.25 6.53604 4.2706 6.43248 4.31062 6.33586C4.35064 6.23924 4.4093 6.15145 4.48325 6.0775C4.5572 6.00355 4.645 5.94489 4.74162 5.90487C4.83824 5.86484 4.9418 5.84425 5.04638 5.84425C5.15096 5.84425 5.25452 5.86484 5.35114 5.90487C5.44776 5.94489 5.53555 6.00355 5.6095 6.0775L7.70263 8.16956Z"
                          fill="#514F6E"
                        />
                      </svg>
                    )}
                  </div>
                  {order.line_of_sight.status > 3 &&
                    order.line_of_sight.status < 7 &&
                    order.line_of_sight.status !== 5 &&
                    getRole() !== 2 && (
                      <div className="w-full flex items-center justify-end gap-4 mt-4">
                        <button
                          className="flex items-center justify-center px-[45px] py-[10px] rounded-[56px] bg-[#DB2C2C1A] text-[15px] text-[#DB2C2C] font-medium"
                          onClick={() => {
                            handleOpenDialog(reqUpdateReportPopup);
                          }}
                        >
                          Reject
                        </button>
                        <button
                          className={`flex items-center justify-center px-[45px] py-[10px] rounded-[56px] text-[15px] font-medium ${
                            isLoadingGeneration
                              ? "cursor-not-allowed opacity-70"
                              : order.line_of_sight.status === 4
                              ? "bg-[#C9EDE963] text-[#48C1B5]" // Accept button colors
                              : order.line_of_sight.status === 6
                              ? "bg-[#D3E8D9] text-[#888888]" // Close (final/archived) colors
                              : "bg-gray-200 text-gray-500" // Default disabled state
                          }`}
                          onClick={() => {
                            if (isLoadingGeneration) return; // Prevent interaction during loading
                            if (order.line_of_sight.status === 4) {
                              approveLineOfSight(
                                order.line_of_sight.id,
                                setIsLoadingGeneration,
                                fetchOneLOS
                              );
                            } else if (order.line_of_sight.status === 6) {
                              closeLineOfSight(
                                order.line_of_sight.id,
                                setIsLoadingGeneration,
                                fetchOneLOS
                              );
                            }
                          }}
                        >
                          {isLoadingGeneration ? (
                            <RotatingLines
                              visible={true}
                              width="20"
                              strokeWidth="3"
                              strokeColor={"#111"}
                            />
                          ) : order.line_of_sight.status === 4 ? (
                            "Accept"
                          ) : (
                            "Close"
                          )}
                        </button>
                      </div>
                    )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-start gap-8">
              <h2 className="text-[20px] font-semibold text-n800">Los order</h2>
              <div className="flex flex-col w-full px-[25px]">
                <div className="flex items-center w-full border-b-[1px] border-b-[#E6EDFF] py-4">
                  {losAltTabHeader.map((header, index) => {
                    return (
                      <span
                        key={index}
                        className={`flex items-center justify-center text-[14px] text-n800 font-medium w-[${header.width}]`}
                      >
                        {header.title}
                      </span>
                    );
                  })}
                </div>
                {order.alternative_far_ends.map((alt, index) => {
                  return (
                    <div
                      key={index}
                      className={`flex items-center w-full border-b-[1px] border-b-[#E6EDFF] py-4 ${
                        !order.line_of_sight.execute_with_all_alternatives &&
                        index !== 0 &&
                        (order.alternative_far_ends[index - 1].los_status ===
                          null ||
                          order.alternative_far_ends[index - 1].los_status ===
                            1)
                          ? "cursor-not-allowed pointer-events-none"
                          : ""
                      }`}
                    >
                      <div className="w-[17%] flex items-center justify-center">
                        <span
                          className={`relative flex items-center justify-between rounded-[25px] px-[22px] py-[5px] text-[14px] group  ${
                            !order.line_of_sight
                              .execute_with_all_alternatives &&
                            index !== 0 &&
                            (order.alternative_far_ends[index - 1]
                              .los_status === null ||
                              order.alternative_far_ends[index - 1]
                                .los_status === 1)
                              ? "bg-n300 text-n500"
                              : order.line_of_sight.near_end_accessibility
                              ? alt.executed.near_end
                                ? "bg-[#48C1B521] text-[#48C1B5] cursor-pointer"
                                : "bg-[#FFC46B42] text-[#FFAA29] cursor-pointer"
                              : "bg-[#DB2C2C1A] text-[#DB2C2C] cursor-pointer"
                          }`}
                          onClick={() => {
                            setSelectedSiteInfo(() => ({
                              losId: order.line_of_sight.id,
                              altId: alt.id,
                              site_type: 1,
                              site_location:
                                order.line_of_sight.near_end_location,
                              losStatus: alt.los_status,
                              accessibility:
                                order.line_of_sight.near_end_accessibility,
                              image_count: alt.image_count.near_end,
                              siteIndex: index,
                            }));

                            handleOpenDialog(executeLosPopupRef);
                          }}
                        >
                          <span className="truncate">
                            {order.line_of_sight.near_end_location.site_code}
                          </span>

                          {/* Gallery Icon and Image Count */}
                          <div className="absolute right-[-20px] top-[7px] transform -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 flex items-center gap-1 text-gray-700 p-1 rounded-full bg-n300 shadow-lg transition-opacity duration-300">
                            {" "}
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-[14px] h-[14px]"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M21 20H3V4h18v16zM5 18h14V6H5v12zm7-8c-1.38 0-2.5-1.12-2.5-2.5S10.62 5 12 5s2.5 1.12 2.5 2.5S13.38 10 12 10zm0-1c.83 0 1.5-.67 1.5-1.5S12.83 6 12 6s-1.5.67-1.5 1.5S11.17 9 12 9zm-5 9l3.5-4.5 2.5 3 4-6 5 7H7z" />
                            </svg>
                            <span className="text-[11px] font-medium">
                              {alt.image_count.near_end || 0}
                            </span>
                          </div>
                        </span>
                      </div>
                      <div className="w-[17%] flex items-center justify-center">
                        <span
                          className={`relative rounded-[25px] px-[22px] py-[5px]  text-[14px] group  ${
                            !order.line_of_sight
                              .execute_with_all_alternatives &&
                            index !== 0 &&
                            (order.alternative_far_ends[index - 1]
                              .los_status === null ||
                              order.alternative_far_ends[index - 1]
                                .los_status === 1)
                              ? "bg-n300 text-n500"
                              : alt.far_end_accessibility
                              ? alt.executed.far_end
                                ? "bg-[#48C1B521] text-[#48C1B5] cursor-pointer"
                                : "bg-[#FFC46B42] text-[#FFAA29] cursor-pointer"
                              : "bg-[#DB2C2C1A] text-[#DB2C2C] cursor-pointer"
                          }`}
                          onClick={() => {
                            setSelectedSiteInfo(() => ({
                              losId: order.line_of_sight.id,
                              altId: alt.id,
                              site_type: 2,
                              site_location: alt.site_location,
                              losStatus: alt.los_status,
                              accessibility: alt.far_end_accessibility,
                              image_count: alt.image_count.far_end,
                            }));
                            handleOpenDialog(executeLosPopupRef);
                          }}
                        >
                          {alt.site_location.site_code}

                          {/* Gallery Icon and Image Count */}
                          <div className="absolute right-[-20px] top-[7px] transform -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 flex items-center gap-1 text-gray-700 p-1 rounded-full bg-n300 shadow-lg transition-opacity duration-300">
                            {" "}
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-[14px] h-[14px]"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M21 20H3V4h18v16zM5 18h14V6H5v12zm7-8c-1.38 0-2.5-1.12-2.5-2.5S10.62 5 12 5s2.5 1.12 2.5 2.5S13.38 10 12 10zm0-1c.83 0 1.5-.67 1.5-1.5S12.83 6 12 6s-1.5.67-1.5 1.5S11.17 9 12 9zm-5 9l3.5-4.5 2.5 3 4-6 5 7H7z" />
                            </svg>
                            <span className="text-[11px] font-medium">
                              {alt.image_count.far_end || 0}
                            </span>
                          </div>
                        </span>
                      </div>
                      <div className="w-[17%] flex items-end gap-3 justify-center">
                        <span
                          className={`text-[15px] ${
                            alt.los_status === 1
                              ? "text-[#48C1B5]"
                              : alt.los_status === 2
                              ? "text-[#F5A623]"
                              : alt.los_status === 3
                              ? "text-[#DB2C2C]"
                              : "text-n500"
                          } `}
                        >
                          {alt.los_status === 1
                            ? "Positive"
                            : alt.los_status === 2
                            ? "Critical"
                            : alt.los_status === 3
                            ? "Negative"
                            : "unknown"}
                        </span>
                        <div className="relative">
                          <svg
                            className="cursor-pointer"
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            onClick={() => handleDropdownToggle(index)}
                          >
                            <g clip-path="url(#clip0_3005_9269)">
                              <path
                                fill-rule="evenodd"
                                clip-rule="evenodd"
                                d="M8.70855 10.7063C8.52105 10.8935 8.26689 10.9987 8.00189 10.9987C7.73689 10.9987 7.48272 10.8935 7.29522 10.7063L3.52322 6.9356C3.33571 6.748 3.23041 6.4936 3.23047 6.22836C3.23053 5.96313 3.33596 5.70878 3.52355 5.52127C3.71115 5.33376 3.96555 5.22845 4.23079 5.22852C4.49603 5.22858 4.75038 5.334 4.93789 5.5216L8.00189 8.5856L11.0659 5.5216C11.2544 5.33935 11.507 5.23844 11.7692 5.24059C12.0314 5.24274 12.2822 5.34779 12.4677 5.53312C12.6532 5.71844 12.7585 5.9692 12.7609 6.2314C12.7633 6.4936 12.6626 6.74625 12.4806 6.93493L8.70922 10.7069L8.70855 10.7063Z"
                                fill="#A0A3BD"
                              />
                            </g>
                            <defs>
                              <clipPath id="clip0_3005_9269">
                                <rect width="16" height="16" fill="white" />
                              </clipPath>
                            </defs>
                          </svg>
                          {openDropdownIndex === index && (
                            <div className="absolute flex flex-col items-center gap-[10px] z-40 bg-white shadow-lg shadow-slate-300 rounded-[22px] p-4">
                              {alt.los_status !== 1 && (
                                <span
                                  className="text-[14px] text-[#48C1B5] cursor-pointer"
                                  onClick={() => {
                                    {
                                      alt.los_status
                                        ? updateLosResult(
                                            alt.id,
                                            1,
                                            setIsLosStatusLoading,
                                            setOpenDropdownIndex,
                                            fetchOneLOS
                                          )
                                        : losResult(
                                            alt.id,
                                            1,
                                            setIsLosStatusLoading,
                                            setOpenDropdownIndex,
                                            fetchOneLOS
                                          );
                                    }
                                  }}
                                >
                                  Positive
                                </span>
                              )}
                              {alt.los_status !== 2 && (
                                <span
                                  className="text-[14px] text-[#F5A623] cursor-pointer"
                                  onClick={() => {
                                    {
                                      alt.los_status
                                        ? updateLosResult(
                                            alt.id,
                                            2,
                                            setIsLosStatusLoading,
                                            setOpenDropdownIndex,
                                            fetchOneLOS
                                          )
                                        : losResult(
                                            alt.id,
                                            2,
                                            setIsLosStatusLoading,
                                            setOpenDropdownIndex,
                                            fetchOneLOS
                                          );
                                    }
                                  }}
                                >
                                  Critical
                                </span>
                              )}
                              {alt.los_status !== 3 && (
                                <span
                                  className="text-[14px] text-[#DB2C2C] cursor-pointer"
                                  onClick={() => {
                                    {
                                      alt.los_status
                                        ? updateLosResult(
                                            alt.id,
                                            3,
                                            setIsLosStatusLoading,
                                            setOpenDropdownIndex,
                                            fetchOneLOS
                                          )
                                        : losResult(
                                            alt.id,
                                            3,
                                            setIsLosStatusLoading,
                                            setOpenDropdownIndex,
                                            fetchOneLOS
                                          );
                                    }
                                  }}
                                >
                                  Negative
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="w-[16%] flex items-center justify-center">
                        <span
                          className={`text-[14px]  ${
                            !order.line_of_sight
                              .execute_with_all_alternatives &&
                            index !== 0 &&
                            (order.alternative_far_ends[index - 1]
                              .los_status === null ||
                              order.alternative_far_ends[index - 1]
                                .los_status === 1)
                              ? "text-n500"
                              : "text-n800"
                          }`}
                        >
                          {
                            calculateAzimuths(
                              {
                                latitude:
                                  order.line_of_sight.near_end_location
                                    .latitude,
                                longitude:
                                  order.line_of_sight.near_end_location
                                    .longitude,
                              },
                              {
                                latitude: alt.site_location.latitude,
                                longitude: alt.site_location.longitude,
                              }
                            ).azimuthNEToFE
                          }
                          °
                        </span>
                      </div>
                      <div className="w-[16%] flex items-center justify-center">
                        <span
                          className={`text-[14px]  ${
                            !order.line_of_sight
                              .execute_with_all_alternatives &&
                            index !== 0 &&
                            (order.alternative_far_ends[index - 1]
                              .los_status === null ||
                              order.alternative_far_ends[index - 1]
                                .los_status === 1)
                              ? "text-n500"
                              : "text-n800"
                          }`}
                        >
                          {" "}
                          {
                            calculateAzimuths(
                              {
                                latitude: alt.site_location.latitude,
                                longitude: alt.site_location.longitude,
                              },
                              {
                                latitude:
                                  order.line_of_sight.near_end_location
                                    .latitude,
                                longitude:
                                  order.line_of_sight.near_end_location
                                    .longitude,
                              }
                            ).azimuthFEToNE
                          }
                          °
                        </span>
                      </div>
                      <div className="w-[16%] flex items-center justify-center">
                        <span
                          className={`text-[14px]  ${
                            !order.line_of_sight
                              .execute_with_all_alternatives &&
                            index !== 0 &&
                            (order.alternative_far_ends[index - 1]
                              .los_status === null ||
                              order.alternative_far_ends[index - 1]
                                .los_status === 1)
                              ? "text-n500"
                              : "text-n800"
                          }`}
                        >
                          {" "}
                          {calculateDistance(
                            {
                              latitude: alt.site_location.latitude,
                              longitude: alt.site_location.longitude,
                            },
                            {
                              latitude:
                                order.line_of_sight.near_end_location.latitude,
                              longitude:
                                order.line_of_sight.near_end_location.longitude,
                            }
                          ).toFixed(2)}
                          km
                        </span>
                      </div>{" "}
                    </div>
                  );
                })}
              </div>
              {((order.line_of_sight.execute_with_all_alternatives &&
                order.alternative_far_ends.every(
                  (alt) => alt.executed.near_end && alt.executed.far_end
                )) ||
                (!order.line_of_sight.execute_with_all_alternatives &&
                  order.alternative_far_ends.every(
                    (alt) => alt.executed.near_end && alt.executed.far_end
                  )) ||
                (!order.line_of_sight.execute_with_all_alternatives &&
                  order.alternative_far_ends.some(
                    (alt) =>
                      alt.los_status === 1 &&
                      alt.executed.near_end &&
                      alt.executed.far_end
                  ))) && (
                <div className="w-full sm:w-[97%] flex items-center justify-end">
                  {" "}
                  <button
                    type="button"
                    className="flex items-center justify-center text-white bg-primary text-[15px] border-[2px] rounded-[30px] font-medium leading-5 py-[10px] px-[30px]"
                    onClick={() => {
                      handleFinishLos(
                        order.line_of_sight.id,
                        setIsLoadingMainButton,
                        setCurrentSlide,
                        (message, options) =>
                          enqueueSnackbar(message, { ...options }),
                        fetchOneLOS
                      );
                    }}
                  >
                    {isLoadingMainButton ? (
                      <RotatingLines
                        visible={true}
                        width="20"
                        strokeWidth="3"
                        strokeColor={"#FFF"}
                      />
                    ) : (
                      "Submit"
                    )}
                  </button>
                </div>
              )}
            </div>
          ))}
      </div>
      <LosExcutionPopup
        ref={executeLosPopupRef}
        siteInfo={selectedSiteInfo!}
        setSelectedSiteInfo={setSelectedSiteInfo}
        fetchOrder={fetchOneLOS}
      />
      <RequestUpdatePopup
        ref={reqUpdateReportPopup}
        losId={order?.line_of_sight.id}
        fetchOneWorkOrder={fetchOneLOS}
      />
    </div>
  );
};

export default OrderDetails;
