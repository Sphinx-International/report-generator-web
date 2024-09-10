import { forwardRef, useState } from "react";
import { handle_edit_or_reqUpdate_report } from "../../func/otherworkorderApis";
import { RotatingLines } from "react-loader-spinner";
import { handleCloseDialog } from "../../func/openDialog";

interface RequestUpdateProps {
  workorderId: string;
  fetchOneWorkOrder: () => void;
}

const RequestUpdatePopup = forwardRef<HTMLDialogElement, RequestUpdateProps>(
  (props, ref) => {
    const [isLoading, setIsLoading] = useState(false);

    return (
      <dialog
        ref={ref}
        className="bg-white rounded-[20px] py-[30px] px-[25px] hidden flex-col items-start gap-[20px] w-[74%] md:w-[45%] lg:w-[30%] absolute left-[50%] top-[50%] -translate-x-[50%] -translate-y-[50%] overflow-visible"
      >
        <h6 className="text-n800 font-medium leading-5">Add message</h6>
        <textarea
          name="message"
          id="message"
          rows={6}
          className="border-n300 border-[1px] rounded-[20px] w-full p-4 text-[15px]"
        ></textarea>
        <button
          className="w-full py-[12px] bg-primary rounded-[30px] text-white text-[14px] font-semibold leading-5 flex items-center justify-center"
          onClick={async() => {
           await handle_edit_or_reqUpdate_report(
              props.workorderId,
              true,
              setIsLoading,
              props.fetchOneWorkOrder
            );
            handleCloseDialog(ref)
          }}
        >
          {isLoading ? (
            <RotatingLines strokeColor="#111111" width="20" />
          ) : (
            "Add Message"
          )}
        </button>
      </dialog>
    );
  }
);

export default RequestUpdatePopup;
