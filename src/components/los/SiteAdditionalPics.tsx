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
import { handleCloseDialog } from "../../func/openDialog";

interface SitePositionPopupProps {
  setCurrentSliderIndex: React.Dispatch<React.SetStateAction<2 | 1 | 3 | 4>>;
  site: ResLosExecution | null;
  image_count: number | null;
  fetchOneOrder: () => void;
}

const SiteAdditionalPicsPopup = forwardRef<
  HTMLDialogElement,
  SitePositionPopupProps
>(({ setCurrentSliderIndex, site, image_count, fetchOneOrder }, ref) => {
  const [fourthFormValues, setFourthFormValues] = useState<
    ReqUploadSiteLocation & {
      title: string;
    }
  >({
    site_result: null,
    title: "",
    image: null,
    comment: null,
  });
  const [file, setFile] = useState<TheUploadingFile | undefined>();
  const [fileErr, setFileErr] = useState<boolean>(false);
  const [titleErr, setTitleErr] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingSubmit, setIsLoadingSubmit] = useState<boolean>(false);

  const [downloadImg, setDownloadImg] = useState<string | null>(null);
  const [isLoadingDownload, setIsLoadingDownload] = useState<boolean>(false);

  const [imgIndex, setImgIndex] = useState<number | null>(null);

  const handleFourthSubmit = async (
    e: FormEvent<HTMLFormElement> | MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    setTitleErr(false);
    setFileErr(false);

    if (downloadImg) {
      if (imgIndex && image_count && imgIndex < image_count - 2) {
        setImgIndex(imgIndex + 1);
      } else {
        handleCloseDialog(ref);
        setImgIndex(null);
      }
    } else {
      if (!fourthFormValues.title || fourthFormValues.title === "") {
        setTitleErr(true);
      }
      if (!file) {
        setFileErr(true);
      } else {
        const result = await uploadSiteImages(
          fourthFormValues,
          setIsLoadingSubmit,
          "additional-picture",
          undefined,
          fetchOneOrder
        );
        if (result) {
          handleCloseDialog(ref);
          setCurrentSliderIndex(1);
        }
        setFileErr(false);
      }
    }
  };

  const handleNewPic = async () => {
    setTitleErr(false);
    setFileErr(false);

    if (downloadImg) {
      setFourthFormValues({
        site_result: null,
        title: "",
        image: null,
        comment: null,
      });
      setDownloadImg(null);
      setImgIndex(null);
    } else {
      const result = await uploadSiteImages(
        fourthFormValues,
        setIsLoadingSubmit,
        "additional-picture",
        undefined,
        fetchOneOrder
      );
      if (result) {
        setFileErr(false);
        setTitleErr(false);
        setFile(undefined);
        setFourthFormValues({
          site_result: null,
          title: "",
          image: null,
          comment: null,
        });
      }
    }
  };

  const handlePrev = () => {
    setCurrentSliderIndex(3);
  };

  useEffect(() => {
    setFourthFormValues((prev) => ({
      site_result: site ? site.id : null,
      image: file?.id || null,
      comment: prev.comment,
      title: prev.title,
    }));
  }, [site, file?.id]);

  useEffect(() => {
    if (image_count) {
      setImgIndex(1);
    }
  }, [image_count]);

  useEffect(() => {
    downloadSiteImages(
      site?.id,
      setDownloadImg,
      setIsLoadingDownload,
      "additional-picture",
      imgIndex
    );
  }, [site, imgIndex]);

  return (
    <>
      <div className="flex flex-col items-start gap-[24px] w-full">
        <div className="w-[90%] relative">
          <input
            type="text"
            name="title"
            id="title"
            value={fourthFormValues.title}
            required={true}
            className="text-[17px] text-primary font-medium px-[18px] py-3 rounded-[19px] border-[2px] border-n300 w-full "
            placeholder="Enter a title.."
            onChange={(e) => {
              handleChange(e, setFourthFormValues);
            }}
          />
          <div className="absolute inline-block right-2 top-[50%] -translate-y-[50%]">
            {titleErr && (
              <>
                <div className="relative group inline-block">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-[16px] h-[16px] text-red-500 inline-block mr-2 cursor-pointer"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-10.5a.75.75 0 011.5 0v4a.75.75 0 01-1.5 0v-4zm.75 7a1 1 0 110-2 1 1 0 010 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="absolute right-6 top-1/2 transform -translate-y-1/2 ml-2 hidden group-hover:flex bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                    Title is Requierd
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

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
                        alt="additional site pics"
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
              value={fourthFormValues.comment ?? ""}
              onChange={(e) => {
                handleChange(e, setFourthFormValues);
              }}
            />
          </div>
        )}
        <span
          className={` text-[15px] ${
            downloadImg ||
            (file && fourthFormValues.title !== "" && fourthFormValues.title)
              ? "cursor-pointer text-primary"
              : "cursor-not-allowed text-n600"
          }`}
          onClick={() => {
            if (
              downloadImg ||
              (file && fourthFormValues.title !== "" && fourthFormValues.title)
            ) {
              handleNewPic();
            }
          }}
          aria-disabled={
            downloadImg ||
            (file && fourthFormValues.title !== "" && fourthFormValues.title)
              ? false
              : true
          }
        >
          Click here for additional pictures
        </span>
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
          onClick={handleFourthSubmit}
        >
          {isLoadingSubmit ? (
            <RotatingLines strokeColor="white" width="20" />
          ) : !imgIndex || (image_count && imgIndex === image_count - 2) ? (
            "Finish"
          ) : (
            "Next"
          )}
        </button>
      </div>
    </>
  );
});

export default SiteAdditionalPicsPopup;
