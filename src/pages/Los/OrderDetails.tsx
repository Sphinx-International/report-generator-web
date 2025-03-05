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
  addOrDeleteAlt,
  handleFinishLos,
  generateReport,
  downloadGeneratedReport,
  approveLineOfSight,
  closeLineOfSight,
} from "../../func/los/orders";
import { handleOpenDialog } from "../../func/openDialog";
import LosExcutionPopup from "../../components/los/LosExecutionPopup";
import { ResSite } from "../../assets/types/LosSites";
import { NearEndLocation } from "../../assets/types/LosCommands";
import { useSnackbar } from "notistack";
import RequestUpdatePopup from "../../components/los/RequestUpdateReportPopup";
import MapWithMarkers from "../../components/Map";
import { useSelector } from "react-redux";
import { RootState } from "../../Redux/store";
import UploadingFile from "../../components/uploadingFile";
import { downloadFile } from "../../func/donwloadFile";
import { handleCancelUpload } from "../../func/chunkUpload";
import LosOrdersSmallScreens from "../../components/los/responsive screens/LosOrdersSmallScreens";
import LosOrdersLargeScreens from "../../components/los/responsive screens/LosOrdersLargeScreens";
import LosValidationLargeScreens from "../../components/los/responsive screens/LosValidationLargeScreens";
import LosValidationSmallScreens from "../../components/los/responsive screens/LosValidationSmallScreens";
import UploadLosReport from "../../components/los/UploadLosReport";

const baseUrl = import.meta.env.VITE_BASE_URL;

export interface CGPS {
  id: number;
  lat: number;
  lng: number;
  name?: string;
}

