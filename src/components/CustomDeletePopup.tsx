import { forwardRef, useState } from "react";
import { RotatingLines } from "react-loader-spinner";
import { handle_delete_user } from "../func/editUseraApis";
import { useSnackbar } from "notistack";
import { handleCloseDialog } from "../func/openDialog";
import { handle_active_or_deactivate_user } from "../func/editUseraApis";

interface DeletePopUpProps {
  page: "delete-user" | "deactivate-user";
  sentence: string;
  itemId: number | undefined;
  fecthFunc?: () => void;
}

const CustomDeletePopup = forwardRef<HTMLDialogElement, DeletePopUpProps>(
  (props, ref) => {
    const [isLoading, setIsLoading] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    return (
      <dialog
        ref={ref}
        id="User-popup"
        className={`hidden fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] px-[26px] pb-[35px] pt-[25px]  flex-col items-center gap-[27px] rounded-[20px] w-[280px] sm:w-[340px]`}
      >
        <div className="flex items-center flex-col gap-[17px]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="46"
            height="46"
            viewBox="0 0 46 46"
            fill="none"
          >
            <path
              d="M23.0002 42.1666C12.4144 42.1666 3.8335 33.5857 3.8335 22.9999C3.8335 12.4142 12.4144 3.83325 23.0002 3.83325C33.5859 3.83325 42.1668 12.4142 42.1668 22.9999C42.1668 33.5857 33.5859 42.1666 23.0002 42.1666ZM23.0002 38.3333C27.0668 38.3333 30.9669 36.7178 33.8425 33.8422C36.718 30.9667 38.3335 27.0666 38.3335 22.9999C38.3335 18.9333 36.718 15.0332 33.8425 12.1576C30.9669 9.28206 27.0668 7.66659 23.0002 7.66659C18.9335 7.66659 15.0334 9.28206 12.1579 12.1576C9.2823 15.0332 7.66683 18.9333 7.66683 22.9999C7.66683 27.0666 9.2823 30.9667 12.1579 33.8422C15.0334 36.7178 18.9335 38.3333 23.0002 38.3333ZM23.0002 13.4166C23.5085 13.4166 23.996 13.6185 24.3555 13.978C24.7149 14.3374 24.9168 14.8249 24.9168 15.3333V24.9166C24.9168 25.4249 24.7149 25.9124 24.3555 26.2719C23.996 26.6313 23.5085 26.8333 23.0002 26.8333C22.4918 26.8333 22.0043 26.6313 21.6449 26.2719C21.2854 25.9124 21.0835 25.4249 21.0835 24.9166V15.3333C21.0835 14.8249 21.2854 14.3374 21.6449 13.978C22.0043 13.6185 22.4918 13.4166 23.0002 13.4166ZM23.0002 32.5833C22.4918 32.5833 22.0043 32.3813 21.6449 32.0219C21.2854 31.6624 21.0835 31.1749 21.0835 30.6666C21.0835 30.1583 21.2854 29.6707 21.6449 29.3113C22.0043 28.9519 22.4918 28.7499 23.0002 28.7499C23.5085 28.7499 23.996 28.9519 24.3555 29.3113C24.7149 29.6707 24.9168 30.1583 24.9168 30.6666C24.9168 31.1749 24.7149 31.6624 24.3555 32.0219C23.996 32.3813 23.5085 32.5833 23.0002 32.5833Z"
              fill="#F24E1E"
            />
          </svg>
          <p className="sm:text-[18px] text-[15px] font-semibold text-center text-[#25282B]">
            Are you sure you want to {props.sentence}?
          </p>
        </div>
        <div className="flex items-center gap-[6px]">
          <button
            className="text-white sm:px-[56px] sm:py-[12.5px] px-[40px] py-[8px] rounded-[86px] bg-[#FF3B30] text-[14px] flex items-center"
            onClick={async () => {
              switch (props.page) {
                case "delete-user":
                  await handle_delete_user(
                    props.itemId!,
                    setIsLoading,
                    (message, options) =>
                      enqueueSnackbar(message, { ...options })
                  );
                  break;
                case "deactivate-user":
                  await handle_active_or_deactivate_user(
                    "deactive",
                    `${props.itemId}`,
                    props.fecthFunc!,
                    (message, options) =>
                      enqueueSnackbar(message, { ...options })
                  );
                  break;
                default:
                  break;
              }

              handleCloseDialog(ref);
            }}
          >
            {isLoading ? (
              <RotatingLines strokeColor="white" width="20" />
            ) : (
              "Yes"
            )}
          </button>
          <button
            className="text-n600 sm:px-[56px] sm:py-[12.5px] px-[40px] py-[8px] rounded-[86px] bg-n300 text-[14px] border-[1px] border-n400"
            onClick={() => {
              handleCloseDialog(ref);
            }}
          >
            No{" "}
          </button>
        </div>
      </dialog>
    );
  }
);

export default CustomDeletePopup;
