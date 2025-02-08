import { handleFileChangeWithRedux } from "../../func/los/uploadLosReport";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../Redux/store";
import { RootState } from "../../Redux/store";
import { resOfOneOrder } from "../../assets/types/LosCommands";
import { useState, useRef } from "react";
import UploadingFile from "../uploadingFile";
import { downloadFile } from "../../func/donwloadFile";
import CircularProgress from "../CircleProgress";
import { formatDate } from "../../func/formatDatr&Time";
import {
  handleCancelUpload,
  handle_resuming_upload,
} from "../../func/chunkUpload";
import {
  getFilesByIdFromIndexedDB,
  generateFileToken,
  IndexedDBFile,
} from "../../func/generateFileToken";
import { useSnackbar } from "notistack";
import { RotatingLines } from "react-loader-spinner";
import { getRole } from "../../func/getUserRole";

interface UploadLosReportProps {
  order: resOfOneOrder | null;
  setOrder: React.Dispatch<React.SetStateAction<resOfOneOrder | null>>;
  fetchOneLOS: () => void;
}

const UploadLosReport: React.FC<UploadLosReportProps> = ({
  order,
  fetchOneLOS,
  setOrder,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const uploadingFiles = useSelector(
    (state: RootState) => state.uploadingFiles
  );
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const fileInputOnReuploadRef = useRef<HTMLInputElement>(null);

  const [isLoadingUpload, setIsLoadingUpload] = useState(false);
  const [isLoadingCancelUpload, setIsLoadingCancelUpload] = useState(false);
  const [isLoadingReupload, setIsLoadinReupload] = useState(false);

  useState<number>();
  const [selectedIdFileForResumeUpload, setSelectedIdFileForResumeUpload] =
    useState<number>();

  const handleLabelClick = (fileId: number) => {
    setSelectedIdFileForResumeUpload(fileId);

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
              fetchOneLOS();
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
          "report",
          file_token,
          String(order!.line_of_sight.id),
          setIsLoadinReupload,
          fetchOneLOS,
          (message, options) =>
            enqueueSnackbar(message, { ...options, action: snackbarAction }) // Pass the action with the JSX button
        );

        setSelectedIdFileForResumeUpload(undefined);
      } catch (error) {
        console.error("Error handling file upload", error);
      }
    }
  };

  return (
    <div className="flex flex-col items-start gap-[30px] w-full md:border-[1px] md:border-n400 rounded-[20px] md:px-[25px] md:py-[32px]">
      <label
        htmlFor="Voucher-label"
        className="leading-[36px] text-primary text-[23px] font-semibold w-fit"
      >
        Uploaded report
      </label>
      {[0, 1, 2].includes(getRole()!) ? (
        <div
          className="flex flex-col items-start gap-[8px] w-[100%]"
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // const files = e.dataTransfer.files;
            // Add the files to the input element
            // handleFileChangeWithDragAndDropForMultipleFiles(files, setUploadedReports,setIsLoadingUpload);
          }}
        >
          <input
            type="file"
            name="upload-report"
            id="upload-report"
            accept=".doc,.docx,.xls,.xlsx,.ppt,.pptx,.pdf,.txt,.jpg,.jpeg,.png,.gif,.bmp,.webp,.svg"
            onChange={(e) => {
              const file = e.target.files ? e.target.files[0] : null;
              if (file) {
                handleFileChangeWithRedux(
                  dispatch,
                  order!.line_of_sight.id,
                  file,
                  setIsLoadingUpload,
                  fetchOneLOS
                );
              }
            }}
            className="hidden"
          />
          <label
            htmlFor="upload-report"
            className="cursor-pointer w-full py-[40px] flex flex-col items-center justify-center gap-[21.5px] border-dashed border-[2px] border-n400 rounded-[15px]"
          >
            {isLoadingUpload ? (
              <RotatingLines strokeColor="#6E7191" width="30" />
            ) : (
              <>
                {" "}
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
                <span className="text-[14px] text-n600 font-medium leading-[13px]">
                  Upload Report manually
                </span>
              </>
            )}
          </label>
        </div>
      ):                       order?.uploaded_reports.length === 0 &&       ( <div className="w-full flex items-center justify-center font-medium py-4 text-n600">
      Still there is no report uploaded
    </div>) }
      <div className="flex w-full items-center flex-wrap gap-[16px]">
        {order?.uploaded_reports
          .filter((report) =>
            uploadingFiles.reportFiles.every((rf) => rf.id !== report.id)
          )
          .map((report, index) => {
            return (
              <div
                key={index}
                className={`cursor-pointer sm:w-[48%] lg:w-[31%] w-full flex items-center justify-between px-[12px] py-[14px] bg-white shadow-lg rounded-[15px] ${
                  !report.is_completed &&
                  (report.uploaded_by ===
                  Number(localStorage.getItem("user_id")!)
                    ? "border-[2px] border-[#db2c2c]"
                    : "border-[2px] border-[#FFB84D]")
                }`}
                onClick={() => {
                  if (report.is_completed) {
                    downloadFile(
                      report.id,
                      "report",
                      report.file_name,
                      "line-of-sight",
                      (progress) => {
                        // You can update the progress in the state to show it in the UI
                        setOrder((prev) => {
                          if (!prev) return null;

                          return {
                            ...prev,
                            uploaded_reports: prev.uploaded_reports?.map(
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
                        setOrder((prev) => {
                          if (!prev) return null;

                          return {
                            ...prev,
                            uploaded_reports: prev.uploaded_reports?.map(
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
                          progress={parseFloat(report.downloadProgress || "0")}
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
                              Number(localStorage.getItem("user_id")!)
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
                              Number(localStorage.getItem("user_id")!)
                            ? "text-[#DB2C2C]"
                            : "text-[#FFB84D]"
                        }`}
                      >
                        {report.file_name}
                      </span>

                      <span
                        className={`text-[12px] leading-[20px] ${
                          report.is_completed
                            ? "text-n600"
                            : report.uploaded_by ===
                              Number(localStorage.getItem("user_id")!)
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
                      Number(localStorage.getItem("user_id")!) &&
                    !isLoadingCancelUpload && (
                      <div className="flex flex-col items-center gap-3">
                        <label
                          className="text-[12px] flex items-center justify-center hover:scale-110 cursor-pointer"
                          htmlFor="reupload"
                          onClick={async (e) => {
                            e.stopPropagation();

                            const fileFromIndexedDB =
                              await getFilesByIdFromIndexedDB(report.id);
                            if (fileFromIndexedDB[0]) {
                              handleFileInputChangeOfResumeUpload(
                                fileFromIndexedDB[0]
                              );
                            } else {
                              handleLabelClick(report.id);
                            }
                          }}
                        >
                          {isLoadingReupload ? (
                            <RotatingLines strokeColor="red" width="14" />
                          ) : (
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
                                  <rect width="14" height="14" fill="white" />
                                </clipPath>
                              </defs>
                            </svg>
                          )}
                        </label>
                        <span
                          className="px-[3px] rounded-[50%] text-white bg-[#f33e3e] text-[12px] cursor-pointer hover:scale-105"
                          onClick={() => {
                            handleCancelUpload(
                              report.id,
                              dispatch,
                              "report",
                              setIsLoadingCancelUpload,
                              fetchOneLOS
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
        {uploadingFiles.reportFiles
          .filter((report) =>
            order?.uploaded_reports.some((rep) => rep.id === report.id)
          )
          .map((report, index) => (
            <div className="w-full sm:w-[48%] lg:w-[24%]" key={index}>
              <UploadingFile
                id={report.id}
                file={report.file}
                progress={report.progress}
                fileType="report"
              />
            </div>
          ))}
      </div>
      <input
        ref={fileInputOnReuploadRef}
        type="file"
        className="hidden"
        name="reupload"
        onChange={(e) => {
          handleFileInputChangeOfResumeUpload({
            fileId: selectedIdFileForResumeUpload!,
            fileType: "report",
            fileContent: e.target.files![0],
          });
        }}
      />
    </div>
  );
};

export default UploadLosReport;
