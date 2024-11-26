import { forwardRef, useState, FormEvent, MouseEvent, useEffect } from "react";
import "../../styles/PrioritySelector.css";
import handleChange from "../../func/handleChangeFormsInput";
import { RotatingLines } from "react-loader-spinner";
import { ReqUploadSiteLocation } from "../../assets/types/LosCommands";
import { TheUploadingFile } from "../../assets/types/Mission";
import {
  uploadSiteImages,
  handle_chunck,
  downloadSiteImages,
} from "../../func/los/orders";
import { generateFileToken } from "../../func/generateFileToken";
import UploadingFile from "../uploadingFile";
import { ResLosExecution } from "../../assets/types/LosCommands";

interface SitePositionPopupProps {
  setCurrentSliderIndex: React.Dispatch<React.SetStateAction<2 | 1 | 3 | 4>>;
  site: ResLosExecution | null;
}

const SitePositionPopup = forwardRef<HTMLDialogElement, SitePositionPopupProps>(
  ({ setCurrentSliderIndex, site }) => {
    const [thirdFormValues, setThirdFormValues] =
      useState<ReqUploadSiteLocation>({
        site_result: null,
        image: null,
        comment: null,
      });
    const [file, setFile] = useState<TheUploadingFile | undefined>();
    const [fileErr, setFileErr] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isLoadingSubmit, setIsLoadingSubmit] = useState<boolean>(false);

    const [downloadImg, setDownloadImg] = useState<string | null>(null);
    const [isLoadingDownload, setIsLoadingDownload] = useState<boolean>(false);

    const handleThirdSubmit = (
      e: FormEvent<HTMLFormElement> | MouseEvent<HTMLButtonElement>
    ) => {
      e.preventDefault();
      if (downloadImg) {
        setCurrentSliderIndex(4);
      } else {
        if (!file) {
          setFileErr(true);
        } else {
          uploadSiteImages(
            thirdFormValues,
            setIsLoadingSubmit,
            "site-position",
            setCurrentSliderIndex,
          );
          setFileErr(false);
        }
      }
    };

    const handlePrev = () => {
      setCurrentSliderIndex(2);
    };

    useEffect(() => {
      setThirdFormValues((prev) => ({
        site_result: site ? site.id : null,
        image: file?.id || null,
        comment: prev.comment,
      }));
    }, [site, file?.id]);

    useEffect(() => {
      downloadSiteImages(
        site?.id,
        setDownloadImg,
        setIsLoadingDownload,
        "site-position"
      );
    }, [site]);

    return (
      <>
        <div className="flex flex-col items-start gap-[24px] w-full">
          <h3 className="text-[19px] text-primary font-medium">
            Site Position NE
          </h3>
          {isLoadingDownload ? (
            <div className="w-full flex items-center justify-center">
              <RotatingLines strokeColor="#4A3AFF" width="40" />
            </div>
          ) : downloadImg ? (
            <div className="w-full max-w-lg mx-auto bg-gray-100 p-4 rounded-lg shadow-md overflow-hidden">
              <div className="relative w-full max-h-[300px] overflow-auto">
                <img
                  src={downloadImg}
                  alt="Site position"
                  className="w-auto max-h-[300px] mx-auto object-contain"
                />
              </div>
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
                          alt="Site postion"
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
                        Array.from(files).forEach(async (file) => {
                          /*  await handleFileChange(
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
    setFile({ file: file, progress: 0 });  */
                        });
                      }
                    }}
                  >
                    <input
                      type="file"
                      name="site-position"
                      id="site-position"
                      accept=".jpg,.jpeg,.png,.gif,.bmp,.webp,.svg"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files ? e.target.files[0] : null;
                        if (file) {
                          setFile({ file: file, progress: 0 });

                          const file_token = await generateFileToken(file);

                          await handle_chunck(
                            file,
                            file_token,
                            setFile,
                            setIsLoading
                          );
                        }
                      }}
                    />
                    <label
                      htmlFor="site-position"
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
                value={thirdFormValues.comment ?? ""}
                onChange={(e) => {
                  handleChange(e, setThirdFormValues);
                }}
              />
            </div>
          )}
        </div>
        <div className="flex items-center gap-[6px]">
          <button
            className="rounded-[86px] px-[45px] py-[10px] bg-n300 text-[14px] text-n600 font-semibold border-[1px] border-n400"
            onClick={handlePrev}
          >
            Previous
          </button>
          <button
            className="rounded-[86px] px-[45px] py-[10px] bg-primary text-[14px] text-white font-semibold border-[1px] border-primary flex items-center justify-center"
            onClick={handleThirdSubmit}
          >
            {isLoadingSubmit ? (
              <RotatingLines strokeColor="white" width="20" />
            ) : (
              "Next"
            )}
          </button>
        </div>
      </>
    );
  }
);

export default SitePositionPopup;
