import { forwardRef } from "react";
import { useDispatch } from "react-redux";

import { closeDialog } from "../Redux/slices/dialogSlice";

const SuccessPopup = forwardRef<HTMLDialogElement>((_, ref) => {
  const dispatch = useDispatch();

  return (
    <dialog
      ref={ref}
      id="User-popup"
      className={`hidden fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] px-[26px] pb-[35px] pt-[25px]  flex-col items-center gap-[27px] rounded-[20px] lg:w-[30vw] sm:w-[50vw] w-[80vw]`}
    >
      <div className="flex items-center flex-col gap-[17px]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="43"
          height="43"
          viewBox="0 0 43 43"
          fill="none"
        >
          <g clip-path="url(#clip0_415_3512)">
            <rect
              width="43"
              height="43"
              rx="6"
              fill="url(#paint0_linear_415_3512)"
            />
            <path
              d="M15.229 22.3955L18.8123 25.9788L27.7707 17.0205"
              stroke="white"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </g>
          <defs>
            <linearGradient
              id="paint0_linear_415_3512"
              x1="21.5"
              y1="0"
              x2="21.5"
              y2="43"
              gradientUnits="userSpaceOnUse"
            >
              <stop stop-color="#48CA93" />
              <stop offset="1" stop-color="#48BACA" />
            </linearGradient>
            <clipPath id="clip0_415_3512">
              <rect width="43" height="43" rx="21.5" fill="white" />
            </clipPath>
          </defs>
        </svg>
        <p className="text-[18px] font-semibold text-center text-[#25282B]">
          Mission has been submitted successfuly
        </p>
      </div>
      <div className="flex flex-col items-center px-[20px] gap-[10px] w-full">
        <button className="text-white w-full py-[12.5px] rounded-[86px] bg-primary text-[14px] text-nowrap">
          Download report{" "}
        </button>
        <button
          className="text-n600 w-full py-[12.5px] rounded-[86px] bg-n300 text-[14px] border-[1px] border-n400"
          onClick={() => {
            if (ref && typeof ref !== "function" && ref.current) {
              ref.current.close();
              ref.current.style.display = "none";
            }
            dispatch(closeDialog())
          }}
        >
          close
        </button>
      </div>
    </dialog>
  );
});

export default SuccessPopup;
