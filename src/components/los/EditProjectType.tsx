import React, { useState, forwardRef, useEffect } from "react";
import { RotatingLines } from "react-loader-spinner";
import { handleCloseDialog } from "../../func/openDialog";
import { editProjectType } from "../../func/los/ProjectTypes";
import { ResProjectType } from "../../assets/types/LosSites";
import { useSnackbar } from "notistack";

interface EditProjectTypeProps {
  editedPT: ResProjectType | undefined;
  setProjectTypes: React.Dispatch<React.SetStateAction<ResProjectType[]>>;
}

// ForwardRef Component
const EditProjectType = forwardRef<HTMLDialogElement, EditProjectTypeProps>(
  ({ editedPT, setProjectTypes }, ref) => {
    const { enqueueSnackbar } = useSnackbar();
    const [PT, setPT] = useState<string | undefined>(editedPT?.name);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [visibleErr, setVisibleErr] = useState<boolean>(false);

    useEffect(() => {
      setPT(editedPT?.name);
      return () => {};
    }, [editedPT]);

    return (
      <dialog
        ref={ref}
        className="bg-white rounded-[40px] p-[32px] hidden flex-col items-center gap-[20px] sm:w-[27%] absolute left-[50%] top-[50%] -translate-x-[50%] -translate-y-[50%]"
      >
        <div className="flex flex-col gap-[22px] w-full">
          <h3 className="w-full text-center text-[20px] leading-[20px] text-n800 font-semibold">
            Edit project type
          </h3>
          <div className="flex flex-col items-center gap-[30px] w-full">
            <div className="w-full flex flex-col items-start gap-[9px]">
              <input
                type="text"
                id="project-type"
                value={PT}
                className={`w-full px-[17.5px] h-[46px] rounded-[46px] shadow-md text-[13px] text-n700 font-medium ${
                  visibleErr ? "border-[#DB2C2C] border-[2px]" : ""
                }`}
                placeholder="Enter project type name"
                onChange={(eo) => setPT(eo.target.value)}
              />
              {visibleErr && (
                <span className="text-[11px] text-[#DB2C2C] font-medium leading-[20px] ml-[15px]">
                  This is already used ..
                </span>
              )}
            </div>
            <button
              className={`w-full flex items-center justify-center rounded-[30px] py-[13px] ${
                PT === "" || !PT ? "bg-n500 text-n300" : "bg-primary text-white"
              }  text-[14px] leading-[20px] font-semibold`}
              onClick={() => {
                editProjectType(
                  editedPT!.id,
                  PT!,
                  setProjectTypes,
                  setIsLoading,
                  ref,
                  (message, options) => enqueueSnackbar(message, { ...options })
                );
              }}
              disabled={PT === "" || !PT}
            >
              {isLoading ? (
                <RotatingLines strokeColor="white" width="20" />
              ) : (
                "Edit"
              )}
            </button>
          </div>
          <span
            className="text-[#111111] absolute top-6 right-6 cursor-pointer"
            onClick={() => {
              setVisibleErr(false);
              handleCloseDialog(ref as React.RefObject<HTMLDialogElement>);
            }}
          >
            🗙
          </span>
        </div>
      </dialog>
    );
  }
);

export default EditProjectType;
