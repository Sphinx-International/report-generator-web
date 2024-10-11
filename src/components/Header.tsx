import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { AppDispatch } from "../Redux/store";
import { RootState } from "../Redux/store";
import { openSidebar } from "../Redux/slices/sideBarSlice";
import { User } from "../assets/types/User";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import UploadingFile from "./uploadingFile";
import { alertWorkorder } from "../assets/types/Mission";
import { Notification } from "../assets/types/Mails&Notifications";
import { calculateDaysSinceCreation } from "../func/formatDatr&Time";
import { formatDate } from "../func/formatDatr&Time";
import { useNavigate } from "react-router-dom";
import useWebSocketNotification from "../hooks/UseWebSocketNotification";
import useWebSocketSearch from "../hooks/useWebSocketSearch";
import { RotatingLines } from "react-loader-spinner";
import {
  fetchAlerts,
  fetchNotifications,
  getActionNotificationTitle,
  getActionNotificationDescription,
  clearOneNotification,
  clearNotificationCount,
} from "../func/heraderLogic";

interface headerProps {
  pageSentence: string;
  searchBar: boolean;
  wsUrl?: string;
}

const Header: React.FC<headerProps> = (props) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [showDropDown, setshowDropDown] = useState<boolean>(false);
  const [showUploadDropDown, setShowUploadDropDown] = useState<boolean>(false);
  const [showAlertDropDown, setShowAlertDropDown] = useState<boolean>(false);
  const [showNotificationDropDown, setShowNotificationDropDown] =
    useState<boolean>(false);

  const [alerts, setAlerts] = useState<alertWorkorder[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const limit = 20;

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<any[]>([]);
  const [loaderSearch, setLoaderSearch] = useState(false);

  const user: User = JSON.parse(localStorage.getItem("user")!);

  const uploadingFiles = useSelector(
    (state: RootState) => state.uploadingFiles
  );
  const count = useSelector(
    (state: RootState) => state.notificationCount.count
  );

  useWebSocketNotification({
    endpointPath: "notifications",
    setNotifications: setNotifications,
  });
  if (props.wsUrl) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useWebSocketSearch({
      searchQuery: searchQuery,
      endpointPath: props.wsUrl,
      setResults: setSearchResult,
      setLoader: setLoaderSearch,
    });
  }

  useEffect(() => {
    fetchAlerts(setAlerts);
    fetchNotifications(0, limit, dispatch, setNotifications, setHasMore);
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const bottom =
      e.currentTarget.scrollHeight - e.currentTarget.scrollTop ===
      e.currentTarget.clientHeight;

    if (bottom && !loading && hasMore) {
      // Fetch more notifications when reached the bottom and there are more to load
      setLoading(true);
      fetchNotifications(
        offset + limit,
        limit,
        dispatch,
        setNotifications,
        setHasMore,
        true
      ).then(() => {
        setOffset((prevOffset) => prevOffset + limit);
        setLoading(false);
      });
    }
  };

  return (
    <div className="flex flex-col gap-[18px]">
      <img
        src="/logo.png"
        alt="logo"
        className="sm:w-[100px] w-[86px] md:hidden"
      />
      <div className="pl-[7px] flex flex-col-reverse md:flex-row items-start gap-[10px] md:gap-0 justify-between w-full">
        <div className="flex flex-col md:gap-[4px] items-start">
          <h1 className="text-n800 lg:text-[25px] md:text-[24px] sm:text-[20px] leading-[34px] font-semibold">
            Welcome Back, {user?.first_name}
          </h1>
          <span className="text-n500 md:text-[14px] sm:text-[13px] text-[11px]">
            {props.pageSentence}
          </span>
        </div>
        <div className="flex items-center md:gap-[32px] md:justify-end justify-between md:w-fit w-full">
          <svg
            onClick={() => {
              dispatch(openSidebar());
            }}
            className="md:hidden inline-block relative"
            xmlns="http://www.w3.org/2000/svg"
            width="39"
            height="39"
            viewBox="0 0 39 39"
            fill="none"
          >
            <rect
              opacity="0.8"
              x="0.5"
              y="0.5"
              width="38"
              height="38"
              rx="19"
              fill="white"
              stroke="#8E92BC"
            />
            <path
              d="M11.5226 15.0684H27.4772"
              stroke="#8E92BC"
              strokeWidth="1.5"
              fillOpacity="round"
            />
            <path
              d="M11.5226 19.5H27.4772"
              stroke="#8E92BC"
              strokeWidth="1.5"
              fillOpacity="round"
            />
            <path
              d="M11.5226 23.9321H27.4772"
              stroke="#8E92BC"
              strokeWidth="1.5"
              fillOpacity="round"
            />
          </svg>
          <div className="flex items-center gap-[15px]">
            <div className=" items-center gap-[10px] flex flex-row-reverse">
              <div className="relative">
                <svg
                  onClick={() => {
                    setShowNotificationDropDown(!showNotificationDropDown);
                    setShowAlertDropDown(false);
                    setShowUploadDropDown(false);
                    if (count !== 0) {
                      clearNotificationCount(dispatch);
                    }
                  }}
                  className=" p-[6px] rounded-[50%] border-[1px] border-n300 cursor-pointer"
                  xmlns="http://www.w3.org/2000/svg"
                  width="34"
                  height="34"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M6.8499 8.9999C6.8499 7.68101 7.29049 6.38991 8.1352 5.43961C8.96601 4.50496 10.2306 3.8499 11.9999 3.8499C13.7693 3.8499 15.0338 4.50496 15.8646 5.43961C16.7093 6.38991 17.1499 7.68101 17.1499 8.9999C17.1499 10.2595 17.7765 11.1981 18.2541 11.9136L18.2927 11.9714C18.8109 12.7488 19.1499 13.2937 19.1499 13.9999C19.1499 14.9742 18.4562 15.7577 17.0163 16.3362C15.5989 16.9057 13.7184 17.1499 11.9999 17.1499C10.2814 17.1499 8.4009 16.9057 6.98347 16.3362C5.54363 15.7577 4.8499 14.9742 4.8499 13.9999C4.8499 13.3064 5.17412 12.8296 5.69801 12.0753C6.20164 11.3503 6.8499 10.4078 6.8499 8.9999ZM11.9999 2.1499C9.76925 2.1499 8.0338 2.99485 6.86461 4.31019C5.70932 5.60989 5.1499 7.31879 5.1499 8.9999C5.1499 9.83343 4.79817 10.3909 4.30179 11.1055L4.23206 11.2056C3.76246 11.8784 3.1499 12.756 3.1499 13.9999C3.1499 16.0257 4.6784 17.2421 6.34968 17.9136C8.04336 18.5941 10.1628 18.8499 11.9999 18.8499C13.837 18.8499 15.9564 18.5941 17.6501 17.9136C19.3214 17.2421 20.8499 16.0257 20.8499 13.9999C20.8499 12.7403 20.2233 11.8017 19.7457 11.0862L19.7071 11.0284C19.1889 10.251 18.8499 9.70612 18.8499 8.9999C18.8499 7.31879 18.2905 5.60989 17.1352 4.31019C15.966 2.99485 14.2306 2.1499 11.9999 2.1499ZM9.52841 19.2927C9.91593 19.0343 10.4384 19.1362 10.7009 19.5192L10.7073 19.5277C10.7163 19.5396 10.734 19.562 10.7602 19.5914C10.8131 19.651 10.8969 19.7351 11.0099 19.8199C11.2334 19.9876 11.5589 20.1499 11.9999 20.1499C12.4409 20.1499 12.7664 19.9876 12.9899 19.8199C13.1029 19.7351 13.1867 19.651 13.2396 19.5914C13.2658 19.562 13.2835 19.5396 13.2925 19.5277L13.2989 19.5192C13.5614 19.1362 14.0839 19.0343 14.4714 19.2927C14.862 19.5531 14.9675 20.0808 14.7071 20.4714L13.9999 19.9999C14.7071 20.4714 14.7069 20.4717 14.7067 20.472L14.7063 20.4727L14.7053 20.4741L14.7032 20.4773L14.6982 20.4846L14.6848 20.5037C14.6744 20.5183 14.6611 20.5366 14.6448 20.558C14.6122 20.6008 14.5674 20.6565 14.5102 20.7209C14.3964 20.8488 14.2302 21.0147 14.0099 21.1799C13.5668 21.5122 12.8922 21.8499 11.9999 21.8499C11.1076 21.8499 10.433 21.5122 9.9899 21.1799C9.76961 21.0147 9.60336 20.8488 9.4896 20.7209C9.43243 20.6565 9.38763 20.6008 9.35504 20.558C9.33871 20.5366 9.32537 20.5183 9.315 20.5037L9.30164 20.4846L9.2966 20.4773L9.2945 20.4741L9.29354 20.4727L9.29309 20.472C9.29287 20.4717 9.29266 20.4714 9.9999 19.9999L9.29266 20.4714C9.03226 20.0808 9.13781 19.5531 9.52841 19.2927Z"
                    fill="#170F49"
                  />
                  <path
                    d="M24 2C24 3.10457 23.1046 4 22 4C20.8954 4 20 3.10457 20 2C20 0.895431 20.8954 0 22 0C23.1046 0 24 0.895431 24 2Z"
                    fill="#FF3B30"
                  />
                </svg>
                <span
                  className={`px-[4px] bg-red-500 rounded-[50%] items-center justify-center text-white absolute text-[10px] top-1 right-1 transition-all duration-1000 ${
                    count === 0
                      ? "opacity-0 transform translate-y-[-10px]"
                      : "opacity-100 transform translate-y-0"
                  }`}
                >
                  {count}
                </span>

                {showNotificationDropDown && (
                  <div className="p-[22px] rounded-tl-[25px] rounded-br-[25px] rounded-bl-[25px] bg-white absolute z-30 sm:right-4 -right-[200%] shadow-xl shadow-slate-300 flex flex-col items-start gap-[18px] w-[300px] sm:w-[450px]">
                    {notifications.length > 0 ? (
                      <>
                        <h5 className="text-[15px] text-n800 font-semibold">
                          Notifications
                        </h5>
                        <div
                          className="flex flex-col items-start pr-2 gap-[12px] w-full max-h-[68vh] overflow-auto"
                          onScroll={handleScroll} // Attach scroll handler here
                        >
                          {notifications.map((notif) => {
                            return (
                              <div
                                key={notif.id}
                                className={`relative cursor-pointer p-[13px] rounded-[15px] border-[1px] border-primary flex flex-col items-start gap-[10px] w-full ${
                                  !notif.seen && "bg-slate-100"
                                }`}
                                onClick={() => {
                                  navigate(
                                    `/${
                                      notif.action >= 100 && notif.action < 200
                                        ? `edit-user/${notif.on}`
                                        : notif.action >= 200 &&
                                          notif.action < 300
                                        ? "mails/groups"
                                        : `missions/${notif.on}`
                                    }`
                                  );
                                  setOffset(0);
                                  setNotifications([]);
                                  clearOneNotification(notif.id, () => {
                                    fetchNotifications(
                                      0,
                                      limit,
                                      dispatch,
                                      setNotifications,
                                      setHasMore
                                    );
                                  });
                                  setShowNotificationDropDown(false);
                                }}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <div className="flex items-center gap-[8px]">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="22"
                                      height="22"
                                      viewBox="0 0 22 22"
                                      fill="none"
                                    >
                                      <rect
                                        width="22"
                                        height="22"
                                        rx="6"
                                        fill="#4A3AFF"
                                        fillOpacity="0.74"
                                      />
                                      <g clipPath="url(#clip0_1390_692)">
                                        <path
                                          d="M10.5834 15.5231C10.1846 15.4323 9.80149 15.2826 9.44672 15.079M12.4167 7.47754C13.328 7.68566 14.1415 8.19698 14.7243 8.9278C15.307 9.65862 15.6243 10.5656 15.6243 11.5003C15.6243 12.435 15.307 13.342 14.7243 14.0729C14.1415 14.8037 13.328 15.315 12.4167 15.5231M8.09876 13.8346C7.84901 13.4712 7.65914 13.0701 7.53638 12.6466M7.43188 10.8128C7.50522 10.3774 7.64638 9.96491 7.84438 9.58679L7.92184 9.447M9.16576 8.09904C9.59485 7.80428 10.0759 7.5934 10.5834 7.47754"
                                          stroke="white"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        />
                                      </g>
                                      <defs>
                                        <clipPath id="clip0_1390_692">
                                          <rect
                                            width="11"
                                            height="11"
                                            fill="white"
                                            transform="translate(6 6)"
                                          />
                                        </clipPath>
                                      </defs>
                                    </svg>
                                    <h6 className="text-n800 sm:text-[15px] text-[13px] font-medium sm:leading-7 leading-5">
                                      {getActionNotificationTitle(notif.action)}
                                    </h6>
                                  </div>
                                  <span className="text-550 text-[11px] leading-4">
                                    {formatDate(notif.at, true)}
                                  </span>
                                </div>
                                <p className="sm:text-[13px] text-[12px] text-550 leading-5">
                                  {getActionNotificationDescription(
                                    notif.action
                                  )}{" "}
                                  on {""}
                                  {notif.on}
                                </p>
                                {!notif.seen && (
                                  <span className="absolute text-red-600 font-bold top-0 right-2">
                                    ●
                                  </span>
                                )}
                              </div>
                            );
                          })}
                          {loading && (
                            <div className="w-full text-center text-primary my-2 font-medium">
                              Loading more ...
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="w-full flex items-center justify-center text-n600 font-medium">
                        No notification found for you
                      </div>
                    )}
                  </div>
                )}
              </div>

              {uploadingFiles.acceptenceFiles.length +
                uploadingFiles.attachFiles.length +
                uploadingFiles.reportFiles.length >
                0 && (
                <div className="relative">
                  <svg
                    className=" p-[6px] rounded-[50%] border-[1px] border-n300 cursor-pointer"
                    xmlns="http://www.w3.org/2000/svg"
                    width="34"
                    height="34"
                    viewBox="0 0 20 20"
                    fill="none"
                    onClick={() => {
                      setShowUploadDropDown(!showUploadDropDown);
                      setShowAlertDropDown(false);
                      setShowNotificationDropDown(false);
                    }}
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M11.6323 14.2446C12.4074 14.2446 13.0533 13.6526 13.1214 12.8803C13.2627 11.2667 13.2985 9.64551 13.2285 8.02718L13.4819 8.00915L14.974 7.90097C15.1919 7.88504 15.4019 7.81279 15.5835 7.69129C15.7651 7.56978 15.9121 7.40318 16.01 7.20781C16.1079 7.01243 16.1534 6.79497 16.1421 6.57671C16.1308 6.35846 16.063 6.14689 15.9453 5.96271C14.8474 4.2441 13.4326 2.75008 11.7765 1.56031L11.1797 1.13059C10.9433 0.96069 10.6596 0.869293 10.3685 0.869293C10.0775 0.869293 9.79374 0.96069 9.55738 1.13059L8.96055 1.56031C7.30441 2.75006 5.88964 4.24408 4.79171 5.96271C4.67408 6.14689 4.60628 6.35846 4.59494 6.57671C4.5836 6.79497 4.62912 7.01243 4.72703 7.20781C4.82494 7.40318 4.9719 7.56978 5.15351 7.69129C5.33512 7.81279 5.54516 7.88504 5.76307 7.90097L7.25516 8.00915C7.33959 8.01541 7.42404 8.02142 7.50851 8.02718C7.43841 9.6449 7.47446 11.2666 7.61566 12.8803C7.64824 13.2529 7.81924 13.5996 8.09491 13.8522C8.37059 14.1048 8.73091 14.2448 9.10475 14.2446H11.6323ZM11.6884 7.36807C11.8024 9.15846 11.7813 10.9549 11.6253 12.7421H9.11176C8.95532 10.9549 8.9339 9.15848 9.04767 7.36807C9.05389 7.26882 9.04035 7.16931 9.00783 7.07533C8.97531 6.98135 8.92446 6.89476 8.85823 6.82059C8.79199 6.74642 8.7117 6.68614 8.622 6.64325C8.53229 6.60036 8.43497 6.57571 8.33567 6.57073C8.01122 6.55471 7.68776 6.53467 7.36431 6.51063L6.28179 6.4315C7.24328 5.01511 8.44666 3.77918 9.83677 2.78036L10.3675 2.39872L10.9003 2.78036C12.2904 3.77917 13.4938 5.01509 14.4552 6.4315L13.3727 6.51163C13.0493 6.53467 12.7248 6.55471 12.4014 6.57073C12.302 6.57558 12.2045 6.60014 12.1147 6.64297C12.0249 6.6858 11.9445 6.74606 11.8782 6.82025C11.8118 6.89443 11.7609 6.98106 11.7283 7.07511C11.6957 7.16915 11.6821 7.26874 11.6884 7.36807Z"
                      fill="#170F49"
                    />
                    <path
                      d="M4.11079 14.6429C4.11079 14.4436 4.03166 14.2525 3.89081 14.1116C3.74996 13.9708 3.55893 13.8916 3.35974 13.8916C3.16055 13.8916 2.96952 13.9708 2.82867 14.1116C2.68782 14.2525 2.60869 14.4436 2.60869 14.6429V16.6462C2.60869 17.6139 3.39379 18.3992 4.36114 18.3992H16.378C16.8428 18.3992 17.2885 18.2145 17.6171 17.8857C17.9458 17.557 18.1304 17.1111 18.1304 16.6462V14.6429C18.1304 14.4436 18.0513 14.2525 17.9105 14.1116C17.7696 13.9708 17.5786 13.8916 17.3794 13.8916C17.1802 13.8916 16.9892 13.9708 16.8483 14.1116C16.7075 14.2525 16.6283 14.4436 16.6283 14.6429V16.6462C16.6283 16.7126 16.6019 16.7763 16.555 16.8233C16.508 16.8703 16.4444 16.8967 16.378 16.8967H4.36114C4.29475 16.8967 4.23107 16.8703 4.18412 16.8233C4.13717 16.7763 4.11079 16.7126 4.11079 16.6462V14.6429Z"
                      fill="#170F49"
                    />
                  </svg>
                  {showUploadDropDown && (
                    <div className="p-[22px] rounded-tl-[25px] rounded-br-[25px] rounded-bl-[25px] bg-white absolute z-30 sm:right-4 -right-[400%] shadow-xl shadow-slate-300 flex flex-col items-start gap-[18px] w-[300px] sm:w-[400px]">
                      <div className="flex w-full items-center justify-between">
                        <h5 className="text-[15px] text-n800 font-semibold">
                          Uploads
                        </h5>
                      </div>
                      <div className="flex flex-col gap-[15px] w-full overflow-auto max-h-[68vh]">
                        {uploadingFiles.attachFiles.length > 0 && (
                          <div className="flex items-start flex-col gap-[10px] w-full">
                            <span className="text-[15px] font-semibold text-n600 ">
                              attachements:
                            </span>
                            <div className="flex flex-col gap-[8px] w-full">
                              {uploadingFiles.attachFiles.map(
                                (attach, index) => {
                                  return (
                                    <UploadingFile
                                      key={index}
                                      id={attach.id}
                                      progress={attach.progress}
                                      file={attach.file}
                                      fileType="attachements"
                                    />
                                  );
                                }
                              )}
                            </div>
                          </div>
                        )}
                        <div className="flex flex-col gap-[8px] w-full">
                          {uploadingFiles.reportFiles.length > 0 && (
                            <div className="flex items-start flex-col gap-[10px] w-full">
                              <span className="text-[15px] font-semibold text-n600 ">
                                Reports:
                              </span>
                              <div className="flex flex-col gap-[8px] w-full">
                                {uploadingFiles.reportFiles.map(
                                  (report, index) => {
                                    return (
                                      <UploadingFile
                                        key={index}
                                        id={report.id}
                                        progress={report.progress}
                                        file={report.file}
                                        fileType="report"
                                      />
                                    );
                                  }
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-[8px] w-full">
                          {uploadingFiles.acceptenceFiles.length > 0 && (
                            <div className="flex items-start flex-col gap-[10px] w-full">
                              <span className="text-[15px] font-semibold text-n600 ">
                                Acceptance certificat:
                              </span>
                              <div className="flex flex-col gap-[8px] w-full">
                                {uploadingFiles.acceptenceFiles.map(
                                  (cert, index) => {
                                    return (
                                      <UploadingFile
                                        key={index}
                                        id={cert.id}
                                        progress={cert.progress}
                                        file={cert.file}
                                        fileType="certificate"
                                      />
                                    );
                                  }
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {alerts.length > 0 && (
                <div className="relative">
                  <svg
                    onClick={() => {
                      setShowAlertDropDown(!showAlertDropDown);
                      setShowNotificationDropDown(false);
                      setShowUploadDropDown(false);
                    }}
                    className=" p-[3px] rounded-[50%] border-[1px] border-n300 cursor-pointer"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    height="33"
                    viewBox="0 0 24 24"
                    width="33"
                  >
                    <path
                      d="m4.9522 16.3536 5.263-10.49702c.7379-1.47177 2.8387-1.47138 3.5761.00065l5.2582 10.49707c.6661 1.3298-.3008 2.8957-1.7882 2.8957h-10.52123c-1.48773 0-2.45467-1.5665-1.78787-2.8964z"
                      stroke="#141414"
                      fillOpacity="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                    />
                    <path
                      d="m12 10v2"
                      stroke="#141414"
                      fillOpacity="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                    <circle cx="12" cy="16" fill="#141414" r="1" />
                  </svg>

                  {showAlertDropDown && (
                    <div className="p-[22px] rounded-tl-[25px] rounded-br-[25px] rounded-bl-[25px] bg-white absolute z-30 right-4 shadow-xl shadow-slate-300 flex flex-col items-start gap-[18px] w-[300px] sm:w-[400px]">
                      <div className="flex w-full items-center justify-between">
                        <h5 className="text-[15px] text-n800 font-semibold">
                          Alerts
                        </h5>
                      </div>
                      <div className="flex flex-col gap-[13px] w-full max-h-[68vh] overflow-auto">
                        {alerts?.map((workorder, index) => (
                          <div
                            key={index}
                            className="cursor-pointer px-[45px] py-[15px] rounded-[22px] w-full flex items-center gap-[16px] border-[2.5px] border-[#FF3B30]"
                            onClick={() => {
                              navigate(`/workorders/${workorder.id}`);
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="49"
                              height="47"
                              viewBox="0 0 49 47"
                              fill="none"
                            >
                              <path
                                d="M9.19628 18.1907C14.7261 8.40295 17.4921 3.51024 21.2871 2.24982C23.3731 1.55735 25.627 1.55735 27.713 2.24982C31.508 3.51024 34.274 8.40295 39.8038 18.1907C45.3359 27.9761 48.0996 32.8711 47.2723 36.8586C46.814 39.054 45.6911 41.0432 44.0594 42.5419C41.094 45.2713 35.5619 45.2713 24.5 45.2713C13.4382 45.2713 7.90607 45.2713 4.94065 42.5442C3.30266 41.0316 2.17917 39.0443 1.72774 36.8609C0.898153 32.8734 3.6642 27.9784 9.19628 18.1907Z"
                                stroke="#FF3B30"
                                strokeWidth="2.8"
                                fillOpacity="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M25.0546 34.9583V25.7917C25.0546 24.7123 25.0546 24.1715 24.72 23.8346C24.3831 23.5 23.8446 23.5 22.7629 23.5M24.4817 16.625H24.5023"
                                stroke="#FF3B30"
                                strokeWidth="2.8"
                                fillOpacity="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <div className="flex flex-col items-center gap-[9px]">
                              <h5 className="text-[13px] text-n800 font-semibold leading-[19.5px]">
                                {workorder.title}
                              </h5>
                              <p className="text-[10px] text-n600 font-semibold leading-[15px] text-center">
                                This workorder hasn’t been updated with a
                                certificate for{" "}
                                {calculateDaysSinceCreation(
                                  workorder.created_at
                                )}{" "}
                                days
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-[12px]">
              <img
                src="/avatar.png"
                alt="avatar"
                className="w-[35px] rounded-[50%]"
              />
              <div
                className="flex items-center gap-[6px] text-n800  text-[14px] relative cursor-pointer"
                onClick={() => {
                  setshowDropDown(!showDropDown);
                }}
              >
                <span className="hidden lg:flex">
                  {user?.first_name} {user?.last_name}
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M6.39886 9.39886C6.73081 9.06692 7.269 9.06692 7.60094 9.39886L11.9999 13.7978L16.3989 9.39886C16.7308 9.06692 17.269 9.06692 17.6009 9.39886C17.9329 9.73081 17.9329 10.269 17.6009 10.6009L12.6009 15.6009C12.269 15.9329 11.7308 15.9329 11.3989 15.6009L6.39886 10.6009C6.06692 10.269 6.06692 9.73081 6.39886 9.39886Z"
                    fill="#170F49"
                  />
                </svg>
                {showDropDown && (
                  <div className="flex flex-col gap-[10px] py-[10px] w-[180px] rounded-tl-[24px] rounded-bl-[24px] rounded-br-[24px] bg-white absolute z-50 top-8 right-3 shadow-lg">
                    <Link to="/my-account" className="w-full">
                      <span className="text-n700 font-medium flex items-center justify-center gap-[8px] cursor-pointer text-nowrap py-[4px] hover:bg-n300 w-full">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="17"
                          viewBox="0 0 16 17"
                          fill="none"
                        >
                          <path
                            d="M1.33301 16.0001V15.1667C1.33301 12.4053 3.57158 10.1667 6.33301 10.1667H9.66634C12.4278 10.1667 14.6663 12.4053 14.6663 15.1667V16.0001"
                            stroke="#4A3AFF"
                            strokeWidth="1.66667"
                            fillOpacity="round"
                          />
                          <path
                            d="M7.99935 7.66667C6.1584 7.66667 4.66602 6.17428 4.66602 4.33333C4.66602 2.49238 6.1584 1 7.99935 1C9.84027 1 11.3327 2.49238 11.3327 4.33333C11.3327 6.17428 9.84027 7.66667 7.99935 7.66667Z"
                            stroke="#4A3AFF"
                            strokeWidth="1.66667"
                            fillOpacity="round"
                          />
                        </svg>{" "}
                        My account
                      </span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {props.searchBar && (
        <div className="md:mr-[16px] relative">
          <input
            type="search"
            name=""
            id=""
            className="w-full h-[44px] rounded-[40px] border-[1px] border-n300 shadow-md md:px-[54px] pl-[54px] pr-[15px] md:text-[14px] text-[12px]"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
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
          {searchQuery !== "" && (
            <div className="bg-white rounded-[20px] flex flex-col items-start gap-2 shadow-xl shadow-slate-300 py-3 w-full absolute ">
              {loaderSearch ? (
                <div className="flex items-center justify-center w-full">
                  <RotatingLines strokeColor="#4A3AFF" width="20" />
                </div>
              ) : (
                searchResult !== null &&
                (searchResult.length > 0 ? (
                  searchResult.map((user: User, index) => {
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-start w-full px-3 gap-2 cursor-pointer hover:bg-slate-200"
                        onClick={() => {
                          navigate(`/edit-user/${user.email}`);
                        }}
                      >
                        <img
                          src="/avatar.png"
                          alt="avatar"
                          className="rounded-[50%] w-[32px]"
                        />
                        <span className="text-n700 font-medium">
                          {" "}
                          {user.email} ({user.first_name} {user.last_name})
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="w-full py-1 flex items-center justify-center text-n700 font-medium">
                    no users founded . . .
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Header;
