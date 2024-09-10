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
    const [message, setMessage] = useState<string>("");
    const [visibleErr, setVisibleErr] = useState<boolean>(false);

    return (
      <dialog
        ref={ref}
        className="bg-white rounded-[20px] py-[30px] px-[25px] hidden flex-col items-start gap-[20px] w-[74%] md:w-[45%] lg:w-[30%] absolute left-[50%] top-[50%] -translate-x-[50%] -translate-y-[50%] overflow-visible"
      >
        <h6 className="text-n800 font-medium leading-5">Add message</h6>
        <div className="flex items-start flex-col gap-[8px] w-full">
          <textarea
            name="message"
            id="message"
            rows={6}
            value={message}
            className="border-n300 border-[1px] rounded-[20px] w-full p-4 text-[15px]"
            onChange={(e) => {
              setMessage(e.target.value);
            }}
          ></textarea>
          {visibleErr && (
            <span className="ml-2 text-[14px] text-red-600">
              Enter a message first
            </span>
          )}
        </div>

        <button
          className="w-full py-[12px] bg-primary rounded-[30px] text-white text-[14px] font-semibold leading-5 flex items-center justify-center"
          onClick={async () => {
            if (message !== "") {
              await handle_edit_or_reqUpdate_report(
                props.workorderId,
                true,
                setIsLoading,
                props.fetchOneWorkOrder,
                message
              );
              handleCloseDialog(ref);
              setVisibleErr(false);
              setMessage("")
            } else {
              setVisibleErr(true);
            }
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
