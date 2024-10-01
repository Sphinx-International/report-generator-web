import { forwardRef } from "react";
import { handleCloseDialog } from "../func/openDialog";
const ChangePassPopup = forwardRef<HTMLDialogElement>((_, ref) => {
  return (
    <dialog
      ref={ref}
      id="forget-pass-popup"
      className={`hidden fixed z-30 top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] sm:px-[34px] sm:py-[40px] px-[18px] pt-[25px] pb-[20px] flex-col items-start gap-[35px] rounded-[34px] lg:w-[44vw] sm:w-[65vw] w-[80vw] overflow-y-visible`}
    >
      <div className="w-full flex flex-col items-start gap-[18px]">
        <div className="w-full flex flex-col items-start gap-[5px]">
          <label
            htmlFor="old-password"
            className="ml-[10px] sm:text-[14px] text-[13px] text-n600 font-medium"
          >
            Actual password
          </label>
          <input
            placeholder="Enter a description"
            type="password"
            name="old-password"
            id="old-password"
            className="rounded-[19px] border-[1px] border-n300 p-[16px] w-full sm:text-[14px] text-[11px] text-n600"
          />
        </div>

        <div className="w-full flex flex-col items-start gap-[5px]">
          <label
            htmlFor="new-password"
            className="ml-[10px] sm:text-[14px] text-[13px] text-n600 font-medium"
          >
           New password
          </label>
          <input
            placeholder="Enter you actual password"
            type="password"
            name="new-password"
            id="new-password"
            className="rounded-[19px] border-[1px] border-n300 p-[16px] w-full sm:text-[14px] text-[11px] text-n600"
          />
        </div>

        <div className="w-full flex flex-col items-start gap-[5px]">
          <label
            htmlFor="verify-password"
            className="ml-[10px] sm:text-[14px] text-[13px] text-n600 font-medium"
          >
            Confirm New password
          </label>
          <input
            placeholder="Write your new password again"
            type="password"
            name="verify-password"
            id="verify-password"
            className="rounded-[19px] border-[1px] border-n300 p-[16px] w-full sm:text-[14px] text-[11px] text-n600"
          />
        </div>

        <span className="text-[13px] text-primary font-medium leading-5 cursor-pointer ml-2">Forgot password ?</span>
      </div>
      <div className="flex items-center gap-[10px] w-full">
        <button className="rounded-[86px] border-[1px] border-n400 py-[10px] flex-grow text-n600 sm:text-[14px] text-[12px] leading-5 font-semibold bg-n300"
                 onClick={() => { handleCloseDialog(ref) }}
        >Cancel</button>
        <button className="rounded-[86px] border-[1px] border-primary py-[10px] flex-grow text-white sm:text-[14px] text-[12px] leading-5 font-semibold bg-primary">Change password</button>
      </div>
    </dialog>
  );
});

export default ChangePassPopup;
