import { useState, useRef, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import WorkOrderStatus from "../components/workorder/WorkOrderStatus";
import SideBar from "../components/SideBar";
import Header from "../components/Header";
import { ResOfOneModernisation } from "../assets/types/Modernisation";
import { User } from "../assets/types/User";
import { RotatingLines } from "react-loader-spinner";
import { getRole } from "../func/getUserRole";
import Page404 from "./Page404";
const baseUrl = import.meta.env.VITE_BASE_URL;
import { downloadFile } from "../func/donwloadFile";
import useWebSocketSearch from "../hooks/useWebSocketSearch";
import handleChange from "../func/handleChangeFormsInput";
import {
  upload_or_delete_workorder_files_for_attachements,
  handle_resuming_upload,
  handleCancelUpload,
} from "../func/chunkUpload";
import UploadingFile from "../components/uploadingFile";
import { formatDate } from "../func/formatDatr&Time";
import AddCertificatPopup from "../components/workorder/AddCertificatPopup";
import AddReportPopup from "../components/workorder/AddReportPopup";
import RequestUpdatePopup from "../components/workorder/RequestUpdatePopup";
import { handleOpenDialog } from "../func/openDialog";
import CircularProgress from "../components/CircleProgress";
import { certeficatTypes } from "../assets/CertificatTypes";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../Redux/store";
import { RootState } from "../Redux/store";
import {
  handle_edit_or_reqUpdate_report,
  handle_update_cert_type,
  handleFileChange,
  handle_open_or_close_returnVoucher,
  handle_Assignment_and_execute,
  handle_add_or_delete_mailedPerson,
} from "../func/otherworkorderApis";
import {
  generateFileToken,
  getFilesByIdFromIndexedDB,
  IndexedDBFile,
  syncIndexedDBWithFetchedFiles,
} from "../func/generateFileToken";
import { useSnackbar } from "notistack";
import { fetchGroupMembersThenAddThemToWorkorder } from "../func/groupsApi";
import {
  removeAttachOnCreationArray,
  setDownloadProgress,
} from "../Redux/slices/uploadAttachOnCreation";
import AddVoucherPopup from "../components/workorder/AddVouchePopup";
import RequirementPopup from "../components/workorder/RequirementPopup";

type WorkorderProperties = {
  title?: string;
  id?: string;
  priority?: 0 | 1 | 2 | 3 | number;
  description?: string;
};

const ModernisationDetails = () => {
  const { id } = useParams();
  // const decodedId = decodeURIComponent(id || "");

  const dispatch = useDispatch<AppDispatch>();
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
  const [visibleEngPopup, setVisibleEngPopup] = useState<boolean>(false);
  const [visibleCoordPopup, setVisibleCoordPopup] = useState<boolean>(false);
  const [modernisation, setModernisation] =
    useState<ResOfOneModernisation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAttach, setIsLoadingAttach] = useState(false);
  const [isLoadingFinalize, setisLoadingFinalize] = useState(false);
  const [isLoadingMaildPersons, setIsLoadingMaildPersons] = useState(false);
  const [isLoadingCancelUpload, setIsLoadingCancelUpload] = useState(false);
  const [isLoadingDeleteFile, setIsLoadingDeleteFile] = useState(false);
  const [isLoadingVoucher, setIsLoadingVoucher] = useState(false);

  const [searchQueryEng, setSearchQueryEng] = useState<string>("");
  const [searchQueryCoord, setSearchQueryCoord] = useState<string>("");

  const [searchEngs, setSearchEngs] = useState<User[]>([]);
  const [searchCoords, setSearchCoords] = useState<
    { email: string; id: number; name: string }[]
  >([]);

  const [selectedEng, setSelectedEng] = useState<User | null>(null);

  const [loaderAssignSearch, setLoaderAssignSearch] = useState(false);
  const [loaderCoordSearch, setLoaderCoordSearch] = useState(false);

  const [typeOfSearchPopupVisible, setTypeOfSearchPopupVisible] =
    useState<boolean>(false);
  const [typeOfSearchForCoord, setTypeOfSearchForCoord] = useState<
    "Emails" | "Groupes"
  >("Emails");
  const [selectedMembersFromGroup, setSelectedMembersFromGroup] = useState<
    string[]
  >([]);
  const [loaderGettingGroupMembers, setLoaderGettingGroupMembers] =
    useState(false);

  const [HaveAccess, setHaveAccess] = useState(true);
  const [isPageLoading, setIsPageLoading] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [undoMessageVisible, setUndoMessageVisible] = useState(false);
  const addCertificatDialogRef = useRef<HTMLDialogElement>(null);
  const addReportDialogRef = useRef<HTMLDialogElement>(null);
  const requestUpdateDialogRef = useRef<HTMLDialogElement>(null);
  const addVoucherDialogRef = useRef<HTMLDialogElement>(null);
  const undoTimeoutRef = useRef<number | null>(null);
  const undoActionTriggeredRef = useRef(false);
  const undo_req_acc_ActionTriggeredRef = useRef(false);
  const [timeLeft, setTimeLeft] = useState(5); // Countdown starts at 5 seconds
  const intervalRef = useRef<number | null>(null); // Ref for countdown interval

  const [basicDataModernisation, setbasicDataModernisation] = useState<{
    title: string;
    id: string;
    priority: 0 | 1 | 2 | 3 | number;
    description: string;
  }>({
    title: "",
    id: "",
    priority: 0,
    description: "",
  });
  const [inputWidth, setInputWidth] = useState(380);
  const spanRef = useRef<HTMLSpanElement>(null);

  const [isEditing_Title_tic, setIsEditing_Title_tic] = useState(false);
  const [isEditing_desc, setIsEditing_desc] = useState(false);
  const [showPriority, setShowPriority] = useState(false);

  const [certType, setCertType] = useState<1 | 2 | 3>(1);
  const [showEditCertificatType, setShowEditCertificatType] = useState(false);

  const fileInputOnReuploadRef = useRef<HTMLInputElement>(null);
  const [selectedIdFileForResumeUpload, setSelectedIdFileForResumeUpload] =
    useState<number>();
  const [selectedFileTypeForResumeUpload, setSelectedFileTypeForResumeUpload] =
    useState<"attachements" | "report" | "certificate" | "voucher">();

  const [visibleHistory, setVisibleHistory] = useState<boolean>(false);
  const [visibleReqVoucherPopup, setVisibleReqVoucherPopup] = useState(false);

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const handleLabelClick = (
    fileId: number,
    fileType: "attachements" | "report" | "certificate" | "voucher"
  ) => {
    setSelectedIdFileForResumeUpload(fileId);
    setSelectedFileTypeForResumeUpload(fileType);

    fileInputOnReuploadRef.current?.click();
  };

  const handleFileInputChangeOfResumeUpload = async (file: IndexedDBFile) => {
    if (file) {
      try {
        const file_token = await generateFileToken(file.fileContent);

        // Define the button using JSX for the snackbar action
        const snackbarAction = (key: string | number) => (
          <button
            style={{
              color: "white",
              backgroundColor: "red",
              border: "none",
              padding: "6px 12px",
              cursor: "pointer",
            }}
            onClick={async () => {
              // Custom delete logic here, e.g., deleting from IndexedDB
              await handleCancelUpload(file.fileId, dispatch, file.fileType);
              fetchOneModernisation();
              closeSnackbar(key);
            }}
          >
            Delete
          </button>
        );

        handle_resuming_upload(
          dispatch,
          file.fileId,
          file.fileContent,
          file.fileType,
          file_token,
          modernisation!.modernisation.id,
          setIsLoading,
          fetchOneModernisation,
          (message, options) =>
            enqueueSnackbar(message, { ...options, action: snackbarAction }) // Pass the action with the JSX button
        );

        setSelectedIdFileForResumeUpload(undefined);
        setSelectedFileTypeForResumeUpload(undefined);
      } catch (error) {
        console.error("Error handling file upload", error);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const calculateWidth = () => {
      if (spanRef.current) {
        setInputWidth(spanRef.current.offsetWidth + 45);
      }
    };

    // Calculate width after a small delay to ensure DOM is ready
    setTimeout(() => {
      requestAnimationFrame(calculateWidth);
    }, 1400); // Adjust the delay as necessary

    // Optionally check for fonts and recalculate
    document.fonts?.ready.then(calculateWidth);
  }, [spanRef, basicDataModernisation.title]);

  const handleExecute = (modernisation_id: string) => {
    setUndoMessageVisible(true);
    setTimeLeft(5); // Set countdown to 5 seconds
    setIsLoading(true);
    undoActionTriggeredRef.current = false;
    undo_req_acc_ActionTriggeredRef.current = true;

    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
    }

    // Start countdown timer
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = window.setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(intervalRef.current!);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    undoTimeoutRef.current = window.setTimeout(async () => {
      if (!undoActionTriggeredRef.current) {
        await handle_Assignment_and_execute(
          modernisation_id,
          "execute-modernisation",
          "PUT",
          "modernisation",
          setIsLoading,
          fetchOneModernisation
        );
      }
      setUndoMessageVisible(false);
    }, 5000);
  };

  useWebSocketSearch({
    searchQuery: searchQueryEng,
    endpointPath: "search-account/engineer",
    setResults: setSearchEngs,
    setLoader: setLoaderAssignSearch,
  });

  useWebSocketSearch({
    searchQuery: searchQueryCoord,
    endpointPath:
      typeOfSearchForCoord === "Emails" ? "search-mail" : "search-group",
    setResults: setSearchCoords,
    setLoader: setLoaderCoordSearch,
  });

  const fetchOneModernisation = useCallback(async () => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return;
    }
    const url = `${baseUrl}/modernisation/get-modernisation/${encodeURIComponent(
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
            setModernisation(data);
            setbasicDataModernisation({
              title: data.modernisation.title,
              id: data.modernisation.id,
              priority: data.modernisation.priority,
              description: data.modernisation.description,
            });
            setSelectedMembersFromGroup(() => {
              // Extract emails from data.modernisation.mail_to
              const newEmails = data.mail_to.map(
                (mail: { id: number; workorder: number; email: string }) =>
                  mail.email
              );
              return [newEmails];
            });
            if (spanRef.current) {
              setInputWidth(spanRef.current.offsetWidth + 45);
            }
            // Sync files with IndexedDB
            await syncIndexedDBWithFetchedFiles(data.modernisation.id, data);
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
  const handleEditWorkorder = async (properties: WorkorderProperties = {}) => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return;
    }

    const { title, id, priority, description } = properties;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body: Record<string, any> = { id };

    if (title !== undefined) body.title = title;
    if (id !== undefined) body.id = id;
    if (priority !== undefined) body.priority = priority;
    if (description !== undefined) body.description = description;
    setIsLoading(true);
    try {
      const response = await fetch(
        `${baseUrl}/modernisation/update-modernisation`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body), // No need to wrap body in another object
        }
      );

      if (response) {
        switch (response.status) {
          case 200:
            setModernisation((prevState) => ({
              ...prevState!,
              workorder: {
                ...prevState!.modernisation,
                priority: properties.priority!,
              },
            }));

            null;
            break;
          case 400:
            console.log("verify your data");
            break;
          default:
            console.log("error");
            break;
        }
      }
    } catch (err) {
      console.error("Error submitting form", err);
    } finally {
      if (priority !== undefined) {
        setShowPriority(false);
      } else {
        setIsEditing_Title_tic(false);
        setIsEditing_desc(false);
      }
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchOneModernisation();
  }, [fetchOneModernisation]);

  const handleUndo = () => {
    if (undoTimeoutRef.current !== null) {
      clearTimeout(undoTimeoutRef.current);
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    undoActionTriggeredRef.current = true;
    setUndoMessageVisible(false);
    setIsLoading(false);
  };

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
        <Header pageSentence="Here is workorder details" searchBar={false} />
        {modernisation && (
          <div className="flex flex-col items-end gap-[40px] w-full sm:px-[25px] px-[14px]">
            <div className="flex flex-col w-full gap-[31px] ">
              <div className="flex flex-col gap-[31px] md:border-[1px] md:border-n400 rounded-[20px] md:px-[25px] md:py-[32px]">
                <div className="w-full flex items-center justify-between gap-[14px] ">
                  <div className="flex items-center sm:gap-[12px] w-[90%] text-primary font-semibold md:text-[24px] text-[17px]">
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
                        {`${basicDataModernisation.title} | ${basicDataModernisation.id}`}
                      </span>

                      <input
                        className={`text-primary font-semibold md:text-[24px] text-[16px] rounded-[20px] py-[7px] sm:px-[20px] px-[8px] bg-white w-[${inputWidth}] max-w-[92%] ${
                          isEditing_Title_tic
                            ? "border-n300 border-[1px] shadow-md"
                            : ""
                        }`}
                        style={{ width: `${inputWidth}px` }}
                        type="text"
                        name="title"
                        disabled={!isEditing_Title_tic}
                        value={
                          isEditing_Title_tic
                            ? `${basicDataModernisation.title}`
                            : `${basicDataModernisation.title}    ${basicDataModernisation.id}`
                        }
                        onChange={(e) => {
                          handleChange(e, setbasicDataModernisation);
                        }}
                      />
                    </>
                    {isEditing_Title_tic && (
                      <span
                        className={`text-primary font-semibold md:text-[24px] text-[16px] rounded-[20px] py-[7px] sm:px-[20px] px-[8px]`}
                      >
                        {basicDataModernisation.id}
                      </span>
                    )}
                    {!isEditing_Title_tic && getRole() !== 2 && (
                      <svg
                        onClick={() => {
                          setIsEditing_Title_tic(true);
                        }}
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        fill="none"
                        className="cursor-pointer w-[18px]"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M16.0909 4.06248C16.1622 4.17064 16.1939 4.30007 16.1808 4.42892C16.1677 4.55778 16.1105 4.67815 16.0189 4.76973L9.12418 11.6637C9.05364 11.7342 8.96564 11.7847 8.86918 11.81L5.99743 12.56C5.9025 12.5847 5.80275 12.5842 5.70807 12.5585C5.6134 12.5328 5.52709 12.4828 5.45772 12.4134C5.38835 12.3441 5.33833 12.2578 5.31262 12.1631C5.28692 12.0684 5.28642 11.9687 5.31118 11.8737L6.06118 9.00273C6.08307 8.91655 6.12437 8.83651 6.18193 8.76873L13.1022 1.85298C13.2076 1.74764 13.3506 1.68848 13.4997 1.68848C13.6487 1.68848 13.7917 1.74764 13.8972 1.85298L16.0189 3.97398C16.0458 4.00099 16.07 4.03064 16.0909 4.06248ZM14.8257 4.37148L13.4997 3.04623L7.11118 9.43473L6.64243 11.2295L8.43718 10.7607L14.8257 4.37148Z"
                          fill="#514F6E"
                          fillOpacity="0.75"
                        />
                        <path
                          d="M14.7302 12.8697C14.9352 11.1176 15.0006 9.35208 14.9259 7.58967C14.9243 7.54815 14.9313 7.50674 14.9464 7.46803C14.9615 7.42931 14.9844 7.39413 15.0137 7.36467L15.7517 6.62667C15.7718 6.60639 15.7974 6.59236 15.8254 6.58628C15.8533 6.58019 15.8824 6.58231 15.9092 6.59237C15.936 6.60243 15.9593 6.62 15.9763 6.64299C15.9933 6.66597 16.0034 6.69338 16.0052 6.72192C16.1441 8.81535 16.0914 10.9171 15.8477 13.0009C15.6707 14.5174 14.4527 15.7062 12.9429 15.8749C10.3219 16.1652 7.67692 16.1652 5.05593 15.8749C3.54693 15.7062 2.32818 14.5174 2.15118 13.0009C1.84023 10.3425 1.84023 7.65686 2.15118 4.99842C2.32818 3.48192 3.54618 2.29317 5.05593 2.12442C7.04521 1.90383 9.04948 1.8504 11.0477 1.96467C11.0763 1.96672 11.1037 1.97693 11.1267 1.99408C11.1496 2.01123 11.1672 2.0346 11.1773 2.06144C11.1874 2.08827 11.1896 2.11743 11.1837 2.14548C11.1777 2.17352 11.1638 2.19927 11.1437 2.21967L10.3989 2.96367C10.3698 2.99273 10.335 3.01551 10.2966 3.0306C10.2583 3.04569 10.2173 3.05278 10.1762 3.05142C8.50875 2.99474 6.8394 3.05866 5.18118 3.24267C4.69664 3.2963 4.24432 3.51171 3.8973 3.85411C3.55027 4.19651 3.32881 4.64589 3.26868 5.12967C2.96797 7.70091 2.96797 10.2984 3.26868 12.8697C3.32881 13.3535 3.55027 13.8028 3.8973 14.1452C4.24432 14.4876 4.69664 14.703 5.18118 14.7567C7.69743 15.0379 10.3014 15.0379 12.8184 14.7567C13.303 14.703 13.7553 14.4876 14.1023 14.1452C14.4493 13.8028 14.6701 13.3535 14.7302 12.8697Z"
                          fill="#514F6E"
                          fillOpacity="0.75"
                        />
                      </svg>
                    )}
                  </div>
                  {modernisation.history !== null &&
                    modernisation.history.length !== 0 && (
                      <div className="relative">
                        <svg
                          className="cursor-pointer hover:scale-105"
                          onClick={() => {
                            setVisibleHistory(!visibleHistory);
                          }}
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M12 8V12L14 14"
                            stroke="#6F6C8F"
                            strokeWidth="1.66667"
                            fillOpacity="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M3.0498 10.9999C3.2739 8.8 4.30007 6.75956 5.93254 5.26791C7.56501 3.77627 9.6895 2.93783 11.9007 2.91257C14.1119 2.88732 16.255 3.67701 17.9211 5.13098C19.5872 6.58495 20.6597 8.60142 20.934 10.7957C21.2083 12.9899 20.6651 15.2084 19.4082 17.0277C18.1512 18.8471 16.2684 20.14 14.1191 20.6598C11.9697 21.1796 9.70421 20.8899 7.7548 19.846C5.80539 18.8021 4.30853 17.077 3.5498 14.9999M3.0498 19.9999V14.9999H8.0498"
                            stroke="#6F6C8F"
                            strokeWidth="1.66667"
                            fillOpacity="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        {visibleHistory && (
                          <div className="bg-white py-[19px] px-[26px] rounded-[20px] shadow-xl shadow-slate-300 absolute right-0 flex flex-col items-start z-50 max-h-[60vh] overflow-auto">
                            {modernisation.history.map((action, index) => {
                              return (
                                <div
                                  key={index}
                                  className={`flex flex-col items-start gap-1 py-[10px] ${
                                    ++index !== modernisation.history.length &&
                                    " border-b-[1px] border-b-n300"
                                  }`}
                                >
                                  <h6 className="text-[13px] leading-5 font-medium text-n800 text-nowrap">
                                    {action.action === 0
                                      ? "modernisation has been created"
                                      : action.action === 1
                                      ? "modernisation has been updated"
                                      : action.action === 2
                                      ? "modernisation has been assigned"
                                      : action.action === 3
                                      ? "modernisation has been reassigned"
                                      : action.action === 4
                                      ? "modernisation has been executed"
                                      : action.action === 5
                                      ? "modernisation report uploaded"
                                      : action.action === 6
                                      ? "modernisation has been reported"
                                      : action.action === 7
                                      ? "modernisation update requested"
                                      : action.action === 8
                                      ? "modernisation certificate uploaded"
                                      : action.action === 9
                                      ? "modernisation has been accepted"
                                      : "modernisation closed"}
                                  </h6>
                                  <span className="text-[12px] leading-[18px] font-medium text-550 text-nowrap">
                                    {formatDate(action.at)}
                                  </span>
                                  <span className="text-[12px] leading-[18px] font-medium text-550 text-nowrap">
                                    <span className="">By:</span>{" "}
                                    {action.by.first_name} {action.by.last_name}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                </div>

                <div className="w-full flex flex-col items-start gap-[15px]">
                  {modernisation.modernisation.assigned_to !== null ? (
                    <div className="flex items-center gap-[12px] relative">
                      <div
                        className="relative w-[36px] h-[36px] sm:w-[41px] sm:h-[41px] rounded-[50%]"
                        onClick={() => {
                          if (
                            getRole() !== 2 &&
                            modernisation.modernisation.status < 2
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
                        {getRole() !== 2 && (
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
                        {modernisation.modernisation.assigned_to.email}
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
                                        handle_Assignment_and_execute(
                                          modernisation.modernisation.id,
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
                  <div className="flex flex-col gap-[10px] items-start w-full">
                    <span className="text-[17px] font-medium leading-[30px] text-n700 flex items-center gap-[6px]">
                      Description
                      {!isEditing_desc && getRole() !== 2 && (
                        <svg
                          onClick={() => {
                            setIsEditing_desc(true);
                          }}
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 18 18"
                          fill="none"
                          className="cursor-pointer"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M16.0909 4.06248C16.1622 4.17064 16.1939 4.30007 16.1808 4.42892C16.1677 4.55778 16.1105 4.67815 16.0189 4.76973L9.12418 11.6637C9.05364 11.7342 8.96564 11.7847 8.86918 11.81L5.99743 12.56C5.9025 12.5847 5.80275 12.5842 5.70807 12.5585C5.6134 12.5328 5.52709 12.4828 5.45772 12.4134C5.38835 12.3441 5.33833 12.2578 5.31262 12.1631C5.28692 12.0684 5.28642 11.9687 5.31118 11.8737L6.06118 9.00273C6.08307 8.91655 6.12437 8.83651 6.18193 8.76873L13.1022 1.85298C13.2076 1.74764 13.3506 1.68848 13.4997 1.68848C13.6487 1.68848 13.7917 1.74764 13.8972 1.85298L16.0189 3.97398C16.0458 4.00099 16.07 4.03064 16.0909 4.06248ZM14.8257 4.37148L13.4997 3.04623L7.11118 9.43473L6.64243 11.2295L8.43718 10.7607L14.8257 4.37148Z"
                            fill="#514F6E"
                            fillOpacity="0.75"
                          />
                          <path
                            d="M14.7302 12.8697C14.9352 11.1176 15.0006 9.35208 14.9259 7.58967C14.9243 7.54815 14.9313 7.50674 14.9464 7.46803C14.9615 7.42931 14.9844 7.39413 15.0137 7.36467L15.7517 6.62667C15.7718 6.60639 15.7974 6.59236 15.8254 6.58628C15.8533 6.58019 15.8824 6.58231 15.9092 6.59237C15.936 6.60243 15.9593 6.62 15.9763 6.64299C15.9933 6.66597 16.0034 6.69338 16.0052 6.72192C16.1441 8.81535 16.0914 10.9171 15.8477 13.0009C15.6707 14.5174 14.4527 15.7062 12.9429 15.8749C10.3219 16.1652 7.67692 16.1652 5.05593 15.8749C3.54693 15.7062 2.32818 14.5174 2.15118 13.0009C1.84023 10.3425 1.84023 7.65686 2.15118 4.99842C2.32818 3.48192 3.54618 2.29317 5.05593 2.12442C7.04521 1.90383 9.04948 1.8504 11.0477 1.96467C11.0763 1.96672 11.1037 1.97693 11.1267 1.99408C11.1496 2.01123 11.1672 2.0346 11.1773 2.06144C11.1874 2.08827 11.1896 2.11743 11.1837 2.14548C11.1777 2.17352 11.1638 2.19927 11.1437 2.21967L10.3989 2.96367C10.3698 2.99273 10.335 3.01551 10.2966 3.0306C10.2583 3.04569 10.2173 3.05278 10.1762 3.05142C8.50875 2.99474 6.8394 3.05866 5.18118 3.24267C4.69664 3.2963 4.24432 3.51171 3.8973 3.85411C3.55027 4.19651 3.32881 4.64589 3.26868 5.12967C2.96797 7.70091 2.96797 10.2984 3.26868 12.8697C3.32881 13.3535 3.55027 13.8028 3.8973 14.1452C4.24432 14.4876 4.69664 14.703 5.18118 14.7567C7.69743 15.0379 10.3014 15.0379 12.8184 14.7567C13.303 14.703 13.7553 14.4876 14.1023 14.1452C14.4493 13.8028 14.6701 13.3535 14.7302 12.8697Z"
                            fill="#514F6E"
                            fillOpacity="0.75"
                          />
                        </svg>
                      )}
                    </span>
                    <textarea
                      className={`sm:text-[17px] text-[14px] text-n600 leading-[27px] rounded-[20px] px-[25px] py-[7px] w-full ${
                        isEditing_desc
                          ? "border-n300 border-[1px] shadow-md"
                          : "bg-white"
                      }`}
                      name="description"
                      disabled={isEditing_desc ? false : true}
                      value={basicDataModernisation.description}
                      rows={isEditing_desc ? 4 : 2}
                      onChange={(e) => {
                        handleChange(e, setbasicDataModernisation);
                      }}
                    />
                  </div>

                  <div className="flex items-center gap-[4px]">
                    <div className="relative">
                      {getRole() !== 2 && (
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
                        <div className="sm:w-[400px] w-[280px] absolute z-20 bg-white rounded-[20px] rounded-tl-none shadow-lg p-[24px] flex flex-col gap-[21px] items-start top-10 left-4 ">
                          <div className=" relative w-full">
                            <input
                              type="search"
                              name=""
                              id=""
                              value={searchQueryCoord!}
                              onChange={(eo) => {
                                setSearchQueryCoord(eo.target.value);
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
                            <div className="absolute right-[14px] top-[50%] translate-y-[-50%] z-50">
                              <svg
                                className="cursor-pointer"
                                onClick={() => {
                                  setTypeOfSearchPopupVisible(
                                    !typeOfSearchPopupVisible
                                  );
                                }}
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
                                <div className="bg-white shadow-xl shadow-slate-400 p-[17px] rounded-[10px] flex flex-col items-start gap-[14px] absolute right-1">
                                  <span className="text-[13px] text-n700 font-medium">
                                    Search by :{" "}
                                  </span>
                                  <div className="flex items-center gap-[4px]">
                                    <button
                                      className={`px-[20px] py-[5px] rounded-[26px] border-[1px]  text-[12px] leading-[18px]  font-medium ${
                                        typeOfSearchForCoord === "Emails"
                                          ? "text-primary border-primary"
                                          : "text-n600 border-n400"
                                      }`}
                                      onClick={() => {
                                        setTypeOfSearchForCoord("Emails");
                                      }}
                                    >
                                      Emails
                                    </button>
                                    <button
                                      className={`px-[20px] py-[5px] rounded-[26px] border-[1px] text-[12px] leading-[18px] font-medium ${
                                        typeOfSearchForCoord === "Groupes"
                                          ? "text-primary border-primary"
                                          : "text-n600 border-n400"
                                      }`}
                                      onClick={() => {
                                        setTypeOfSearchForCoord("Groupes");
                                      }}
                                    >
                                      Groupes
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-start gap-[12px] w-full">
                            {loaderCoordSearch ? (
                              <div className="w-full py-[10px] flex items-center justify-center">
                                <RotatingLines
                                  strokeWidth="4"
                                  strokeColor="#4A3AFF"
                                  width="20"
                                />
                              </div>
                            ) : searchQueryCoord !== "" ? (
                              searchCoords !== null &&
                              searchCoords.length > 0 ? (
                                typeOfSearchForCoord === "Emails" ? (
                                  searchCoords.map((user, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center gap-[5px] cursor-pointer w-full hover:bg-n300"
                                      onClick={() => {
                                        // Check if the email exists in modernisation.mail_to
                                        const emailExists =
                                          modernisation.mail_to.some(
                                            (mailTo) =>
                                              mailTo.email === user.email
                                          );

                                        if (!emailExists) {
                                          handle_add_or_delete_mailedPerson(
                                            modernisation.modernisation.id,
                                            user.email,
                                            "add",
                                            "modernisation",
                                            setIsLoadingMaildPersons,
                                            setVisibleCoordPopup,
                                            fetchOneModernisation
                                          );
                                        }
                                        setVisibleCoordPopup(false);
                                      }}
                                    >
                                      <img
                                        src="/avatar.png"
                                        alt="avatar"
                                        className="w-[31px] rounded-[50%]"
                                      />
                                      <span className="text-[14px] text-n600">
                                        {user.email}
                                      </span>
                                    </div>
                                  ))
                                ) : loaderGettingGroupMembers ? (
                                  <span className="text-primary w-full flex justify-center text-[14px]">
                                    Getting group members ...
                                  </span>
                                ) : (
                                  searchCoords.map((user, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center gap-[5px] cursor-pointer w-full hover:bg-n300"
                                      onClick={async () => {
                                        await fetchGroupMembersThenAddThemToWorkorder(
                                          modernisation.modernisation.id,
                                          user.id,
                                          selectedMembersFromGroup,
                                          setLoaderGettingGroupMembers,
                                          fetchOneModernisation
                                        );
                                        setVisibleCoordPopup(false);
                                      }}
                                    >
                                      <img
                                        src="/avatar.png"
                                        alt="avatar"
                                        className="w-[31px] rounded-[50%]"
                                      />
                                      <span className="text-[14px] text-n600">
                                        {user.name}
                                      </span>
                                    </div>
                                  ))
                                )
                              ) : (
                                <span className="text-n700 w-full flex justify-center text-[14px]">
                                  no result founded
                                </span>
                              )
                            ) : (
                              <span className="text-n700 w-full flex justify-center text-[14px]">
                                Search for a coordianter
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {modernisation.mail_to &&
                      modernisation.mail_to.map((mail, index) => {
                        return (
                          <div className="relative group" key={index}>
                            <img
                              src="/avatar1.png"
                              alt="avatar"
                              className="w-[40px] rounded-[50%]"
                            />
                            {getRole() !== 2 && (
                              <span
                                className="absolute top-0 flex items-center justify-center w-full h-full text-white bg-550 opacity-0 hover:bg-opacity-40 z-20 hover:opacity-100 cursor-pointer rounded-[50%]"
                                onClick={() => {
                                  handle_add_or_delete_mailedPerson(
                                    modernisation.modernisation.id,
                                    mail.id,
                                    "delete",
                                    "modernisation",
                                    setIsLoadingMaildPersons,
                                    setVisibleCoordPopup,
                                    fetchOneModernisation
                                  );
                                }}
                              >
                                🗙
                              </span>
                            )}

                            {isLoadingMaildPersons && (
                              <span className="absolute top-0 flex items-center justify-center w-full h-full text-white bg-n400 bg-opacity-95 z-20 cursor-not-allowed rounded-[50%]">
                                <RotatingLines
                                  visible={true}
                                  width="20"
                                  strokeWidth="3"
                                  strokeColor="#4A3AFF"
                                />
                              </span>
                            )}
                            {/* Tooltip */}
                            <div className="absolute left-[%65] transform -translate-x-1/3 bottom-full mb-2 hidden group-hover:block bg-black text-white text-xs rounded px-2 py-1 z-60">
                              {mail.email}
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  <div className="flex items-center gap-[8px] relative">
                    <WorkOrderStatus
                      status={
                        modernisation.modernisation.report_status === 1 &&
                        modernisation.modernisation.certificate_status === 1 &&
                        modernisation.modernisation.voucher_status &&
                        modernisation.modernisation
                          .is_certificate_file_uploaded &&
                        modernisation.modernisation.is_report_file_uploaded &&
                        modernisation.modernisation.is_voucher_file_uploaded
                          ? 3
                          : modernisation.modernisation.status
                      }
                      styles={{ fontSize: 13, px: 22, py: 8.5 }}
                    />

                    <div className="relative">
                      {" "}
                      <span
                        className={`cursor-pointer rounded-[100px] text-[13px] font-medium leading-[15px] bg-[#FEF6FF] py-[9.5px] px-[28px] ${
                          basicDataModernisation.priority === 0
                            ? "text-primary"
                            : basicDataModernisation.priority === 1
                            ? "text-[#DB2C9F]"
                            : basicDataModernisation.priority === 2
                            ? "text-[#FFAA29]"
                            : "text-[#DB2C2C]"
                        }`}
                        onClick={() => {
                          if (getRole() !== 2) {
                            setShowPriority(!showPriority);
                          }
                        }}
                      >
                        {basicDataModernisation.priority === 0
                          ? "Low"
                          : basicDataModernisation.priority === 1
                          ? "Medium"
                          : basicDataModernisation.priority === 2
                          ? "High"
                          : "Urgent"}
                      </span>
                      {showPriority && (
                        <div className="p-[20px] md:rounded-tl-[17px] md:rounded-tr-[0px] rounded-tr-[17px] rounded-bl-[17px] rounded-br-[17px] bg-white shadow-lg z-30 absolute flex flex-col items-start gap-[27px] left-2 top-10">
                          <div className="flex flex-col items-start gap-[16px]">
                            <span className=" text-n700 font-medium md:text-[14px] text-[12px]">
                              Priority
                            </span>
                            <div className="flex items-center gap-[4px]">
                              {Array.from({ length: 4 }).map((_, index) => {
                                return (
                                  <span
                                    key={index}
                                    className={`cursor-pointer rounded-[100px] py-[4.5px] sm:px-[20px] px-[15px] leading-[15px] sm:text-[10px] text-[9px] font-medium ${
                                      index === 0
                                        ? index ===
                                          basicDataModernisation.priority
                                          ? "text-primary bg-[#FFF5F3] border-[1px] border-primary"
                                          : "text-primary bg-[#FFF5F3]"
                                        : index === 1
                                        ? index ===
                                          basicDataModernisation.priority
                                          ? "text-[#DB2C9F] bg-[#FEF6FF] border-[1px] border-[#DB2C9F]"
                                          : "text-[#DB2C9F] bg-[#FEF6FF]"
                                        : index === 2
                                        ? index ===
                                          basicDataModernisation.priority
                                          ? "text-[#FFAA29] bg-[#FFF8EC] border-[1px] border-[#FFAA29]"
                                          : "text-[#FFAA29] bg-[#FFF8EC]"
                                        : index ===
                                          basicDataModernisation.priority
                                        ? "text-[#DB2C2C] bg-[#FEF6FF] border-[1px] border-[#DB2C2C]"
                                        : "text-[#DB2C2C] bg-[#FEF6FF]"
                                    }`}
                                    onClick={() => {
                                      setbasicDataModernisation((prev) => ({
                                        ...prev,
                                        priority: index,
                                      }));
                                    }}
                                  >
                                    {index === 0
                                      ? "Low"
                                      : index === 1
                                      ? "Medium"
                                      : index === 2
                                      ? "High"
                                      : "Urgent"}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                          {modernisation.modernisation.priority !==
                            basicDataModernisation.priority && (
                            <div className="flex items-center gap-[6px] w-full">
                              <button
                                className="w-[50%] py-[5px] text-[11px] font-semibold leading-[20px] rounded-[20px] border-[1.2px] border-n600 text-n600"
                                onClick={() => {
                                  setbasicDataModernisation((prev) => ({
                                    ...prev,
                                    priority:
                                      modernisation.modernisation.priority,
                                  }));
                                  setShowPriority(false);
                                }}
                              >
                                Cancel
                              </button>
                              <button
                                className="w-[50%] py-[5px] text-[11px] font-semibold leading-[20px] rounded-[20px] bg-primary text-white"
                                onClick={() => {
                                  handleEditWorkorder({
                                    id: modernisation.modernisation.id,
                                    priority: basicDataModernisation.priority,
                                  });
                                }}
                              >
                                Save
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {modernisation.reports &&
                    modernisation.reports?.length > 0 ? (
                      <WorkOrderStatus
                        status={
                          modernisation.modernisation
                            .is_report_file_uploaded === false
                            ? "onUpRep"
                            : modernisation.reports[
                                modernisation.reports.length - 1
                              ].type === 1
                            ? "rep"
                            : "noRep"
                        }
                        styles={{ fontSize: 13, px: 22, py: 8.5 }}
                      />
                    ) : (
                      <WorkOrderStatus
                        status="noRep"
                        styles={{ fontSize: 13, px: 22, py: 8.5 }}
                      />
                    )}

                    <div className="relative">
                      <WorkOrderStatus
                        status={
                          modernisation.modernisation
                            .is_certificate_file_uploaded === false
                            ? "onUpAcc"
                            : modernisation.acceptance_certificates &&
                              modernisation.acceptance_certificates?.length >
                                0 &&
                              modernisation.acceptance_certificates[
                                modernisation.acceptance_certificates.length - 1
                              ].type === 1
                            ? "acc"
                            : "noAcc"
                        }
                        styles={{ fontSize: 13, px: 22, py: 8.5 }}
                      />
                    </div>

                    {modernisation.modernisation.require_return_voucher ? (
                      <div className="relative">
                        <WorkOrderStatus
                          status={
                            modernisation.modernisation
                              .is_voucher_file_uploaded === false
                              ? "onUpVo"
                              : modernisation.return_vouchers &&
                                modernisation.return_vouchers?.length > 0 &&
                                modernisation.return_vouchers[
                                  modernisation.return_vouchers.length - 1
                                ].is_last
                              ? "vo"
                              : "noVo"
                          }
                          styles={{ fontSize: 13, px: 22, py: 8.5 }}
                          setState={setVisibleReqVoucherPopup}
                        />
                        {visibleReqVoucherPopup &&
                          modernisation.modernisation.status < 2 &&
                          getRole() !== 2 && (
                            <RequirementPopup
                              woId={modernisation.modernisation.id}
                              RequirementType="return voucher"
                              Requirement={
                                modernisation.modernisation
                                  .require_return_voucher
                              }
                              extantionType="modernisation"
                              setState={setVisibleReqVoucherPopup}
                              fetchOneWorkOrder={fetchOneModernisation}
                            />
                          )}
                      </div>
                    ) : modernisation.modernisation.status < 2 &&
                      getRole() !== 2 ? (
                      <div className="relative">
                        <WorkOrderStatus
                          status={"unneededVo"}
                          styles={{ fontSize: 13, px: 22, py: 8.5 }}
                          setState={setVisibleReqVoucherPopup}
                        />
                        {visibleReqVoucherPopup && getRole() !== 2 && (
                          <RequirementPopup
                            woId={modernisation.modernisation.id}
                            RequirementType="return voucher"
                            Requirement={
                              modernisation.modernisation
                                .require_return_voucher!
                            }
                            extantionType="modernisation"
                            setState={setVisibleReqVoucherPopup}
                            fetchOneWorkOrder={fetchOneModernisation}
                          />
                        )}
                      </div>
                    ) : null}
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
                          modernisation.attachments.length !== 0 && (
                            <label
                              htmlFor="attachements"
                              className="text-[17px] text-n700 leading-[30px] font-medium"
                            >
                              Attachements
                            </label>
                          )
                        )}

                        <div className="flex gap-[20px] flex-wrap">
                          {modernisation.attachments.length > 0 &&
                            modernisation.attachments
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
                                    onClick={() => {
                                      if (attach.is_completed) {
                                        downloadFile(
                                          attach.id,
                                          "download-workorder-attachment",
                                          attach.file_name,
                                          (progress) => {
                                            setModernisation((prev) => {
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
                                            setModernisation((prev) => {
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
                                                  localStorage.getItem(
                                                    "user_id"
                                                  )!
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
                                    </div>
                                    {getRole() !== 2 &&
                                      (attach.is_completed ? (
                                        <span
                                          className="w-[8%] border-l-[2px] h-full border-n400 px-[3px] text-[12px] hidden group-hover:flex items-center justify-center"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            upload_or_delete_workorder_files_for_attachements(
                                              modernisation.modernisation.id,
                                              attach.id,
                                              "delete",
                                              "modernisation",
                                              setIsLoadingDeleteFile,
                                              fetchOneModernisation
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
                                              onClick={async (e) => {
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
                                              }}
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
                                              onClick={() => {
                                                handleCancelUpload(
                                                  attach.id,
                                                  undefined,
                                                  undefined,
                                                  setIsLoadingCancelUpload,
                                                  fetchOneModernisation
                                                );
                                              }}
                                            >
                                              🗙
                                            </span>
                                          </div>
                                        )
                                      ))}
                                  </div>
                                );
                              })}

                          {uploadedAttachOnCreation.length !== 0 &&
                            uploadedAttachOnCreation
                              .filter(
                                (attach) =>
                                  attach.workorder ===
                                  modernisation.modernisation.id
                              )
                              .map((attach, index) => {
                                return (
                                  <div
                                    key={index}
                                    className={`cursor-pointer sm:w-[46%] w-full flex items-center justify-between px-[12px] py-[8px] rounded-[15px] group border-[1px] border-n400`}
                                    onClick={() => {
                                      downloadFile(
                                        attach.id,
                                        "download-workorder-attachment",
                                        attach.file_name,
                                        (progress) => {
                                          dispatch(
                                            setDownloadProgress({
                                              id: attach.id,
                                              progress: `${progress.toFixed(
                                                0
                                              )}`,
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
                                            modernisation.modernisation.id,
                                            attach.id,
                                            "delete",
                                            "modernisation",
                                            setIsLoadingDeleteFile,
                                            fetchOneModernisation
                                          );
                                          //await fetchOneModernisation ();
                                          dispatch(
                                            removeAttachOnCreationArray(
                                              attach.id
                                            )
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
                              })}

                          {uploadingFiles.attachFiles.length !== 0 &&
                            uploadingFiles.attachFiles
                              .filter((attach) =>
                                modernisation.attachments.some(
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
                                      fetchFunc={fetchOneModernisation}
                                      id={attach.id}
                                      progress={attach.progress}
                                      file={attach.file}
                                      fileType="attachements"
                                    />
                                  </div>
                                );
                              })}
                          {getRole() !== 2 && (
                            <div
                              className="flex flex-col sm:w-[46%] w-full"
                              onDragOver={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                              onDrop={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const files = e.dataTransfer.files;

                                // Ensure files is not null and handle each file
                                if (files) {
                                  Array.from(files).forEach(async (file) => {
                                    await handleFileChange(
                                      dispatch,
                                      modernisation.modernisation.id,
                                      "attachements",
                                      "modernisation",
                                      file,
                                      setIsLoadingAttach,
                                      fetchOneModernisation,
                                      fileInputRef
                                    );
                                  });
                                }
                              }}
                            >
                              <input
                                type="file"
                                name="attachement"
                                id="attachement"
                                accept=".doc,.docx,.xls,.xlsx,.ppt,.pptx,.pdf,.txt,.jpg,.jpeg,.png,.gif,.bmp,.webp,.svg"
                                ref={fileInputRef}
                                onChange={async (e) => {
                                  const file = e.target.files
                                    ? e.target.files[0]
                                    : null;
                                  if (file) {
                                    await handleFileChange(
                                      dispatch,
                                      modernisation.modernisation.id,
                                      "attachements",
                                      "modernisation",
                                      file,
                                      setIsLoadingAttach,
                                      fetchOneModernisation,
                                      fileInputRef
                                    );
                                  }
                                }}
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
                {(isEditing_Title_tic || isEditing_desc) && (
                  <div className="flex items-center justify-end gap-[6px] w-full">
                    <button
                      className="px-[23px] py-[5px] text-[11px] font-semibold leading-[20px] rounded-[20px] border-[1.2px] border-n600 text-n600"
                      onClick={() => {
                        setIsEditing_Title_tic(false);
                        setIsEditing_desc(false);
                        setbasicDataModernisation((prev) => ({
                          ...prev,
                          title: modernisation.modernisation.title,
                          description: modernisation.modernisation.description,
                          id: modernisation.modernisation.id,
                        }));
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-[25px] py-[5px] text-[11px] font-semibold leading-[20px] rounded-[20px] bg-primary text-white"
                      onClick={() => {
                        handleEditWorkorder({
                          title: basicDataModernisation.title,
                          id: basicDataModernisation.id,
                          description: basicDataModernisation.description,
                        });
                      }}
                    >
                      Save
                    </button>
                  </div>
                )}
              </div>

              <div className="w-full flex flex-col items-start gap-[23px]">
                {modernisation.modernisation.status > 1 && (
                  <>
                    <div
                      className={`w-full flex flex-col gap-[15px] md:border-[1px] md:border-n400 rounded-[20px] md:px-[25px] md:py-[32px]`}
                    >
                      <label
                        htmlFor="report-label"
                        className="leading-[36px] text-primary text-[24px] font-semibold w-fit"
                      >
                        Report
                      </label>
                      <div className="flex w-full items-center flex-wrap gap-[16px]">
                        {modernisation.reports &&
                          modernisation.reports.length > 0 &&
                          modernisation.reports
                            .filter((report) =>
                              uploadingFiles.reportFiles.every(
                                (rf) => rf.id !== report.id
                              )
                            )
                            .map((report) => {
                              return (
                                <div
                                  key={report.id}
                                  className={`cursor-pointer sm:w-[48%] lg:w-[31%] w-full flex items-center justify-between py-[9px] bg-white shadow-lg rounded-[15px] ${
                                    !report.is_completed &&
                                    (report.uploaded_by ===
                                    Number(
                                      Number(
                                        Number(
                                          Number(
                                            Number(
                                              localStorage.getItem("user_id")!
                                            )
                                          )
                                        )
                                      )
                                    )
                                      ? "border-[2px] border-[#db2c2c]"
                                      : "border-[2px] border-[#FFB84D]")
                                  } `}
                                  onClick={() => {
                                    if (report.is_completed) {
                                      downloadFile(
                                        report.id,
                                        "download-workorder-report",
                                        report.file_name,
                                        (progress) => {
                                          // You can update the progress in the state to show it in the UI
                                          setModernisation((prev) => {
                                            if (!prev) return null;

                                            return {
                                              ...prev,
                                              reports: prev.reports?.map(
                                                (rep) =>
                                                  rep.id === report.id
                                                    ? {
                                                        ...rep,
                                                        downloadProgress: `${progress.toFixed(
                                                          0
                                                        )}`,
                                                      }
                                                    : rep
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
                                              reports: prev.reports?.map(
                                                (rep) =>
                                                  rep.id === report.id
                                                    ? {
                                                        ...rep,
                                                        downloadProgress: `0`,
                                                      }
                                                    : rep
                                              ),
                                            };
                                          });
                                        }
                                      );
                                    }
                                  }}
                                >
                                  <div className="flex items-center justify-between w-full px-[20px]">
                                    <div className="flex items-center gap-[9px] w-[95%]">
                                      {report.downloadProgress &&
                                        report.downloadProgress !== "0" && (
                                          <CircularProgress
                                            progress={parseFloat(
                                              report.downloadProgress || "0"
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
                                            report.is_completed
                                              ? "#6F6C8F"
                                              : report.uploaded_by ===
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
                                      <div className="flex flex-col items-start gap-1 w-full">
                                        <span
                                          className={`text-[13px] font-medium leading-[20px] overflow-hidden w-[90%] text-ellipsis text-nowrap ${
                                            report.is_completed
                                              ? "text-n600"
                                              : report.uploaded_by ===
                                                Number(
                                                  localStorage.getItem(
                                                    "user_id"
                                                  )!
                                                )
                                              ? "text-[#DB2C2C]"
                                              : "text-[#FFB84D]"
                                          }`}
                                        >
                                          {report.file_name}
                                        </span>
                                        <div className="flex items-center justify-between w-full">
                                          <span
                                            className={`text-[12px] leading-[20px] font-medium ${
                                              report.is_completed
                                                ? report.type === 1
                                                  ? "text-primary"
                                                  : "text-[#DB2C9F]"
                                                : report.uploaded_by ===
                                                  Number(
                                                    localStorage.getItem(
                                                      "user_id"
                                                    )!
                                                  )
                                                ? "text-[#DB2C2C]"
                                                : "text-[#FFB84D]"
                                            }`}
                                          >
                                            {report.type === 1
                                              ? "Final"
                                              : "Partial"}
                                          </span>
                                          {report.refuse_message && (
                                            <div
                                              className="relative"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                              }}
                                            >
                                              <svg
                                                className="peer"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="#4A3AFF"
                                                version="1.1"
                                                id="Capa_1"
                                                width="14px"
                                                height="14px"
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
                                                    <span>
                                                      {report.refuse_message}
                                                    </span>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                        </div>

                                        <span
                                          className={`text-[12px] leading-[20px] ${
                                            report.is_completed
                                              ? "text-n600"
                                              : report.uploaded_by ===
                                                Number(
                                                  localStorage.getItem(
                                                    "user_id"
                                                  )!
                                                )
                                              ? "text-[#DB2C2C]"
                                              : "text-[#FFB84D]"
                                          }`}
                                        >
                                          {formatDate(`${report.uploaded_at}`)}
                                        </span>
                                      </div>
                                    </div>
                                    {!report.is_completed &&
                                      report.uploaded_by ===
                                        Number(
                                          localStorage.getItem("user_id")!
                                        ) &&
                                      !isLoadingCancelUpload && (
                                        <div className="flex flex-col items-center gap-3">
                                          <label
                                            className="text-[12px] flex items-center justify-center hover:scale-110 cursor-pointer"
                                            htmlFor="reupload"
                                            onClick={async (e) => {
                                              e.stopPropagation();

                                              const fileFromIndexedDB =
                                                await getFilesByIdFromIndexedDB(
                                                  report.id
                                                );
                                              if (fileFromIndexedDB[0]) {
                                                handleFileInputChangeOfResumeUpload(
                                                  fileFromIndexedDB[0]
                                                );
                                              } else {
                                                handleLabelClick(
                                                  report.id,
                                                  "report"
                                                );
                                              }
                                            }}
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
                                            onClick={() => {
                                              handleCancelUpload(
                                                report.id,
                                                undefined,
                                                undefined,
                                                setIsLoadingCancelUpload,
                                                fetchOneModernisation
                                              );
                                            }}
                                          >
                                            🗙
                                          </span>
                                        </div>
                                      )}
                                  </div>
                                </div>
                              );
                            })}

                        {uploadingFiles.reportFiles.length > 0 &&
                          uploadingFiles.reportFiles.map((report, index) => {
                            return (
                              <div
                                className="w-full sm:w-[48%] lg:w-[24%]"
                                key={index}
                              >
                                <UploadingFile
                                  id={report.id}
                                  fetchFunc={fetchOneModernisation}
                                  progress={report.progress}
                                  file={report.file}
                                  fileType="report"
                                />
                              </div>
                            );
                          })}

                        {(modernisation.reports === null ||
                          (modernisation.reports &&
                            modernisation.reports[
                              modernisation.reports?.length - 1
                            ].type !== 1)) && (
                          <div
                            className="cursor-pointer w-full sm:w-[48%] lg:w-[31%] py-[10px] px-[45px] flex items-center justify-center bg-white shadow-lg shadow-slate-300 rounded-[15px]"
                            onClick={() => {
                              handleOpenDialog(addReportDialogRef);
                            }}
                          >
                            <span className="text-[12px] text-primary font-semibold leading-[13px] py-[30px] px-[5px] text-center flex flex-col items-center">
                              Upload new files
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-end w-full">
                        {modernisation.reports &&
                          modernisation.reports[
                            modernisation.reports?.length - 1
                          ].type === 1 &&
                          getRole() !== 2 && (
                            <div className="flex items-center gap-[12px]">
                              <button
                                className="sm:px-[26px] px-[16px] py-[10px] rounded-[30px] border-[2px] border-primary text-primary text-[13px] font-semibold leading-[20px] w-fit"
                                onClick={() => {
                                  handle_edit_or_reqUpdate_report(
                                    modernisation.modernisation.id,
                                    false,
                                    "modernisation",
                                    setisLoadingFinalize,
                                    fetchOneModernisation
                                  );
                                }}
                              >
                                {isLoadingFinalize ? (
                                  <RotatingLines
                                    visible={true}
                                    width="20"
                                    strokeWidth="3"
                                    strokeColor="#4A3AFF"
                                  />
                                ) : (
                                  "Edit reports"
                                )}
                              </button>

                              <button
                                className=" sm:px-[26px] px-[16px] py-[10px] rounded-[30px] border-[2px] bg-primary border-primary text-white text-[13px] font-semibold leading-[20px] w-fit"
                                onClick={() => {
                                  handleOpenDialog(requestUpdateDialogRef);
                                }}
                              >
                                {isLoadingFinalize ? (
                                  <RotatingLines
                                    visible={true}
                                    width="20"
                                    strokeWidth="3"
                                    strokeColor="#4A3AFF"
                                  />
                                ) : (
                                  "Request Update"
                                )}
                              </button>
                            </div>
                          )}
                      </div>
                    </div>

                    <div className="w-full flex flex-col gap-[15px] md:border-[1px] md:border-n400 rounded-[20px] md:px-[25px] md:py-[32px]">
                      <label
                        htmlFor="acceptence-label"
                        className="leading-[36px] text-primary text-[24px] font-semibold w-fit"
                      >
                        Acceptance certificate
                      </label>
                      <div className="flex w-full items-center flex-wrap gap-[16px]">
                        {modernisation.acceptance_certificates &&
                          modernisation.acceptance_certificates.length > 0 &&
                          modernisation.acceptance_certificates
                            .filter((certificate) =>
                              uploadingFiles.acceptenceFiles.every(
                                (af) => af.id !== certificate.id
                              )
                            )
                            .map((certificate, index) => {
                              return (
                                <div
                                  key={index}
                                  className={`cursor-pointer sm:w-[48%] lg:w-[31%] w-full flex items-center justify-between px-[12px] py-[14px] bg-white shadow-lg rounded-[15px] ${
                                    !certificate.is_completed &&
                                    (certificate.uploaded_by ===
                                    Number(localStorage.getItem("user_id")!)
                                      ? "border-[2px] border-[#db2c2c]"
                                      : "border-[2px] border-[#FFB84D]")
                                  }`}
                                  onClick={() => {
                                    if (certificate.is_completed) {
                                      downloadFile(
                                        certificate.id,
                                        "download-workorder-acceptance-certificate",
                                        certificate.file_name,
                                        (progress) => {
                                          setModernisation((prev) => {
                                            if (!prev) return null;

                                            return {
                                              ...prev,
                                              acceptance_certificates:
                                                prev.acceptance_certificates?.map(
                                                  (cert) =>
                                                    cert.id === certificate.id
                                                      ? {
                                                          ...cert,
                                                          downloadProgress: `${progress.toFixed(
                                                            0
                                                          )}`,
                                                        }
                                                      : cert
                                                ),
                                            };
                                          });
                                        },
                                        () => {
                                          setModernisation((prev) => {
                                            if (!prev) return null;

                                            return {
                                              ...prev,
                                              acceptance_certificates:
                                                prev.acceptance_certificates?.map(
                                                  (cert) =>
                                                    cert.id === certificate.id
                                                      ? {
                                                          ...cert,
                                                          downloadProgress: `0`,
                                                        }
                                                      : cert
                                                ),
                                            };
                                          });
                                        }
                                      );
                                    }
                                  }}
                                >
                                  <div className="flex items-center gap-[9px] w-full">
                                    {certificate.downloadProgress &&
                                      certificate.downloadProgress !== "0" && (
                                        <CircularProgress
                                          progress={parseFloat(
                                            certificate.downloadProgress || "0"
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
                                          certificate.is_completed
                                            ? "#6F6C8F"
                                            : certificate.uploaded_by ===
                                              Number(
                                                localStorage.getItem("user_id")!
                                              )
                                            ? "#DB2C2C"
                                            : " #FFB84D"
                                        }
                                      />
                                    </svg>
                                    <div className="flex flex-col items-start w-full relative">
                                      <span
                                        className={`text-[13px] font-medium leading-[20px] mb-2 overflow-hidden w-[90%] text-ellipsis text-nowrap ${
                                          certificate.is_completed
                                            ? "text-n600"
                                            : certificate.uploaded_by ===
                                              Number(
                                                localStorage.getItem("user_id")!
                                              )
                                            ? "text-[#DB2C2C]"
                                            : "text-[#FFB84D]"
                                        }`}
                                      >
                                        {certificate.file_name}
                                      </span>
                                      <span
                                        className={`text-[13px] font-medium leading-[20px]  ${
                                          certificate.is_completed
                                            ? certificate.type === 1
                                              ? "text-[#48C1B5]"
                                              : certificate.type === 2
                                              ? "text-[#FFAA29]"
                                              : "text-[#DB2C2C]"
                                            : certificate.uploaded_by ===
                                              Number(
                                                localStorage.getItem("user_id")!
                                              )
                                            ? "text-[#DB2C2C]"
                                            : "text-[#FFB84D]"
                                        }`}
                                      >
                                        {certificate.type === 1
                                          ? "Accepted"
                                          : certificate.type === 2
                                          ? "Accepted with reserve"
                                          : "Rejected"}
                                      </span>
                                      <span
                                        className={`text-[12px] leading-[20px] ${
                                          certificate.is_completed
                                            ? "text-n600"
                                            : certificate.uploaded_by ===
                                              Number(
                                                localStorage.getItem("user_id")!
                                              )
                                            ? "text-[#DB2C2C]"
                                            : "text-[#FFB84D]"
                                        }`}
                                      >
                                        {formatDate(
                                          `${certificate.uploaded_at}`
                                        )}
                                      </span>
                                      {modernisation.acceptance_certificates
                                        ?.length === ++index &&
                                        modernisation.acceptance_certificates[
                                          modernisation.acceptance_certificates
                                            .length - 1
                                        ].is_completed &&
                                        localStorage.getItem("role") !==
                                          "2" && (
                                          <div
                                            className="absolute right-2 top-[80%] translate-y-[-50%]"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                            }}
                                          >
                                            <svg
                                              className="hover:scale-115 transition-all duration-100"
                                              onClick={() => {
                                                setShowEditCertificatType(
                                                  !showEditCertificatType
                                                );
                                              }}
                                              xmlns="http://www.w3.org/2000/svg"
                                              width="14"
                                              height="14"
                                              viewBox="0 0 14 14"
                                              fill="none"
                                            >
                                              <path
                                                d="M8.87471 2.55459L11.0224 4.70224M7.44294 12.5769H13.17M1.71588 9.71341L1 12.5769L3.86353 11.8611L12.1577 3.56685C12.4262 3.29835 12.5769 2.93424 12.5769 2.55459C12.5769 2.17494 12.4262 1.81083 12.1577 1.54233L12.0346 1.4192C11.7661 1.15079 11.402 1 11.0224 1C10.6427 1 10.2786 1.15079 10.0101 1.4192L1.71588 9.71341Z"
                                                stroke="#797C93"
                                                strokeWidth="1.2"
                                                fillOpacity="round"
                                                strokeLinejoin="round"
                                              />
                                            </svg>
                                            {showEditCertificatType && (
                                              <div className="flex flex-col gap-[18px] items-center w-fit bg-white p-[15px] rounded-[20px] shadow-xl absolute left-1/2 top-6 transform -translate-x-[67%]">
                                                <div className="flex items-center flex-col md:flex-row gap-[6px] w-full">
                                                  {certeficatTypes.map(
                                                    (type, index) => {
                                                      return (
                                                        <span
                                                          key={index}
                                                          className={`cursor-pointer text-nowrap px-[16px] py-[10px] rounded-[20px] text-[13px] leading-[13px] font-semibold}`}
                                                          style={{
                                                            backgroundColor:
                                                              type.type ===
                                                              certType
                                                                ? `${type.color}`
                                                                : "white",
                                                            color:
                                                              type.type ===
                                                              certType
                                                                ? "white"
                                                                : `${type.color}`,
                                                            border: `solid 1px ${type.color}`,
                                                          }}
                                                          onClick={() => {
                                                            setCertType(
                                                              type.type
                                                            );
                                                          }}
                                                        >
                                                          {type.name}
                                                        </span>
                                                      );
                                                    }
                                                  )}
                                                </div>

                                                {modernisation
                                                  .acceptance_certificates[
                                                  modernisation
                                                    .acceptance_certificates
                                                    .length - 1
                                                ].type !== certType && (
                                                  <div className="flex items-center gap-[6px] w-full">
                                                    <button
                                                      className="w-[50%] py-[5px] text-[11px] font-semibold leading-[20px] rounded-[20px] border-[1.2px] border-n600 text-n600"
                                                      onClick={() => {
                                                        setCertType(
                                                          modernisation.acceptance_certificates![
                                                            modernisation.acceptance_certificates!
                                                              .length - 1
                                                          ].type
                                                        );
                                                        setShowEditCertificatType(
                                                          false
                                                        );
                                                      }}
                                                    >
                                                      Cancel
                                                    </button>
                                                    <button
                                                      className="w-[50%] py-[5px] text-[11px] font-semibold leading-[20px] rounded-[20px] bg-primary text-white"
                                                      onClick={async () => {
                                                        await handle_update_cert_type(
                                                          modernisation
                                                            .modernisation.id,
                                                          certType,
                                                          "modernisation",
                                                          fetchOneModernisation
                                                        );
                                                        setShowEditCertificatType(
                                                          false
                                                        );
                                                      }}
                                                    >
                                                      Save
                                                    </button>
                                                  </div>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        )}

                                      {!certificate.is_completed &&
                                        certificate.uploaded_by ===
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
                                          <>
                                            <label
                                              className=" absolute right-0 top-[20%] translate-y-[-50%] text-[12px] flex items-center justify-center hover:scale-110 cursor-pointer"
                                              htmlFor="reupload"
                                              onClick={async (e) => {
                                                e.stopPropagation();

                                                const fileFromIndexedDB =
                                                  await getFilesByIdFromIndexedDB(
                                                    certificate.id
                                                  );
                                                if (fileFromIndexedDB[0]) {
                                                  handleFileInputChangeOfResumeUpload(
                                                    fileFromIndexedDB[0]
                                                  );
                                                } else {
                                                  handleLabelClick(
                                                    certificate.id,
                                                    "certificate"
                                                  );
                                                }
                                              }}
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
                                              className=" absolute right-0 bottom-[6%] px-[3px] rounded-[50%] text-white bg-[#f33e3e] text-[12px] cursor-pointer hover:scale-105"
                                              onClick={() => {
                                                handleCancelUpload(
                                                  certificate.id,
                                                  undefined,
                                                  undefined,
                                                  setIsLoadingCancelUpload,
                                                  fetchOneModernisation
                                                );
                                              }}
                                            >
                                              🗙
                                            </span>
                                          </>
                                        )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}

                        {uploadingFiles.acceptenceFiles?.length > 0 &&
                          uploadingFiles.acceptenceFiles.map(
                            (acceptence, index) => {
                              return (
                                <div
                                  className="w-full sm:w-[48%] lg:w-[24%]"
                                  key={index}
                                >
                                  <UploadingFile
                                    key={index}
                                    fetchFunc={fetchOneModernisation}
                                    id={acceptence.id}
                                    progress={acceptence.progress}
                                    file={acceptence.file}
                                    fileType="certificate"
                                  />
                                </div>
                              );
                            }
                          )}
                        {modernisation.modernisation.status < 3 &&
                          modernisation.acceptance_certificates !== undefined &&
                          (modernisation.acceptance_certificates === null ||
                            (modernisation.acceptance_certificates.length > 0 &&
                              modernisation.acceptance_certificates[
                                modernisation.acceptance_certificates.length - 1
                              ].type !== 1)) && (
                            <div
                              className="cursor-pointer w-full sm:w-[48%] lg:w-[31%] py-[18px] px-[45px] flex items-center justify-center bg-white shadow-lg rounded-[15px]"
                              onClick={() => {
                                handleOpenDialog(addCertificatDialogRef);
                              }}
                            >
                              <span className=" text-[12px] text-primary font-semibold leading-[13px] py-[30px] px-[5px] text-center flex flex-col items-center">
                                Add new certificate
                              </span>
                            </div>
                          )}
                      </div>
                    </div>

                    {modernisation.modernisation.require_return_voucher && (
                      <div className="flex flex-col items-end w-full gap-[30px] md:border-[1px] md:border-n400 rounded-[20px] md:px-[25px] md:py-[32px]">
                        <div className="w-full flex flex-col gap-[15px]">
                          <label
                            htmlFor="Voucher-label"
                            className="leading-[36px] text-primary text-[24px] font-semibold w-fit"
                          >
                            Return Voucher
                          </label>
                          <div className="flex w-full items-center flex-wrap gap-[16px]">
                            {modernisation.return_vouchers &&
                              modernisation.return_vouchers.length > 0 &&
                              modernisation.return_vouchers
                                .filter((voucher) =>
                                  uploadingFiles.voucherFiles.every(
                                    (af) => af.id !== voucher.id
                                  )
                                )
                                .map((voucher, index) => {
                                  return (
                                    <div
                                      key={index}
                                      className={`cursor-pointer sm:w-[48%] lg:w-[31%] w-full flex items-center justify-between px-[12px] py-[14px] bg-white shadow-lg rounded-[15px] ${
                                        !voucher.is_completed &&
                                        (voucher.uploaded_by ===
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
                                          ? "border-[2px] border-[#db2c2c]"
                                          : "border-[2px] border-[#FFB84D]")
                                      }`}
                                      onClick={() => {
                                        if (voucher.is_completed) {
                                          downloadFile(
                                            voucher.id,
                                            "download-workorder-return-voucher",
                                            voucher.file_name,
                                            (progress) => {
                                              setModernisation((prev) => {
                                                if (!prev) return null;

                                                return {
                                                  ...prev,
                                                  return_vouchers:
                                                    prev.return_vouchers?.map(
                                                      (vouch) =>
                                                        vouch.id === voucher.id
                                                          ? {
                                                              ...vouch,
                                                              downloadProgress: `${progress.toFixed(
                                                                0
                                                              )}`,
                                                            }
                                                          : vouch
                                                    ),
                                                };
                                              });
                                            },
                                            () => {
                                              setModernisation((prev) => {
                                                if (!prev) return null;

                                                return {
                                                  ...prev,
                                                  return_vouchers:
                                                    prev.return_vouchers?.map(
                                                      (vouch) =>
                                                        vouch.id === voucher.id
                                                          ? {
                                                              ...vouch,
                                                              downloadProgress: `0`,
                                                            }
                                                          : vouch
                                                    ),
                                                };
                                              });
                                            }
                                          );
                                        }
                                      }}
                                    >
                                      <div className="flex items-center gap-[9px] w-full">
                                        {voucher.downloadProgress &&
                                          voucher.downloadProgress !== "0" && (
                                            <CircularProgress
                                              progress={parseFloat(
                                                voucher.downloadProgress || "0"
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
                                              voucher.is_completed
                                                ? "#6F6C8F"
                                                : voucher.uploaded_by ===
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
                                        <div className="flex flex-col items-start w-full relative">
                                          <span
                                            className={`text-[13px] font-medium leading-[20px] mb-2 overflow-hidden w-[90%] text-ellipsis text-nowrap ${
                                              voucher.is_completed
                                                ? "text-n600"
                                                : voucher.uploaded_by ===
                                                  Number(
                                                    localStorage.getItem(
                                                      "user_id"
                                                    )!
                                                  )
                                                ? "text-[#DB2C2C]"
                                                : "text-[#FFB84D]"
                                            }`}
                                          >
                                            {voucher.file_name}
                                          </span>
                                          <span
                                            className={`text-[12px] leading-[20px] ${
                                              voucher.is_completed
                                                ? "text-n600"
                                                : voucher.uploaded_by ===
                                                  Number(
                                                    localStorage.getItem(
                                                      "user_id"
                                                    )!
                                                  )
                                                ? "text-[#DB2C2C]"
                                                : "text-[#FFB84D]"
                                            }`}
                                          >
                                            {formatDate(
                                              `${voucher.uploaded_at}`
                                            )}
                                          </span>

                                          {!voucher.is_completed &&
                                            voucher.uploaded_by ===
                                              Number(
                                                localStorage.getItem("user_id")!
                                              ) &&
                                            !isLoadingCancelUpload && (
                                              <>
                                                <label
                                                  className=" absolute right-0 top-[20%] translate-y-[-50%] text-[12px] flex items-center justify-center hover:scale-110 cursor-pointer"
                                                  htmlFor="reupload"
                                                  onClick={async (e) => {
                                                    e.stopPropagation();

                                                    const fileFromIndexedDB =
                                                      await getFilesByIdFromIndexedDB(
                                                        voucher.id
                                                      );
                                                    if (fileFromIndexedDB[0]) {
                                                      handleFileInputChangeOfResumeUpload(
                                                        fileFromIndexedDB[0]
                                                      );
                                                    } else {
                                                      handleLabelClick(
                                                        voucher.id,
                                                        "certificate"
                                                      );
                                                    }
                                                  }}
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
                                                  className=" absolute right-0 bottom-[6%] px-[3px] rounded-[50%] text-white bg-[#f33e3e] text-[12px] cursor-pointer hover:scale-105"
                                                  onClick={() => {
                                                    handleCancelUpload(
                                                      voucher.id,
                                                      undefined,
                                                      undefined,
                                                      setIsLoadingCancelUpload,
                                                      fetchOneModernisation
                                                    );
                                                  }}
                                                >
                                                  🗙
                                                </span>
                                              </>
                                            )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}

                            {uploadingFiles.voucherFiles?.length > 0 &&
                              uploadingFiles.voucherFiles.map(
                                (voucher, index) => {
                                  return (
                                    <div
                                      className="w-full sm:w-[48%] lg:w-[24%]"
                                      key={index}
                                    >
                                      <UploadingFile
                                        key={index}
                                        fetchFunc={fetchOneModernisation}
                                        id={voucher.id}
                                        progress={voucher.progress}
                                        file={voucher.file}
                                        fileType="voucher"
                                      />
                                    </div>
                                  );
                                }
                              )}
                            {modernisation.modernisation.status < 3 &&
                              modernisation.return_vouchers !== undefined &&
                              (modernisation.return_vouchers === null ||
                                (modernisation.return_vouchers.length > 0 &&
                                  !modernisation.return_vouchers[
                                    modernisation.return_vouchers.length - 1
                                  ].is_last)) &&
                              (localStorage.getItem("role") !== "2" ? (
                                <div
                                  className="cursor-pointer w-full sm:w-[48%] lg:w-[31%] py-[18px] px-[45px] flex items-center justify-center bg-white shadow-lg rounded-[15px]"
                                  onClick={() => {
                                    handleOpenDialog(addVoucherDialogRef);
                                  }}
                                >
                                  <span className=" text-[12px] text-primary font-semibold leading-[13px] py-[30px] px-[5px] text-center flex flex-col items-center">
                                    Add new vouchers
                                  </span>
                                </div>
                              ) : (
                                !modernisation.return_vouchers && (
                                  <div className="w-full flex items-center justify-center font-medium py-4 text-n600">
                                    Still there is no return voucher uploaded
                                  </div>
                                )
                              ))}
                          </div>
                        </div>
                        {localStorage.getItem("role") !== "2" && (
                          <button
                            className={`py-[10px] px-[45px] rounded-[30px] border-[2px] border-primary text-[14px] font-semibold ${
                              modernisation.return_vouchers &&
                              modernisation.return_vouchers[
                                modernisation.return_vouchers.length - 1
                              ].is_last
                                ? "text-primary"
                                : "bg-primary text-white"
                            }`}
                            onClick={() => {
                              modernisation.return_vouchers &&
                              modernisation.return_vouchers[
                                modernisation.return_vouchers.length - 1
                              ].is_last
                                ? handle_open_or_close_returnVoucher(
                                    modernisation.modernisation.id,
                                    "open",
                                    "modernisation",
                                    fetchOneModernisation,
                                    setIsLoadingVoucher
                                  )
                                : handle_open_or_close_returnVoucher(
                                    modernisation.modernisation.id,
                                    "close",
                                    "modernisation",
                                    fetchOneModernisation,
                                    setIsLoadingVoucher
                                  );
                            }}
                          >
                            {" "}
                            {!isLoadingVoucher ? (
                              modernisation.return_vouchers &&
                              modernisation.return_vouchers[
                                modernisation.return_vouchers.length - 1
                              ].is_last ? (
                                "Update"
                              ) : (
                                "Submit"
                              )
                            ) : (
                              <RotatingLines
                                visible={true}
                                width="20"
                                strokeWidth="3"
                                strokeColor="#111111"
                              />
                            )}
                          </button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
            {modernisation.modernisation.status === 0 ? (
              <div
                className={`w-full flex items-center ${
                  undoMessageVisible
                    ? "justify-between lg:flex-row flex-col "
                    : "justify-end"
                } `}
              >
                <button
                  className={`py-[12px] px-[48px] rounded-[30px] ${
                    selectedEng
                      ? "text-primary border-primary"
                      : "text-n400 border-n400"
                  } border-[2px]  leading-[20px] font-semibold text-[14px]`}
                  disabled={selectedEng ? false : true}
                  onClick={() => {
                    handle_Assignment_and_execute(
                      modernisation.modernisation.id,
                      "assign-modernisation",
                      "PUT",
                      "modernisation",
                      setIsLoading,
                      fetchOneModernisation,
                      selectedEng!.id
                    );
                  }}
                >
                  {isLoading ? (
                    <RotatingLines
                      visible={true}
                      width="20"
                      strokeWidth="3"
                      strokeColor="#4A3AFF"
                    />
                  ) : (
                    "Assing"
                  )}
                </button>
              </div>
            ) : modernisation.modernisation.status > 0 ? (
              <div
                className={`w-full flex items-center ${
                  undoMessageVisible
                    ? "justify-between lg:flex-row flex-col "
                    : "justify-end"
                } `}
              >
                {undoMessageVisible && (
                  <span className="text-[13px] font-medium leading-[30px] text-n700 flex sm:flex-row flex-col items-center text-center lg:pb-4">
                    This modernisation is set to be Executed!{" "}
                    <span
                      className="text-primary font-semibold cursor-pointer"
                      onClick={handleUndo}
                    >
                      {"  "}
                      Undo This action before {timeLeft} seconds
                    </span>
                  </span>
                )}

                <button
                  className={`py-[12px] px-[48px] w-full md:w-auto rounded-[30px] bg-primary text-white  border-[2px] leading-[20px] font-semibold text-[14px]
                   ${modernisation.modernisation.status !== 1 && "hidden"}  `}
                  disabled={isLoading ? true : false}
                  onClick={() => {
                    modernisation.modernisation.status === 1
                      ? handleExecute(modernisation.modernisation.id)
                      : null;
                  }}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center w-full">
                      <RotatingLines
                        visible={true}
                        width="20"
                        strokeWidth="3"
                        strokeColor="white"
                      />
                    </div>
                  ) : (
                    modernisation.modernisation.status === 1 &&
                    "Execution Finished"
                  )}
                </button>
              </div>
            ) : (
              ""
            )}
          </div>
        )}
      </div>

      <input
        ref={fileInputOnReuploadRef}
        type="file"
        className="hidden"
        name="reupload"
        onChange={(e) => {
          handleFileInputChangeOfResumeUpload({
            fileId: selectedIdFileForResumeUpload!,
            fileType: selectedFileTypeForResumeUpload!,
            fileContent: e.target.files![0],
          });
        }}
      />

      <AddCertificatPopup
        ref={addCertificatDialogRef}
        workorderId={modernisation?.modernisation.id}
        extantionType="modernisation"
        fetchOneWorkOrder={fetchOneModernisation}
      />
      <AddReportPopup
        ref={addReportDialogRef}
        workorderId={modernisation?.modernisation.id}
        extantionType="modernisation"
        fetchOneWorkOrder={fetchOneModernisation}
      />
      <RequestUpdatePopup
        ref={requestUpdateDialogRef}
        workorderId={modernisation?.modernisation.id}
        extantionType="modernisation"
        fetchOneWorkOrder={fetchOneModernisation}
      />
      <AddVoucherPopup
        ref={addVoucherDialogRef}
        workorderId={modernisation?.modernisation.id}
        extantionType="modernisation"
        fetchOneWorkOrder={fetchOneModernisation}
      />
    </div>
  );
};
export default ModernisationDetails;
