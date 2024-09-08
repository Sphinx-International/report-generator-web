import { forwardRef } from "react";
import { handleCloseDialog } from "../../func/openDialog";
import { useState } from "react";
import { TheUploadingFile } from "../../assets/types/Mission";
import UploadingFile from ".././uploadingFile";
import { RotatingLines } from "react-loader-spinner";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../Redux/store";
import { useSelector } from "react-redux";
import { RootState } from "../../Redux/store";
import { handleFileChange } from "../../func/otherworkorderApis";

interface AddReportProps {
  workorderId: string;
  fetchOneWorkOrder: () => void;
}

type reportTypeIndex = 0 | 1;

const AddReportPopup = forwardRef<HTMLDialogElement, AddReportProps>(
  (props, ref) => {
    const [isLoading, setIsLoading] = useState(false);
    const [file, setFile] = useState<TheUploadingFile | undefined>();
    const dispatch = useDispatch<AppDispatch>();

    const reportTypes = ["Partial", "Final"];
    const [currentReportTypeIndex, setCurrentReportTypeIndex] = useState<0 | 1>(
      1
    );

    const uploadingReportFiles = useSelector(
      (state: RootState) => state.uploadingFiles.reportFiles
    );

    const handleNextClick = () => {
      setCurrentReportTypeIndex((prevIndex) => {
        const newIndex = (
          prevIndex === reportTypes.length - 1 ? 0 : prevIndex + 1
        ) as reportTypeIndex;
        return newIndex;
      });
    };

    const handlePreviousClick = () => {
      setCurrentReportTypeIndex((prevIndex) => {
        const newIndex = (
          prevIndex === 0 ? reportTypes.length - 1 : prevIndex - 1
        ) as reportTypeIndex;
        return newIndex;
      });
    };

    return (
      <dialog
        ref={ref}
        className="bg-white rounded-[20px] py-[30px] px-[25px] hidden flex-col items-center gap-[28px] w-[70%] md:w-[40%] lg:w-[27%] absolute left-[50%] top-[50%] -translate-x-[50%] -translate-y-[50%]"
      >
        <div className="w-full flex flex-col items-center gap-[17px]">
          <h3 className="text-[19px] font-semibold text-primary leading-[20px]">
            Upload Report{" "}
          </h3>
          <div className="w-full flex items-center gap-[11px]"
          >
            <svg
              onClick={() => { if (!file) {
                handlePreviousClick()
              }  }}
              className={`hover:scale-105 ${file ? "cursor-not-allowed": "cursor-pointer"}`}
              xmlns="http://www.w3.org/2000/svg"
              width="13"
              height="14"
              viewBox="0 0 13 14"
              fill="none"
            >
              <path
                d="M11 2L3 7L11 12"
                stroke={currentReportTypeIndex === 1 ? "#4A3AFF" : "#DB2C9F"}
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>

            <div
              className={`flex-grow relative py-[16px] rounded-[100px] ${
                currentReportTypeIndex === 1 ? "bg-[#EDEBFF]" : "bg-[#FEF6FF]"
              }`}
            >
              <TransitionGroup>
                <CSSTransition
                  key={reportTypes[currentReportTypeIndex]}
                  timeout={300}
                  classNames="fade"
                >
                  <span
                    className={`absolute top-[50%] translate-y-[-50%] inset-0 flex items-center justify-center font-medium leading-[15px] text-[10px] text-center ${
                      currentReportTypeIndex === 1
                        ? "text-primary "
                        : "text-[#DB2C9F]"
                    }`}
                  >
                    {reportTypes[currentReportTypeIndex]}
                  </span>
                </CSSTransition>
              </TransitionGroup>
            </div>

            <svg
              onClick={() => { if (!file) {
                handleNextClick()
              } }}
              className={`rotate-180 hover:scale-105 ${file ? "cursor-not-allowed": "cursor-pointer"}`}
              xmlns="http://www.w3.org/2000/svg"
              width="13"
              height="14"
              viewBox="0 0 13 14"
              fill="none"
            >
              <path
                d="M11 2L3 7L11 12"
                stroke={currentReportTypeIndex === 1 ? "#4A3AFF" : "#DB2C9F"}
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
        {file && !isLoading ? (
          <UploadingFile
            id={uploadingReportFiles[uploadingReportFiles.length - 1]?.id}
            progress={
              uploadingReportFiles[uploadingReportFiles.length - 1]?.progress
            }
            file={file.file}
            fileType="report"
            fetchFunc={props.fetchOneWorkOrder}
            setFile={setFile}
          />
        ) : (
          <div
            className="w-full"
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const files = e.dataTransfer.files;

              if (files) {
                Array.from(files).forEach(async (file) => {
                  await handleFileChange(
                    dispatch,
                    props.workorderId,
                    "report",
                    file,
                    setIsLoading,
                    props.fetchOneWorkOrder,
                    undefined,
                    currentReportTypeIndex
                  );
                  setFile({file:file, progress:0})
                });
              }
            }}
          >
            <input
              type="file"
              name="report"
              id="report"
              accept=".doc,.docx,.xls,.xlsx,.ppt,.pptx,.pdf,.txt,.jpg,.jpeg,.png,.gif,.bmp,.webp,.svg"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files ? e.target.files[0] : null;
                if (file) {
                  await handleFileChange(
                    dispatch,
                    props.workorderId,
                    "report",
                    file,
                    setIsLoading,
                    props.fetchOneWorkOrder,
                    undefined,
                    currentReportTypeIndex
                  );
                  setFile({file:file, progress:0})
                }
              }}
            />
            <label
              htmlFor="report"
              className="cursor-pointer w-full py-[18px] px-[45px] flex items-center justify-center bg-white border-dashed border-[1px] border-n500 rounded-[15px]"
            >
              <span className="text-[12px] text-n600 font-semibold leading-[13px] py-[38px] px-[5px] text-center flex flex-col items-center ">
                Drag & drop your file here <br /> or
                <span className="text-primary"> chooses file</span>
              </span>
            </label>
          </div>
        )}

        <button
          className={`w-full rounded-[30px] py-[10px] text-[14px] font-semibold flex justify-center ${
            file && !isLoading
              ? "bg-primary text-white"
              : "bg-n200 cursor-not-allowed text-n400"
          }`}
          disabled={file && !isLoading ? false : true}
          onClick={() => {
            handleCloseDialog(ref);
            setFile(undefined);
            setCurrentReportTypeIndex(1);
          }}
        >
          {isLoading ? (
            <RotatingLines strokeColor="#111111" width="20" />
          ) : (
            "Add report"
          )}
        </button>

        <span
          className="absolute top-6 right-6 text-[#111111] cursor-pointer"
          onClick={() => {
            handleCloseDialog(ref);
            setCurrentReportTypeIndex(1);
          }}
        >
          🗙
        </span>
      </dialog>
    );
  }
);

export default AddReportPopup;
