import { forwardRef } from "react";
import { handleCloseDialog } from "../../func/openDialog";
import { useState } from "react";
import { TheUploadingFile } from "../../assets/types/Mission";
import UploadingFile from "./../uploadingFile";
import { RotatingLines } from "react-loader-spinner";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../Redux/store";
import { useSelector } from "react-redux";
import { RootState } from "../../Redux/store";
import { handleFileChange } from "../../func/otherworkorderApis";

interface AddVoucherProps {
  workorderId: string | undefined;
  fetchOneWorkOrder: () => void;
}

const AddVoucherPopup = forwardRef<HTMLDialogElement, AddVoucherProps>(
  (props, ref) => {
    const [isLoading, setIsLoading] = useState(false);
    const [file, setFile] = useState<TheUploadingFile | undefined>();
    const dispatch = useDispatch<AppDispatch>();

    const uploadingVoucherFiles = useSelector(
      (state: RootState) => state.uploadingFiles.voucherFiles
    );

    return (
      <dialog
        ref={ref}
        className="bg-white rounded-[20px] py-[30px] px-[25px] hidden flex-col items-center gap-[28px] w-[74%] md:w-[40%] lg:w-[27%] absolute left-[50%] top-[50%] -translate-x-[50%] -translate-y-[50%]"
      >
        <h3 className="sm:text-[19px] font-semibold text-primary leading-[20px]">
          Upload Return Voucher
        </h3>
        {file && !isLoading ? (
          <UploadingFile
            id={uploadingVoucherFiles[uploadingVoucherFiles.length - 1]?.id}
            progress={
              uploadingVoucherFiles[uploadingVoucherFiles.length - 1]?.progress
            }
            file={file.file}
            fileType="voucher"
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
                    "voucher",
                    file,
                    setIsLoading,
                    props.fetchOneWorkOrder,
                    undefined,
                  );
                  setFile({ file: file, progress: 0 });
                });
              }
            }}
          >
            <input
              type="file"
              name="voucher"
              id="voucher"
              accept=".doc,.docx,.xls,.xlsx,.ppt,.pptx,.pdf,.txt,.jpg,.jpeg,.png,.gif,.bmp,.webp,.svg"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files ? e.target.files[0] : null;
                if (file) {
                  await handleFileChange(
                    dispatch,
                    props.workorderId!,
                    "voucher",
                    file,
                    setIsLoading,
                    props.fetchOneWorkOrder,
                    undefined,
                  );
                  setFile({ file: file, progress: 0 });
                }
              }}
            />
            <label
              htmlFor="voucher"
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
          }}
        >
          {isLoading ? (
            <RotatingLines strokeColor="#111111" width="20" />
          ) : (
            "Add return voucher"
          )}
        </button>

        <span
          className="absolute sm:top-6 sm:right-6 top-3 right-3 text-[#111111] cursor-pointer"
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

export default AddVoucherPopup;