const OrderDetails = () => {
  const [markers, setMarkers] = useState<CGPS[]>([]);

  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();

  const uploadingFiles = useSelector(
    (state: RootState) => state.uploadingFiles
  );
  const uploadedAttachOnCreation = useSelector(
    (state: RootState) => state.uploadedAttachOnCreation
  );
  const combinedIds = new Set([
    ...uploadingFiles.attachFiles.map((file) => file.id),
    ...uploadedAttachOnCreation.map((file) => file.id),
  ]);

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

  const [isLoadingMainButton, setIsLoadingMainButton] = useState(false);

  const [isLoadingAltSites, setIsLoadingAltSites] = useState(false);
  // const [isLoadingDeleteFile, setIsLoadingDeleteFile] = useState(false);
  const [isLoadingCancelUpload, setIsLoadingCancelUpload] = useState(false);

  const [currentSlide, setCurrentSlide] = useState<1 | 2>(1);

  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(
    null
  );
  const [isLosStatusLoading, setIsLosStatusLoading] = useState(false);
  const [selectedSiteInfo, setSelectedSiteInfo] = useState<{
    losId: number | null;
    altId: number | null;
    site_type: 1 | 2 | null;
    site_location: NearEndLocation | null;
    losStatus: 1 | 2 | 3 | null;
    accessibility: boolean;
    image_count: number | null;
    siteIndex?: number;
    secondSiteCode: string | null;
  }>({
    losId: null,
    altId: null,
    site_type: null,
    site_location: null,
    losStatus: null,
    accessibility: true,
    image_count: null,
    secondSiteCode: null,
  });
  const [isLoadingGeneration, setIsLoadingGeneration] = useState(false);
  const [isLoadingChoicingCGPS, setIsLoadingChoicingCGPS] = useState(false);

  const [isLoadingDownloadReport, setIsLoadingDownloadReport] = useState(false);

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
            console.log(data);
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
  useEffect(() => {
    fetchOneLOS();
  }, [fetchOneLOS]);

  useEffect(() => {
    if (currentSlide === 1) {
      setMarkers([]);
    } else {
      setMarkers((prev) => {
        const newMarkers = [...prev];

        // Function to check if a marker already exists in the array
        const isMarkerUnique = (newMarker: {
          id: number;
          lat: number;
          lng: number;
        }) => {
          return !newMarkers.some(
            (existingMarker) =>
              existingMarker.id === newMarker.id &&
              existingMarker.lat === newMarker.lat &&
              existingMarker.lng === newMarker.lng
          );
        };

        // Add the main marker if it exists and is unique
        if (
          order &&
          isMarkerUnique({
            id: order.line_of_sight.id,
            lat: order.line_of_sight.near_end_location.latitude,
            lng: order.line_of_sight.near_end_location.longitude,
          })
        ) {
          newMarkers.push({
            id: order.line_of_sight.id,
            lat: order.line_of_sight.near_end_location.latitude,
            lng: order.line_of_sight.near_end_location.longitude,
            name: order.line_of_sight.near_end_location.site_code,
          });
        }

        // Iterate over alternative_far_ends and add markers if valid and unique
        order?.alternative_far_ends?.forEach((end) => {
          const markerToAdd = {
            id: end.id,
            lat: end.site_location.latitude,
            lng: end.site_location.longitude,
            name: end.site_location.site_code,
          };

          if (isMarkerUnique(markerToAdd)) {
            newMarkers.push(markerToAdd);
          }
        });

        return newMarkers;
      });
    }
  }, [order, currentSlide]);

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
                          <div
                            className="relative group w-fit"
                            aria-disabled={isLoadingAltSites}
                          >
                            <img
                              src="/site.png"
                              alt="site"
                              className={`rounded-full transition duration-300 ease-in-out  ${
                                order.line_of_sight.status < 2 &&
                                [0, 1, 2].includes(getRole()!) &&
                                "group-hover:blur-[2px]"
                              } `}
                            />

                            {[0, 1, 2].includes(getRole()!) && (
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
                            )}
                          </div>

                          <span>{alt.site_location.site_code}</span>
                        </div>
                      ))}
                      {[0, 1, 2].includes(getRole()!) && (
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
                            <div className="sm:w-[350px] w-[260px] max-h-[300px] absolute z-20 bg-white rounded-[20px] rounded-tl-none shadow-lg p-[24px] flex flex-col gap-[21px] items-start top-10 sm:-left-28 -right-24 ">
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
                      )}
                    </div>
                  </div>

                  {order?.line_of_sight.assigned_to !== null ? (
                    <div className="flex items-center gap-[12px] relative">
                      <div
                        className="relative w-[36px] h-[36px] sm:w-[41px] sm:h-[41px] rounded-[50%]"
                        onClick={() => {
                          if (
                            [0, 1].includes(getRole()!) &&
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
                        {[0, 1].includes(getRole()!) &&
                          order.line_of_sight.status < 2 && (
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
                                      onClick={async () => {
                                        const token =
                                          localStorage.getItem("token") || sessionStorage.getItem("token");
                                        if (!token) {
                                          console.error("No token found");
                                          return;
                                        }
                                        const response = await fetch(`${baseUrl}/line-of-sight/reassign-line-of-sight`,
                                          {
                                            method: "PATCH",
                                            headers: {
                                              "Content-Type": "application/json",
                                              Authorization: `Token ${token}`,
                                            },
                                            body: JSON.stringify({
                                              "id": basicDataOrder.id,
                                              "assign_to": user.id
                                            })
                                          }
                                        );
                                        if (response) {
                                          console.log(response.status);
                                          switch (response.status) {
                                            case 200:
                                              fetchOneLOS();
                                              setVisibleEngPopup(false);
                                              break;
                                            case 400:
                                              console.log("verify your data");
                                              break;
                                            default:
                                              console.log("error");
                                              break;
                                          }
                                        }
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

                  <div className="flex items-center gap-x-2 gap-y-3 flex-wrap">
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
                        {order!.attachments.length !== 0 && (
                          <label
                            htmlFor="attachements"
                            className="text-[17px] text-n700 leading-[30px] font-medium"
                          >
                            Attachements
                          </label>
                        )}

                        <div className="flex gap-[20px] flex-wrap">
                          {order?.attachments &&
                            order!.attachments.length > 0 &&
                            order!.attachments
                              .filter(
                                (attachment) => !combinedIds.has(attachment.id)
                              )
                              .map((attach, index) => {
                                return (
                                  <div
                                    key={index}
                                    className={`cursor-pointer sm:w-[46%] w-full flex items-center justify-between px-[12px] py-[8px]  rounded-[15px] group ${
                                      attach.is_completed
                                        ? "border-[1px] border-n400"
                                        : attach.uploaded_by ===
                                          Number(
                                            localStorage.getItem("user_id")!
                                          )
                                        ? "border-[2px] border-[#DB2C2C]"
                                        : "border-[2px] border-[#FFB84D]"
                                    }`}
                                    onClick={() => {
                                      if (attach.is_completed) {
                                        downloadFile(
                                          attach.id,
                                          "attachment",
                                          attach.file_name,
                                          "line-of-sight",
                                          (progress) => {
                                            setOrder((prev) => {
                                              if (!prev) return null;

                                              return {
                                                ...prev,
                                                attachments:
                                                  prev.attachments.map((att) =>
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
                                            setOrder((prev) => {
                                              if (!prev) return null;

                                              return {
                                                ...prev,
                                                attachments:
                                                  prev.attachments.map((att) =>
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
                                    }}
                                  >
                                    <div className="flex items-center gap-[9px] w-[100%]">
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
                                                  localStorage.getItem(
                                                    "user_id"
                                                  )!
                                                )
                                              ? "#DB2C2C"
                                              : " #FFB84D"
                                          }
                                        />
                                      </svg>
                                      <div className="w-full flex items-center justify-between">
                                        <div className="flex flex-col items-start w-full">
                                          <span
                                            className={`text-[13px] font-medium leading-[20px] overflow-hidden w-[90%] text-ellipsis text-nowrap ${
                                              attach.is_completed
                                                ? "text-n600"
                                                : attach.uploaded_by ===
                                                  Number(
                                                    localStorage.getItem(
                                                      "user_id"
                                                    )!
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
                                                    localStorage.getItem(
                                                      "user_id"
                                                    )!
                                                  )
                                                ? "text-[#DB2C2C]"
                                                : "text-[#FFB84D]"
                                            }`}
                                          >
                                            {"22.5 mb"}
                                          </span>
                                        </div>

                                        {!attach.is_completed && (
                                          <div
                                            className="flex flex-col items-end gap-3"
                                            aria-disabled={
                                              isLoadingCancelUpload
                                            }
                                          >
                                            <span
                                              className="px-[3px] rounded-[50%] text-white bg-[#f33e3e] text-[12px] cursor-pointer hover:scale-105"
                                              onClick={() => {
                                                handleCancelUpload(
                                                  attach.id,
                                                  undefined,
                                                  undefined,
                                                  setIsLoadingCancelUpload,
                                                  fetchOneLOS
                                                );
                                              }}
                                            >
                                              🗙
                                            </span>
                                            <span className="text-[#DB2C2C] text-[12px] font-medium text-nowrap fade-animation">
                                              try refrech the page
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}

                          {uploadingFiles.attachFiles.length !== 0 &&
                            uploadingFiles.attachFiles
                              .filter((attach) =>
                                order.attachments.some(
                                  (attachment) => attachment.id === attach.id
                                )
                              )
                              .map((attach, index) => {
                                return (
                                  <div
                                    className=" w-[100%] sm:w-[46%]"
                                    key={index}
                                  >
                                    <UploadingFile
                                      key={index}
                                      fetchFunc={fetchOneLOS}
                                      id={attach.id}
                                      progress={attach.progress}
                                      file={attach.file}
                                      fileType="attachements"
                                    />
                                  </div>
                                );
                              })}
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
                      }  border-[2px] rounded-[30px] font-semibold leading-5 py-[10px] px-[30px] ${
                        getRole() === 3 &&
                        (order.line_of_sight.status === 0 ||
                          order.line_of_sight.status === 1) &&
                        "cursor-not-allowed"
                      }`}
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
                      disabled={
                        getRole() === 3 &&
                        (order.line_of_sight.status === 0 ||
                          order.line_of_sight.status === 1)
                      }
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
                  <LosValidationLargeScreens
                    order={order}
                    setMarkers={setMarkers}
                    isLoadingChoicingCGPS={isLoadingChoicingCGPS}
                    setIsLoadingChoicingCGPS={setIsLoadingChoicingCGPS}
                    fetchOneLOS={fetchOneLOS}
                  />
                  <LosValidationSmallScreens
                    order={order}
                    setMarkers={setMarkers}
                    isLoadingChoicingCGPS={isLoadingChoicingCGPS}
                    setIsLoadingChoicingCGPS={setIsLoadingChoicingCGPS}
                    fetchOneLOS={fetchOneLOS}
                  />
                  {[0, 1].includes(getRole()!) && (
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
                  )}

                  <div className="w-full rounded-[20px] overflow-hidden">
                    <MapWithMarkers markers={markers} />
                  </div>
                </div>
              )}
              {order.line_of_sight.status > 3 && (
                <div className="w-full flex flex-col items-start gap-4 md:border-[1px] md:border-n400 rounded-[20px] md:p-[20px]">
                  <h1 className="text-[24px] font-semibold text-primary">
                    Generated report
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
                    [0, 1].includes(getRole()!) && (
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
              <UploadLosReport
                order={order}
                fetchOneLOS={fetchOneLOS}
                setOrder={setOrder}
              />
            </div>
          ) : (
            <div className="flex flex-col items-start gap-8">
              <h2 className="text-[20px] font-semibold text-n800">Los order</h2>
              <LosOrdersLargeScreens
                order={order}
                setSelectedSiteInfo={setSelectedSiteInfo}
                executeLosPopupRef={executeLosPopupRef}
                openDropdownIndex={openDropdownIndex}
                setOpenDropdownIndex={setOpenDropdownIndex}
                isLosStatusLoading={isLosStatusLoading}
                setIsLosStatusLoading={setIsLosStatusLoading}
                fetchOneLOS={fetchOneLOS}
              />
              <LosOrdersSmallScreens
                order={order}
                setSelectedSiteInfo={setSelectedSiteInfo}
                executeLosPopupRef={executeLosPopupRef}
                openDropdownIndex={openDropdownIndex}
                setOpenDropdownIndex={setOpenDropdownIndex}
                isLosStatusLoading={isLosStatusLoading}
                setIsLosStatusLoading={setIsLosStatusLoading}
                fetchOneLOS={fetchOneLOS}
              />
              {((((order.line_of_sight.execute_with_all_alternatives &&
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
                  ))) &&
                order.line_of_sight.status === 2) ||
                order.line_of_sight.status === 5) && (
                <div
                  className={`w-full sm:w-[97%] flex items-center ${
                    getRole() === 2 ? "justify-between" : "justify-end"
                  }`}
                >
                  {" "}
                  {[2, 3].includes(getRole()!) && (
                    <button
                      className={`flex items-center justify-center  text-[15px] border-[2px] rounded-[30px] font-medium leading-5 py-[10px] px-[30px] ${
                        (order.line_of_sight.execute_with_all_alternatives &&
                          order.alternative_far_ends.every(
                            (alt) =>
                              alt.executed.near_end && alt.executed.far_end
                          )) ||
                        (!order.line_of_sight.execute_with_all_alternatives &&
                          order.alternative_far_ends.every(
                            (alt) =>
                              alt.executed.near_end && alt.executed.far_end
                          )) ||
                        (!order.line_of_sight.execute_with_all_alternatives &&
                          order.alternative_far_ends.some(
                            (alt) => alt.los_status === 1
                          ) && // At least one `los_status === 1`
                          order.alternative_far_ends.every(
                            (alt) =>
                              !alt.los_status || // Ignore `alt` with undefined `los_status`
                              (alt.executed.near_end && alt.executed.far_end) // Validate only those with defined `los_status`
                          ))
                          ? "text-primary border-primary"
                          : " text-n400 border-n400"
                      }`}
                      onClick={() => {
                        generateReport(
                          order.line_of_sight.id,
                          setIsLoadingGeneration,
                          undefined,
                          true
                        );
                      }}
                      disabled={
                        (order.line_of_sight.execute_with_all_alternatives &&
                          order.alternative_far_ends.every(
                            (alt) =>
                              alt.executed.near_end && alt.executed.far_end
                          )) ||
                        (!order.line_of_sight.execute_with_all_alternatives &&
                          order.alternative_far_ends.every(
                            (alt) =>
                              alt.executed.near_end && alt.executed.far_end
                          )) ||
                        (!order.line_of_sight.execute_with_all_alternatives &&
                          order.alternative_far_ends.some(
                            (alt) => alt.los_status === 1
                          ) && // At least one `los_status === 1`
                          order.alternative_far_ends.every(
                            (alt) =>
                              !alt.los_status || // Ignore `alt` with undefined `los_status`
                              (alt.executed.near_end && alt.executed.far_end) // Validate only those with defined `los_status`
                          ))
                          ? false
                          : true
                      }
                    >
                      {isLoadingGeneration ? (
                        <RotatingLines
                          visible={true}
                          width="20"
                          strokeWidth="3"
                          strokeColor={"#111"}
                        />
                      ) : (
                        "View PDF"
                      )}
                    </button>
                  )}
                  {[0, 1, 2].includes(getRole()!) && (
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
                  )}
                </div>
              )}
              <div className="w-full rounded-[20px] overflow-hidden">
                <MapWithMarkers markers={markers} />
              </div>
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
