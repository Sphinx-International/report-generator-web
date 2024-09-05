import { isValidEmail } from "../../func/authValidation";
import { handleCloseDialog } from "../../func/openDialog";
import { forwardRef, useState, useEffect } from "react";
import { RotatingLines } from "react-loader-spinner";
import { Resmail } from "../../assets/types/Mails&Notifications";

const baseUrl = import.meta.env.VITE_BASE_URL;

interface AddOrUpdateEmailPopup {
  method: "POST" | "PUT";
  fetchFunc: () => void,
  editMail?: Resmail;
}

const AddEmailPopup = forwardRef<HTMLDialogElement, AddOrUpdateEmailPopup>(
  (props, ref) => {
    const [email, setEmail] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [visibleErr, setVisibleErr] = useState<boolean>(false);
    const [err, setErr] = useState<string>("");

    // Effect to update email state when editMail prop changes
    useEffect(() => {
      if (props.method === "PUT" && props.editMail) {
        setEmail(props.editMail.email);
      } else {
        setEmail("");
      }
    }, [props.editMail, props.method]);

    const handleSubmit = async () => {
      setIsLoading(true);
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        setIsLoading(false);
        return;
      }

      if (!isValidEmail(email)) {
        setErr("Invalid email.");
        setVisibleErr(true);
        setIsLoading(false);
        return;
      }

      const body = JSON.stringify(
        props.method === "POST"
          ? { email }
          : { mail_id: props.editMail?.id, email }
      );

      try {
        const response = await fetch(
          props.method === "POST"
            ? `${baseUrl}/mail/create-mail`
            : `${baseUrl}/mail/update-mail`,
          {
            method: props.method,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${token}`,
            },
            body,
          }
        );

        if (response) {
          switch (response.status) {
            case 200:
              handleCloseDialog(ref);
              setEmail("");
              setErr("");
              setVisibleErr(false);
              props.fetchFunc()
              break;
            case 400:
              setErr("Verify your email.");
              break;
            case 406:
              setErr("Email already exists.");
              setVisibleErr(true);
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

    return (
      <dialog
        ref={ref}
        className="bg-white rounded-[40px] p-[32px] hidden flex-col items-center gap-[20px] sm:w-[27%] absolute left-[50%] top-[50%] -translate-x-[50%] -translate-y-[50%]"
      >
        <div className="flex flex-col gap-[22px] w-full">
          <h3 className="w-full text-center text-[20px] leading-[20px] text-n800 font-semibold">
            {props.method === "POST" ? "Add email" : "Edit email"}
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
                onChange={(eo) => setEmail(eo.target.value)}
              />
              {visibleErr && (
                <span className="text-[11px] text-[#DB2C2C] font-medium leading-[20px] ml-[15px]">
                  {err}
                </span>
              )}
            </div>
            <button
              className="w-full flex items-center justify-center rounded-[30px] py-[13px] bg-primary text-white text-[14px] leading-[20px] font-semibold"
              onClick={handleSubmit}
            >
              {isLoading ? (
                <RotatingLines strokeColor="white" width="20" />
              ) : props.method === "POST" ? (
                "Add email"
              ) : (
                "Edit"
              )}
            </button>
          </div>
          <span
            className="text-[#111111] absolute top-6 right-6 cursor-pointer"
            onClick={() => {
              setErr("");
              setVisibleErr(false);
              handleCloseDialog(ref);
            }}
          >
            🗙
          </span>
        </div>
      </dialog>
    );
  }
);

export default AddEmailPopup;
