import { forwardRef } from "react";

const MissionPopup = forwardRef<HTMLDialogElement>((_, ref) => {
  return (
    <dialog
      ref={ref}
      id="Mission-popup"
      className={`hidden fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] sm:px-[56px] sm:py-[43px] px-[20px] pt-[25px] pb-[20px] flex-col sm:items-end items-center gap-[35px] rounded-[34px] lg:w-[56vw] sm:w-[75vw] w-[90vw]`}
    >
      <div className="flex items-center flex-col gap-[22.5px] w-full">
        <div className="flex flex-col items-start gap-[8px] w-full">
          <label
            htmlFor="title"
            className="leading-[21px] font-medium ml-[9px] text-n700"
          >
            Title
          </label>
          <input
            type="text"
            name="title"
            id="title"
            placeholder="Enter title"
            className="rounded-[46px] h-[55.5px] border-[1px] border-n400 w-full px-[23px]"
          />
        </div>

        <div className="flex flex-col items-start gap-[8px] w-full">
          <label
            htmlFor="title"
            className="leading-[21px] font-medium ml-[9px] text-n700"
          >
            Description
          </label>
          <textarea
            name="title"
            id="title"
            placeholder="Description"
            className="rounded-[21px] border-[1px] border-n400 w-full p-[20px] h-[140px] max-h-[300px]"
          />
        </div>
      </div>

      <div className="flex items-center gap-[6px]">
        <button
          className="text-n600 sm:px-[42px] px-[36px] sm:py-[14px] py-[9px] font-semibold rounded-[86px] border-[1px] border-n400 bg-n300 sm:text-[15px] text-[13px]"
          onClick={() => {
            if (ref && typeof ref !== "function" && ref.current) {
              ref.current.close();
              ref.current.style.display = "none";
            }
          }}
        >
          Cancel
        </button>
        <button
          className="text-white sm:px-[42px] px-[36px] sm:py-[14px] py-[9px]  font-semibold rounded-[86px] bg-primary sm:text-[15px] text-[13px]"
          onClick={() => {
            if (ref && typeof ref !== "function" && ref.current) {
              ref.current.close();
              ref.current.style.display = "none";
            }
          }}
        >
          Confirm
        </button>
      </div>
    </dialog>
  );
});

export default MissionPopup;
