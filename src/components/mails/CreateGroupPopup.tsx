import { forwardRef } from "react";
import { handleCloseDialog } from "../../func/openDialog";

const CreateGroupPopup = forwardRef<HTMLDialogElement, object>((_, ref) => {
  return (
    <dialog
      ref={ref}
      className="bg-white rounded-[40px] p-[32px] flex flex-col items-center gap-[20px] sm:w-[40%] absolute left-[50%] top-[50%] -translate-x-[50%] -translate-y-[50%]"
    >
      <h6 className="text-[20px] leading-[20px] font-semibold text-n800">
        Create group
      </h6>
      <div className="flex flex-col w-full gap-[27px]">
        <div className="flex flex-col items-start gap-[7px] w-full">
          <label
            htmlFor="name"
            className="text-[15px] text-550 leading-[20px] font-medium"
          >
            Group name
          </label>
          <input
            type="text"
            id="name"
            className="w-full rounded-[46px] h-[52px] shadow-md px-[24px]"
            placeholder="Enter group name"
          />
        </div>
        <div className="flex flex-col items-start gap-[7px] w-full">
          <label
            htmlFor="members"
            className="text-[15px] text-550 leading-[20px] font-medium"
          >
            Group members
          </label>
          <textarea
            id="members"
            className="w-full rounded-[46px] shadow-md px-[24px] py-[16px]"
            rows={4}
          />
        </div>
        <div className="flex items-center justify-end gap-[5px] w-full">
          <button className="py-[9px] px-[28px] rounded-[30px] bg-n300 border-[1px] border-n500 text-[12px] font-semibold leading-[20px] text-n700"
                  onClick={() => { handleCloseDialog(ref) }}
          >Cancel</button>
          <button className="py-[9px] px-[28px] rounded-[30px] bg-primary border-[1px] border-n500 text-[12px] font-semibold leading-[20px] text-white">Create group</button>
        </div>
      </div>
    </dialog>
  );
});

export default CreateGroupPopup;
