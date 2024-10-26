import { forwardRef } from "react";
import { useState } from "react";
import { EditAcceptenceStatus } from "../../func/otherworkorderApis";
import { RotatingLines } from "react-loader-spinner";

interface AddVoucherProps {
  woId: string;
  RequirementType: "acceptance" | "return voucher";
  Requirement: boolean;
  setState: React.Dispatch<React.SetStateAction<boolean>>;
  fetchOneWorkOrder: () => void;
}

const RequirementPopup = forwardRef<HTMLDialogElement, AddVoucherProps>(
  ({ woId, RequirementType, Requirement, setState, fetchOneWorkOrder }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [CheckBoxStatus, setCheckBoxStatus] = useState<boolean>(Requirement);

    return (
      <div className="w-[350px] p-[20px] md:rounded-tl-[17px] md:rounded-tr-[0px] rounded-tr-[17px] rounded-bl-[17px] rounded-br-[17px] bg-white shadow-lg z-30 absolute flex flex-col items-start gap-[27px] left-2 top-10">
        <div className="flex flex-col items-start gap-[16px]">
          <h6 className=" text-n700 font-medium md:text-[14px] text-[12px] capitalize">
            {RequirementType}
          </h6>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name={RequirementType}
              id={RequirementType}
              defaultChecked={Requirement}
              onChange={(eo) => setCheckBoxStatus(eo.target.checked)}
            />
            <label
              htmlFor={RequirementType}
              className="text-550 text-[14px] font-medium"
            >
              Require {RequirementType}
            </label>
          </div>
        </div>
        {Requirement !== CheckBoxStatus && (
          <div className="flex items-center gap-[6px] w-full">
            <button
              className="w-[50%] py-[5px] text-[11px] font-semibold leading-[20px] rounded-[20px] border-[1.2px] border-n600 text-n600"
              onClick={() => {
                setState(false);
              }}
            >
              Cancel
            </button>
            <button
              className="w-[50%] py-[5px] flex items-center justify-center text-[11px] font-semibold leading-[20px] rounded-[20px] bg-primary text-white"
              onClick={async() => {
               await EditAcceptenceStatus(
                  woId,
                  CheckBoxStatus,
                  RequirementType,
                  fetchOneWorkOrder,
                  setIsLoading
                );
                setState(false)
              }}
            >
               {isLoading ? <RotatingLines strokeColor="white" width="20"/> : "Save"}
            </button>
          </div>
        )}
      </div>
    );
  }
);

export default RequirementPopup;
