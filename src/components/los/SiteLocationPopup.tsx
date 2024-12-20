import {
  forwardRef,
  useState,
  FormEvent,
  MouseEvent,
  useEffect,
  useRef,
} from "react";
import "../../styles/PrioritySelector.css";
import handleChange from "../../func/handleChangeFormsInput";
import {
  downloadSiteImages,
  uploadSiteImages,
  updateSiteImages,
  handleFileChange
} from "../../func/los/orders";
import { RotatingLines } from "react-loader-spinner";
import { ReqUploadSiteLocation } from "../../assets/types/LosCommands";
import { TheUploadingFile } from "../../assets/types/Mission";
import UploadingFile from "../uploadingFile";
import { ResLosExecution } from "../../assets/types/LosCommands";

interface SiteLocationPopupProps {
  setCurrentSliderIndex: React.Dispatch<React.SetStateAction<2 | 1 | 3 | 4>>;
  site: ResLosExecution | null;
}

const SiteLocationPopup = forwardRef<HTMLDialogElement, SiteLocationPopupProps>(
  ({ setCurrentSliderIndex, site }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [secondFormValues, setSecondFormValues] =
      useState<ReqUploadSiteLocation>({
        site_result: null,
        image: null,
        comment: null,
      });

    const [file, setFile] = useState<TheUploadingFile | undefined>();
    const [fileErr, setFileErr] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isLoadingSubmit, setIsLoadingSubmit] = useState<boolean>(false);
    const [isLoadingDownload, setIsLoadingDownload] = useState<boolean>(false);

    const [downloadImg, setDownloadImg] = useState<string | null>(null);
    const [metadata, setMetadata] = useState<{
      title?: string | null;
      comment?: string | null;
    }>({});
    const [updateThisTime, setUpdateThisTime] = useState<boolean>(false);

    const handleSecondSubmit = (
      e: FormEvent<HTMLFormElement> | MouseEvent<HTMLButtonElement>
    ) => {
      e.preventDefault();

      if (updateThisTime) {
        updateSiteImages(
          secondFormValues,
          "site-location",
          setIsLoadingSubmit,
          setUpdateThisTime,
          setCurrentSliderIndex
        );
      } else {
        if (downloadImg) {
          setCurrentSliderIndex(3);
        } else {
          if (!file) {
            ("");
            setFileErr(true);
          } else {
            uploadSiteImages(
              secondFormValues,
              setIsLoadingSubmit,
              "site-location",
              setCurrentSliderIndex
            );
            setFileErr(false);
          }
        }
      }
    };

    const handlePrev = () => {
      setCurrentSliderIndex(1);
    };

    const handleEditClick = () => {
      fileInputRef.current?.click();
    };

    useEffect(() => {
      setSecondFormValues((prev) => ({
        site_result: site ? site.id : null,
        image: file?.id || null,
        comment: prev.comment,
      }));
    }, [site, file?.id]);

    useEffect(() => {
      downloadSiteImages(
        site?.id,
        setDownloadImg,
        setMetadata,
        setIsLoadingDownload,
        "site-location"
      );
    }, [site]);

    return (
      <>
        <div className="flex flex-col items-start gap-[24px] w-full relative">
          <h3 className="text-[19px] text-primary font-medium">
            Site Location NE
          </h3>
          {isLoadingDownload ? (
            <div className="w-full flex items-center justify-center">
              <RotatingLines strokeColor="#4A3AFF" width="40" />
            </div>
          ) : downloadImg ? (
            <div className="w-full max-w-lg mx-auto bg-gray-100 p-4 rounded-lg shadow-md overflow-hidden">
              {/* Image Container */}
              <div className="relative w-full max-h-[300px] mb-4 overflow-visible">
                <img
                  src={downloadImg}
                  alt="Site location"
                  className="w-auto max-h-[300px] mx-auto object-contain"
                />
                <div
                  className="absolute -top-2 -right-2 cursor-pointer rounded-md bg-gray-300  bg-opacity-90 px-2 py-1 flex items-center justify-center shadow-sm hover:from-gray-300 hover:to-gray-400 hover:bg-opacity-100 transition-all duration-200 ease-in-out"
                  onClick={handleEditClick}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="17"
                    height="17"
                    viewBox="0 0 20 20"
                    fill="none"
                    className="text-gray-400 hover:text-gray-500 transition-all duration-300 ease-in-out"
                  >
                    <path
                      d="M10 2.5H4.16667C3.72464 2.5 3.30072 2.67559 2.98816 2.98816C2.67559 3.30072 2.5 3.72464 2.5 4.16667V15.8333C2.5 16.2754 2.67559 16.6993 2.98816 17.0118C3.30072 17.3244 3.72464 17.5 4.16667 17.5H15.8333C16.2754 17.5 16.6993 17.3244 17.0118 17.0118C17.3244 16.6993 17.5 16.2754 17.5 15.8333V10"
                      stroke="currentColor"
                      strokeWidth="1.66667"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M15.3125 2.18744C15.644 1.85592 16.0937 1.66968 16.5625 1.66968C17.0313 1.66968 17.481 1.85592 17.8125 2.18744C18.144 2.51897 18.3303 2.9686 18.3303 3.43744C18.3303 3.90629 18.144 4.35592 17.8125 4.68744L10.3017 12.1991C10.1038 12.3968 9.85933 12.5415 9.59083 12.6199L7.19666 13.3199C7.12496 13.3409 7.04895 13.3421 6.97659 13.3236C6.90423 13.305 6.83819 13.2674 6.78537 13.2146C6.73255 13.1618 6.6949 13.0957 6.67637 13.0234C6.65783 12.951 6.65908 12.875 6.68 12.8033L7.38 10.4091C7.45877 10.1408 7.60378 9.89666 7.80166 9.69911L15.3125 2.18744Z"
                      stroke="currentColor"
                      strokeWidth="1.66667"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files ? e.target.files[0] : null;
                    if (file) {
                      setFile({ file: file, progress: 0 });

                      setDownloadImg(null);
                      await handleFileChange(
                        file,
                        setFile,
                        setIsLoading,
                        setUpdateThisTime
                      );
                    }
                  }}
                />
              </div>

              <div className="w-full text-n800 text-sm bg-gray-200 p-2 rounded-lg shadow-inner">
                {metadata.comment || "No comment available."}
              </div>

              {/* (
                <div className="mt-4 text-right">
                  <button
                    onClick={() => console.log("first")}
                    className="px-4 py-2 text-sm font-medium text-white bg-[#509af5] rounded-lg hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
                  >
                    Save
                  </button>
                </div>
              ) */}
            </div>
          ) : (
            <div className="flex flex-col items-start gap-[18px] w-full">
              <div className="flex flex-col items-start gap-2 w-full">
                {isLoading ? (
                  <div className="w-full flex items-center justify-center">
                    <RotatingLines strokeColor="#4A3AFF" width="30" />
                  </div>
                ) : file ? (
                  <div className="w-full flex flex-col items-center gap-2">
                    <div className="w-full max-w-lg mx-auto bg-gray-100 p-4 rounded-lg shadow-md overflow-hidden">
                      <div className="relative w-full max-h-[300px] overflow-auto">
                        <img
                          src={URL.createObjectURL(file.file!)}
                          alt="Site location"
                          className="w-auto max-h-[300px] mx-auto object-contain"
                        />
                      </div>
                    </div>
                    <UploadingFile
                      id={file.id}
                      progress={file.progress}
                      file={file.file}
                      setFile={setFile}
                    />
                  </div>
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

                      // Ensure files are not null and handle each file
                      if (files) {
                        /* Array.from(files).forEach(async (file:File) => {
                            await handleFileChange(
      dispatch,
      props.workorderId!,
      "certificate",
      props.extantionType,
      file,
      setIsLoading,
      props.fetchOneWorkOrder,
      undefined,
      certType
    );
    setFile({ file: file, progress: 0 });  
                        });*/
                      }
                    }}
                  >
                    <input
                      type="file"
                      name="site-location"
                      id="site-location"
                      accept=".jpg,.jpeg,.png,.gif,.bmp,.webp,.svg"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files ? e.target.files[0] : null;
                        if (file) {
                          setFile({ file: file, progress: 0 });
                          await handleFileChange(
                            file,
                            setFile,
                            setIsLoading,
                          );
                        }
                      }}
                    />
                    <label
                      htmlFor="site-location"
                      className="cursor-pointer w-full py-[18px] px-[45px] flex items-center justify-center bg-white border-dashed border-[1px] border-n500 rounded-[15px]"
                    >
                      <span className="text-[14px] text-n600 font-medium leading-[15px] py-[38px] px-[5px] text-center flex flex-col items-center ">
                        Drag & drop your file here <br /> or
                        <span className="text-primary"> chooses file</span>
                      </span>
                    </label>
                  </div>
                )}
                {fileErr && (
                  <span className="ml-[12px] text-[14px] text-[#DB2C2C] leading-[22px]">
                    Please enter image to continue
                  </span>
                )}
              </div>

              <textarea
                name="comment"
                id="comment"
                placeholder="Add Comment"
                className="rounded-[19px] border-[2px] border-n300 p-4 w-full shadow-[#7090B008] text-[14px] font-medium max-h-[180px]"
                value={secondFormValues.comment ?? ""}
                onChange={(e) => {
                  handleChange(e, setSecondFormValues);
                }}
              />
            </div>
          )}
        </div>
        <div className="flex items-center gap-[6px]">
          <button
            className="rounded-[86px] px-[25px] sm:px-[45px] py-[7px] bg-n300 text-[14px] text-n600 font-semibold border-[1px] border-n400"
            onClick={handlePrev}
          >
            Previous
          </button>
          <button
            className="rounded-[86px] px-[25px] sm:px-[45px] py-[7px] bg-primary text-[14px] text-white font-semibold border-[1px] border-primary flex items-center justify-center"
            onClick={handleSecondSubmit}
          >
            {isLoadingSubmit ? (
              <RotatingLines strokeColor="white" width="20" />
            ) : 
              updateThisTime ? "Update" : "Next"
            }
          </button>
        </div>
      </>
    );
  }
);

export default SiteLocationPopup;
