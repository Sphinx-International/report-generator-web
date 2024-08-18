import { isValidEmail } from "../../func/authValidation";
import { handleCloseDialog } from "../../func/openDialog";
import { forwardRef } from "react";
import { useState } from "react";
import { RotatingLines } from "react-loader-spinner";
const baseUrl = import.meta.env.VITE_BASE_URL;

const AddEmailPopup = forwardRef<HTMLDialogElement, object>((_, ref) => {
  const [email, setemail] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [visibleErr, setVisibleErr] = useState<boolean>(false);
  const [err, setErr] = useState<string>("");

  const handleSubmit = async () => {
    setIsLoading(true);
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return;
    }

    if (!(isValidEmail(email))) {
      setErr("invalid email.");
      setVisibleErr(true)
      setIsLoading(false);
      return;
    }
    try {
      const response = await fetch(`http://${baseUrl}/mail/create-mail`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({ email }),
      });

      if (response) {
        switch (response.status) {
          case 200:
            handleCloseDialog(ref);
            setemail("")
            setErr("")
            setVisibleErr(false)
            console.log("gg");
            break;
          case 400:
            setErr("verify your email.");
            setVisibleErr(true);
            break;
          case 406:
            setErr("email already exists.");
            setVisibleErr(true);
            break;
          default:
            console.log("error check the code");
            break;
        }
      }
    } catch (err) {
      console.error("Error submitting form", err);
    }

    setIsLoading(false);
  };

  return (
    <dialog
      ref={ref}
      className="bg-white rounded-[40px] p-[32px] hidden flex-col items-center gap-[20px] sm:w-[27%] absolute left-[50%] top-[50%] -translate-x-[50%] -translate-y-[50%]"
    >
      <div className="flex flex-col gap-[22px] w-full">
        <h3 className="w-full text-center text-[20px] leading-[20px] text-n800 font-semibold">
          Add email
        </h3>
        <div className="flex flex-col items-center gap-[30px] w-full">
          <div className="w-full flex flex-col items-start gap-[9px]">
            <label
              htmlFor="Email"
              className="text-n600 text-[14px] leading-[20px] font-medium"
            >
              Email
            </label>
            <input
              type="email"
              name="email"
              value={email}
              className="w-full px-[17.5px] h-[46px] rounded-[46px] shadow-md text-[13px] text-n700 font-medium"
              placeholder="example@gmail.com"
              onChange={(eo) => {
                setemail(eo.target.value);
              }}
            />
            {visibleErr && (
              <span className="text-[11px] text-[#DB2C2C] font-medium leading-[20px] ml-[15px]">
                {err}
              </span>
            )}
          </div>
          <button
            className="w-full flex items-center justify-center rounded-[30px] py-[13px] bg-primary text-white text-[14px] leading-[20px] font-semibold"
            onClick={() => {
              handleSubmit();
            }}
          >
            {isLoading ? (
              <RotatingLines strokeColor="white" width="20" />
            ) : (
              "Add email"
            )}
          </button>
        </div>
        <span
          className="text-[#111111] absolute top-6 right-6 cursor-pointer"
          onClick={() => {
            setemail("")
            setErr("")
            setVisibleErr(false)
            handleCloseDialog(ref);
          }}
        >
          🗙
        </span>
      </div>
    </dialog>
  );
});

export default AddEmailPopup;
