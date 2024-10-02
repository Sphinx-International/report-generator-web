import { forwardRef, useState } from "react";
import { handleCloseDialog } from "../func/openDialog";
import { isValidPassword } from "../func/authValidation";
import { ThreeDots } from "react-loader-spinner";
import { useNavigate } from "react-router-dom";

const baseUrl = import.meta.env.VITE_BASE_URL;

const ChangePassPopup = forwardRef<HTMLDialogElement>((_, ref) => {
  const navigate = useNavigate();

  const [oldPass, setOldPass] = useState("");
  const [oldPassErr, setOldPassErr] = useState("");
  const [visibleOldPass, setVisibleOldPass] = useState(false);

  const [newPass, setNewPass] = useState("");
  const [newPassErr, setNewPassErr] = useState("");
  const [visibleNewPass, setVisibleNewPass] = useState(false);

  const [verifyPass, setVerifyPass] = useState("");
  const [verifyPassErr, setVerifyPassErr] = useState("");
  const [visibleVerifyPass, setVisibleVerifyPass] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${baseUrl}/account/change-password`,

        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({ current: oldPass, new: newPass }),
        }
      );

      if (response) {
        console.log(response.status);
        switch (response.status) {
          case 200:
            handleCancel();
            break;
          case 406:
            setOldPassErr("Wrong password");
            break;
          default:
            console.log("Error: check the response status code");
            break;
        }
      }
    } catch (err) {
      console.error("Error submitting form", err);
    }

    setIsLoading(false);
  };

  const validForm = () => {
    if (isValidPassword(oldPass)) {
      if (isValidPassword(newPass)) {
        if (isValidPassword(verifyPass)) {
          if (newPass === verifyPass) {
            setVerifyPassErr("");
            setOldPassErr("");
            setNewPassErr("");
            handleSubmit();
          } else {
            setVerifyPassErr("The passwords you entered don't match");
            setOldPassErr("");
            setNewPassErr("");
          }
        } else {
          setVerifyPassErr("Please enter a valid password");
          setOldPassErr("");
          setNewPassErr("");
        }
      } else {
        setOldPassErr("");
        setNewPassErr("Please enter a valid password");
      }
    } else {
      setOldPassErr("Please enter a valid password");
    }
  };

  const handleCancel = () => {
    handleCloseDialog(ref);
    setOldPass("");
    setNewPass("");
    setVerifyPass("");
  };

  return (
    <dialog
      ref={ref}
      id="forget-pass-popup"
      className={`hidden fixed z-30 top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] sm:px-[34px] sm:py-[40px] px-[18px] pt-[25px] pb-[20px] flex-col items-start gap-[35px] rounded-[34px] lg:w-[44vw] sm:w-[65vw] w-[80vw] overflow-y-visible`}
    >
      <div className="w-full flex flex-col items-start gap-[18px]">
        <div className="w-full flex flex-col items-start gap-2">
          <label
            htmlFor="old-password"
            className="ml-[10px] sm:text-[14px] text-[13px] text-n600 font-medium"
          >
            Actual password
          </label>
          <div className="relative w-full">
            <input
              placeholder="Enter your actual password"
              type={visibleOldPass ? "text" : "password"}
              name="old-password"
              id="old-password"
              className="rounded-[19px] border-[1px] border-n300 p-[16px] w-full sm:text-[14px] text-[11px] text-n600"
              value={oldPass}
              onChange={(e) => {
                setOldPass(e.target.value);
              }}
            />

            <div
              className="absolute inset-y-0 right-2 pr-3 flex items-center cursor-pointer"
              onClick={() => {
                setVisibleOldPass(!visibleOldPass);
              }}
            >
              {visibleOldPass ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12"
                    stroke="#A0A3BD"
                    strokeWidth="2"
                    fillOpacity="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M1 12C1 12 5 20 12 20C19 20 23 12 23 12"
                    stroke="#A0A3BD"
                    strokeWidth="2"
                    fillOpacity="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="3"
                    stroke="#A0A3BD"
                    strokeWidth="2"
                    fillOpacity="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M8.82089 8.82243C8.50837 9.13505 8.33285 9.55902 8.33293 10.0011C8.333 10.4431 8.50868 10.867 8.8213 11.1795C9.13393 11.492 9.55789 11.6675 9.99993 11.6675C10.442 11.6674 10.8659 11.4917 11.1784 11.1791M13.9008 13.8942C12.7319 14.6256 11.3789 15.0091 10 15C7 15 4.5 13.3334 2.5 10C3.56 8.23336 4.76 6.93503 6.1 6.10503M8.48333 5.15002C8.98253 5.04897 9.49068 4.99871 10 5.00002C13 5.00002 15.5 6.66669 17.5 10C16.945 10.925 16.3508 11.7225 15.7183 12.3917M2.5 2.5L17.5 17.5"
                    stroke="#A0A3BD"
                    strokeWidth="1.3"
                    fillOpacity="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
          </div>

          <span className="text-[13px] text-red-600">{oldPassErr}</span>
        </div>

        <div className="w-full flex flex-col items-start gap-2">
          <label
            htmlFor="new-password"
            className="ml-[10px] sm:text-[14px] text-[13px] text-n600 font-medium"
          >
            New password
          </label>
          <div className="relative w-full">
            <input
              placeholder="Enter your new password"
              type={visibleNewPass ? "text" : "password"}
              name="new-password"
              id="new-password"
              className="rounded-[19px] border-[1px] border-n300 p-[16px] w-full sm:text-[14px] text-[11px] text-n600"
              value={newPass}
              onChange={(e) => {
                setNewPass(e.target.value);
              }}
            />

            <div
              className="absolute inset-y-0 right-2 pr-3 flex items-center cursor-pointer"
              onClick={() => {
                setVisibleNewPass(!visibleNewPass);
              }}
            >
              {visibleNewPass ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12"
                    stroke="#A0A3BD"
                    strokeWidth="2"
                    fillOpacity="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M1 12C1 12 5 20 12 20C19 20 23 12 23 12"
                    stroke="#A0A3BD"
                    strokeWidth="2"
                    fillOpacity="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="3"
                    stroke="#A0A3BD"
                    strokeWidth="2"
                    fillOpacity="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M8.82089 8.82243C8.50837 9.13505 8.33285 9.55902 8.33293 10.0011C8.333 10.4431 8.50868 10.867 8.8213 11.1795C9.13393 11.492 9.55789 11.6675 9.99993 11.6675C10.442 11.6674 10.8659 11.4917 11.1784 11.1791M13.9008 13.8942C12.7319 14.6256 11.3789 15.0091 10 15C7 15 4.5 13.3334 2.5 10C3.56 8.23336 4.76 6.93503 6.1 6.10503M8.48333 5.15002C8.98253 5.04897 9.49068 4.99871 10 5.00002C13 5.00002 15.5 6.66669 17.5 10C16.945 10.925 16.3508 11.7225 15.7183 12.3917M2.5 2.5L17.5 17.5"
                    stroke="#A0A3BD"
                    strokeWidth="1.3"
                    fillOpacity="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
          </div>

          <span className="text-[13px] text-red-600">{newPassErr}</span>
        </div>

        <div className="w-full flex flex-col items-start gap-2">
          <label
            htmlFor="verify-password"
            className="ml-[10px] sm:text-[14px] text-[13px] text-n600 font-medium"
          >
            Confirm New password
          </label>
          <div className="relative w-full">
            <input
              placeholder="Write your new password again"
              type={visibleVerifyPass ? "text" : "password"}
              name="verify-password"
              id="verify-password"
              className="rounded-[19px] border-[1px] border-n300 p-[16px] w-full sm:text-[14px] text-[11px] text-n600"
              value={verifyPass}
              onChange={(e) => {
                setVerifyPass(e.target.value);
              }}
            />

            <div
              className="absolute inset-y-0 right-2 pr-3 flex items-center cursor-pointer"
              onClick={() => {
                setVisibleVerifyPass(!visibleVerifyPass);
              }}
            >
              {visibleVerifyPass ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12"
                    stroke="#A0A3BD"
                    strokeWidth="2"
                    fillOpacity="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M1 12C1 12 5 20 12 20C19 20 23 12 23 12"
                    stroke="#A0A3BD"
                    strokeWidth="2"
                    fillOpacity="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="3"
                    stroke="#A0A3BD"
                    strokeWidth="2"
                    fillOpacity="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M8.82089 8.82243C8.50837 9.13505 8.33285 9.55902 8.33293 10.0011C8.333 10.4431 8.50868 10.867 8.8213 11.1795C9.13393 11.492 9.55789 11.6675 9.99993 11.6675C10.442 11.6674 10.8659 11.4917 11.1784 11.1791M13.9008 13.8942C12.7319 14.6256 11.3789 15.0091 10 15C7 15 4.5 13.3334 2.5 10C3.56 8.23336 4.76 6.93503 6.1 6.10503M8.48333 5.15002C8.98253 5.04897 9.49068 4.99871 10 5.00002C13 5.00002 15.5 6.66669 17.5 10C16.945 10.925 16.3508 11.7225 15.7183 12.3917M2.5 2.5L17.5 17.5"
                    stroke="#A0A3BD"
                    strokeWidth="1.3"
                    fillOpacity="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
          </div>

          <span className="text-[13px] text-red-600 ml-2">{verifyPassErr}</span>
        </div>

        <span
          className="text-[13px] text-primary font-medium leading-5 cursor-pointer ml-2"
          onClick={() => {
            navigate("/reset-pass");
          }}
        >
          Forgot password ?
        </span>
      </div>
      <div className="flex items-center gap-[10px] w-full">
        <button
          className="rounded-[86px] border-[1px] border-n400 py-[10px] flex-grow text-n600 sm:text-[14px] text-[12px] leading-5 font-semibold bg-n300"
          onClick={handleCancel}
        >
          Cancel
        </button>
        <button
          className="rounded-[86px] border-[1px] flex items-center justify-center border-primary py-[10px] flex-grow text-white sm:text-[14px] text-[12px] leading-5 font-semibold bg-primary"
          onClick={validForm}
        >
          {isLoading ? (
            <ThreeDots color="#fff" width="30" height="20" />
          ) : (
            "Change password"
          )}
        </button>
      </div>
    </dialog>
  );
});

export default ChangePassPopup;
