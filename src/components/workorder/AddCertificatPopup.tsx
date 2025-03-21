import { forwardRef } from "react";
import { handleCloseDialog } from "../../func/openDialog";
import { useState } from "react";
import { TheUploadingFile } from "../../assets/types/Mission";
import UploadingFile from "./../uploadingFile";
import { RotatingLines } from "react-loader-spinner";
import { certeficatTypes } from "../../assets/CertificatTypes";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../Redux/store";
import { useSelector } from "react-redux";
import { RootState } from "../../Redux/store";
import { handleFileChange } from "../../func/otherworkorderApis";

interface AddCertificatProps {
  workorderId: string | undefined;
  extantionType: "workorder" | "modernisation" | "new-site";
  fetchOneWorkOrder: () => void;
}

const AddCertificatPopup = forwardRef<HTMLDialogElement, AddCertificatProps>(
  (props, ref) => {
    const [isLoading, setIsLoading] = useState(false);
    const [file, setFile] = useState<TheUploadingFile | undefined>();
    const [certType, setCertType] = useState<1 | 2 | 3>(1);
    const dispatch = useDispatch<AppDispatch>();

    const uploadingacceptenceFiles = useSelector(
      (state: RootState) => state.uploadingFiles.acceptenceFiles
    );

    return (
      <dialog
        ref={ref}
        className="bg-white rounded-[20px] py-[30px] px-[25px] hidden flex-col items-center gap-[28px] w-fit absolute left-[50%] top-[50%] -translate-x-[50%] -translate-y-[50%]"
      >
        <div className="flex flex-col items-center gap-[17px]">
          <h3 className="text-[19px] font-semibold text-primary leading-[20px]">
            Add your certificate{" "}
          </h3>
          <span className="text-[12px] text-n600 leading-[20px]">
            Choose certeficat type
          </span>
          <div className="flex items-center gap-[7px]">
            {certeficatTypes.map((type, index) => {
              return (
                <span
                  key={index}
                  className={`px-[16px] py-[10px] rounded-[20px] text-[13px] leading-[13px] font-semibold ${
                    file ? "cursor-not-allowed" : "cursor-pointer"
                  }`}
                  style={{
                    backgroundColor:
                      type.type === certType ? `${type.color}` : "white",
                    color: type.type === certType ? "white" : `${type.color}`,
                    border: `solid 1px ${type.color}`,
                  }}
                  onClick={() => {
                    if (!file) {
                      setCertType(type.type);
                    }
                  }}
                >
                  {type.name}
                </span>
              );
            })}
          </div>
        </div>
        {file && !isLoading ? (
          <UploadingFile
            id={
              uploadingacceptenceFiles[uploadingacceptenceFiles.length - 1]?.id
            }
            progress={
              uploadingacceptenceFiles[uploadingacceptenceFiles.length - 1]
                ?.progress
            }
            file={file.file}
            fileType="certificate"
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

              // Ensure files are not null and handle each file
              if (files) {
                Array.from(files).forEach(async (file) => {
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
                });
              }
            }}
          >
            <input
              type="file"
              name="acceptence"
              id="acceptence"
              accept=".doc,.docx,.xls,.xlsx,.ppt,.pptx,.pdf,.txt,.jpg,.jpeg,.png,.gif,.bmp,.webp,.svg"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files ? e.target.files[0] : null;
                if (file) {
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
                }
              }}
            />
            <label
              htmlFor="acceptence"
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
            setCertType(1);
          }}
        >
          {isLoading ? (
            <RotatingLines strokeColor="#111111" width="20" />
          ) : (
            "Add certeficat"
          )}
        </button>

        <span
          className="absolute top-6 right-6 text-[#111111] cursor-pointer"
          onClick={() => {
            handleCloseDialog(ref);
          }}
        >
          🗙
        </span>
      </dialog>
    );
  }
);

export default AddCertificatPopup;
