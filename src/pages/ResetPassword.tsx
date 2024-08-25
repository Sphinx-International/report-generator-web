import { useState, useRef } from "react";
import {
  isValidEmail,
  check4DigitCode,
  isValidPassword,
} from "../func/authValidation";
const baseUrl = import.meta.env.VITE_BASE_URL;

const ResetPassword = () => {
  const [email, setEmail] = useState<string>("");
  const [code, setCode] = useState(["", "", "", ""]);
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const [error, setError] = useState<boolean>(false);
  const [newPassError, setNewPassError] = useState<boolean>(false);
  const [confirmPassError, setConfirmPassError] = useState<boolean>(false);

  const [resetPage, setResetPage] = useState<1 | 2 | 3>(1);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleCodeChange = (index: number, value: string) => {
    if (value === "" || /^\d$/.test(value)) {
      setCode((prevCode) => {
        const newCode = [...prevCode];
        newCode[index] = value;
        return newCode;
      });

      if (value !== "" && index < inputRefs.current.length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    } else {
      if (inputRefs.current[index]) {
        inputRefs.current[index]!.value = "";
      }
    }
  };

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Backspace") {
      setCode((prevCode) => {
        const newCode = [...prevCode];
        newCode[index] = "";
        return newCode;
      });

      if (index > 0 && code[index] === "") {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const checkNewPassword = (newPass: string, confirmPass: string) => {
    if (isValidPassword(newPass)) {
      setNewPassError(false);
      if (newPass === confirmPass) {
        setConfirmPassError(false);
      } else {
        setConfirmPassError(true);
      }
    } else {
      setNewPassError(true);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`http://${baseUrl}/account/forget-password`, {

        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response) {
        const data = await response.json();
        console.log("Form submitted successfully", data);
        console.log(response.status)

      /*  if (response.status === 200) {
          localStorage.setItem("token", data.token);
          navigate("/users");
        } else if (response.status === 401) {
          setPasswordErr(true);
          setPasswordErrMsg("Wrong password");
        } else if (response.status === 404) {
          setEmailErr(true);
          setEmailErrMsg("email not found");
        } else {
          console.error("Unexpected error", response.statusText);
        } 

        /* setEmail("");
        setPassword(""); */
      } else {
        console.error("Error submitting form");
      }
    } catch (err) {
      console.error("Error submitting form", err);
    }
  };




  return (
    <div className="flex items-center justify-center w-full h-[100vh]">
      <div
        className="flex flex-col items-center justify-center gap-[66px] h-full flex-grow px-[30px]"
        style={{
          background: "linear-gradient(to bottom, #D7DFFF, #F0E4FF)",
        }}
      >
        <img
          src="/logo.png"
          alt="logo"
          className="w-[200px] h-[55px] lg:w-[289px] lg:h-[73px]"
        />
        <div className="flex flex-col items-center justify-center gap-[53px]">
          <img
            src="/astro.png"
            alt="astro vector"
            className="w-[180px] lg:w-[221px]"
          />
          <div className="flex flex-col items-center lg:gap-0 gap-[10px]">
            <h1 className="hidden md:inline-block lg:text-[32px] text-[29px] font-bold leading-[34px] text-n800 text-center">
              Hi , Get Started With Us !
            </h1>
            <h1 className="md:hidden inline-block text-[22px] sm:text-[26px] font-bold leading-[34px] text-n800 text-center">
              Hi , Welcome Back !
            </h1>
            <span className="text-[14px] sm:text-[17px] font-semibold leading-[34px] text-primary text-center">
              just a couple of clicks and we start
            </span>
          </div>
        </div>
      </div>

      <div
        className={`md:flex hidden flex-col items-center lg:px-[50px] px-[30px] w-[58%] lg:w-[45%] ${
          resetPage !== 1 ? "gap-[5px]" : "gap-[50px]"
        }`}
      >
        {resetPage === 1 && (
          <>
            <div className="flex flex-col items-center gap-[16px]">
              <h1 className="text-[35px] font-bold leading-[52.5px] text-n800 mt-3">
                Reset your password
              </h1>
              <span className="text-center text-n500 w-full xl:w-[400px]">
                Enter your email address to recieve a code{" "}
              </span>
            </div>

            <form
              action="post"
              className="px-[30px] py-[38px] flex flex-col gap-[36px] items-start justify-center w-full"
            >
              <div className="flex flex-col items-start justify-center gap-[15px] w-full">
                <label
                  htmlFor="email"
                  className="text-[18px] leading-[20px] text-n700 ml-[4px] font-medium"
                >
                  Email address
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  placeholder="Email address"
                  className="w-full h-[60px] rounded-[46px] shadow-md px-[21px] text-n600"
                  onChange={(eo) => {
                    setEmail(eo.target.value);
                  }}
                />
                {error && (
                  <span className="ml-[12px] text-[14px] text-[#DB2C2C] leading-[22px]">
                    Enter a valid email
                  </span>
                )}
              </div>
              <button
                type="submit"
                className="py-[18px] w-full text-white rounded-[86px] font-semibold bg-primary leading-[20px]"
                onClick={(eo) => {
                 
                  isValidEmail(email)
                    ? (setError(false), setResetPage(2), handleSubmit(eo))
                    : setError(true);
                }}
              >
                Send code
              </button>
            </form>
          </>
        )}

        {resetPage === 2 && (
          <>
            <div className="flex flex-col items-center gap-[16px]">
              <h1 className="text-[35px] font-bold leading-[52.5px] text-n800 mt-3">
                Verify your email{" "}
              </h1>
              <span className="text-center text-n500 w-full xl:w-[400px]">
                We have sent a verification code to <br /> merry@gmail.com
              </span>
            </div>

            <form
              action="post"
              className="px-[30px] py-[38px] flex flex-col gap-[36px] items-center justify-center w-full"
            >
              <div className="flex flex-col items-center justify-center gap-[15px] w-full">
                <div className="flex justify-center gap-[15px]">
                  {Array.from({ length: 4 }).map((_, index) => {
                    return (
                      <input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        pattern="[0-9]"
                        title="Only numbers between 0-9 are allowed"
                        className="w-[80px] h-[80px] text-center text-[48px] font-medium rounded-full border border-[#D0D5DD] text-n700"
                        maxLength={1}
                        onChange={(e) => {
                          const value = e.target.value;

                          if (value === "" || /^\d$/.test(value)) {
                            handleCodeChange(index, value);
                          } else {
                            e.target.value = ""; // Clear the input if it's not a number between 0-9
                          }
                        }}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        placeholder="0"
                      />
                    );
                  })}
                </div>
                {error && (
                  <span className="ml-[12px] text-[14px] text-[#DB2C2C] leading-[22px]">
                    Enter a valid code please{" "}
                  </span>
                )}
              </div>
              <button
                type="submit"
                className="py-[18px] w-full text-white rounded-[86px] font-semibold bg-primary leading-[20px]"
                onClick={(eo) => {
                  eo.preventDefault();
                  check4DigitCode(code)
                    ? (setError(false), setResetPage(3))
                    : setError(true);
                }}
              >
                Next
              </button>
              <span className="text-[14px] text-n600">
                You haven’t recieved a code ?{" "}
                <span className="font-semibold text-primary cursor-pointer">
                  Click to resend
                </span>
              </span>
            </form>
          </>
        )}

        {resetPage === 3 && (
          <>
            <h1 className="text-[35px] font-bold leading-[52.5px] text-n800 mt-3">
              Reset your password{" "}
            </h1>

            <form
              action="post"
              className="px-[30px] py-[38px] flex flex-col gap-[36px] items-start justify-center w-full"
            >
              <div className="flex flex-col items-start justify-center gap-[25px] w-full">
                <div className="flex flex-col items-start justify-center gap-[15px] w-full">
                  <label
                    htmlFor="password"
                    className="text-[18px] leading-[20px] text-n700 ml-[4px] font-medium"
                  >
                    New Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    placeholder="New Password"
                    className="w-full h-[60px] rounded-[46px] shadow-md px-[21px] text-n600"
                    onChange={(eo) => {
                      setNewPassword(eo.target.value);
                    }}
                  />
                  {newPassError && (
                    <span className="ml-[12px] text-[14px] text-[#DB2C2C] leading-[22px]">
                      Enter a valid password
                    </span>
                  )}
                </div>

                <div className="flex flex-col items-start justify-center gap-[15px] w-full">
                  <label
                    htmlFor="confirm-password"
                    className="text-[18px] leading-[20px] text-n700 ml-[4px] font-medium"
                  >
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirm-password"
                    id="confirm-password"
                    placeholder="Confirm Password"
                    className="w-full h-[60px] rounded-[46px] shadow-md px-[21px] text-n600"
                    onChange={(eo) => {
                      setConfirmPassword(eo.target.value);
                    }}
                  />
                  {confirmPassError && (
                    <span className="ml-[12px] text-[14px] text-[#DB2C2C] leading-[22px]">
                      Doesn't match the first password
                    </span>
                  )}
                </div>
                <div className="flex flex-col items-start gap-[12px]">
                  <div className="flex items-center gap-[10px]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="22"
                      height="22"
                      viewBox="0 0 22 22"
                      fill="none"
                    >
                      <path
                        d="M6.87516 11.0007L9.62516 13.7507L15.1252 8.25065M20.1668 11.0007C20.1668 16.0633 16.0628 20.1673 11.0002 20.1673C5.93755 20.1673 1.8335 16.0633 1.8335 11.0007C1.8335 5.93804 5.93755 1.83398 11.0002 1.83398C16.0628 1.83398 20.1668 5.93804 20.1668 11.0007Z"
                        stroke="#D0D5DD"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                    <span className="text-[14px] leading-[22px] text-[#475467]">
                      Password at least contain 6 character
                    </span>
                  </div>
                  <div className="flex items-center gap-[10px]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="22"
                      height="22"
                      viewBox="0 0 22 22"
                      fill="none"
                    >
                      <path
                        d="M6.87516 11.0007L9.62516 13.7507L15.1252 8.25065M20.1668 11.0007C20.1668 16.0633 16.0628 20.1673 11.0002 20.1673C5.93755 20.1673 1.8335 16.0633 1.8335 11.0007C1.8335 5.93804 5.93755 1.83398 11.0002 1.83398C16.0628 1.83398 20.1668 5.93804 20.1668 11.0007Z"
                        stroke="#D0D5DD"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                    <span className="text-[14px] leading-[22px] text-[#475467]">
                      Password must contain both letters and numbers.
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="submit"
                className="py-[18px] w-full text-white rounded-[86px] font-semibold bg-primary leading-[20px]"
                onClick={(eo) => {
                  eo.preventDefault();
                  checkNewPassword(newPassword, confirmPassword);
                }}
              >
                Confirm
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
