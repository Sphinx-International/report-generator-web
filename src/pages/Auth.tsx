import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { isValidEmail, isValidPassword } from "../func/authValidation";
import { ThreeDots } from "react-loader-spinner";

const Auth = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [emailErr, setEmailErr] = useState(false);
  const [emailErrMsg, setEmailErrMsg] = useState("");

  const [passwordErr, setPasswordErr] = useState(false);
  const [passwordErrMsg, setPasswordErrMsg] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const [mobilePopUpPosition, setMobilePopUpPosition] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const check_email_and_password = (
    email: string,
    password: string,
    e: React.FormEvent
  ) => {
    e.preventDefault();
    if (isValidEmail(email)) {
      setEmailErr(false);
      if (isValidPassword(password)) {
        setPasswordErr(false);
        handleSubmit(e);
      } else {
        setPasswordErr(true);
        setPasswordErrMsg("Please enter a valid password");
      }
    } else {
      setEmailErr(true);
      setEmailErrMsg("Please enter a valid email");
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch("/account/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response) {
        const data = await response.json();
        console.log("Form submitted successfully", data);

        if (response.status === 200) {
          if (rememberMe) {
            localStorage.setItem("token", data.token);
          }
          sessionStorage.setItem("token", data.token);
          localStorage.setItem("user_id", data.account.email);
          localStorage.setItem("user", JSON.stringify(data.account));

          if (data.account.role === 0) {
            navigate("/users");
            localStorage.setItem('role', data.account.role.toString());
          } else {
            navigate("/missions");
            localStorage.setItem('role', data.account.role.toString());
          }
        } else if (response.status === 401) {
          setPasswordErr(true);
          setPasswordErrMsg("Wrong password");
        } else if (response.status === 404) {
          setEmailErr(true);
          setEmailErrMsg("email not found");
        } else {
          console.error("Unexpected error", response.statusText);
        }

      } else {
        console.error("Error submitting form");
      }
    } catch (err) {
      console.error("Error submitting form", err);
    }

    setIsLoading(false);
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
          <button
            onClick={() => {
              setMobilePopUpPosition(true);
            }}
            type="submit"
            className="inline-block md:hidden py-[20px] w-full text-white rounded-[86px] font-semibold bg-primary"
          >
            Get started
          </button>
        </div>
      </div>
      <div className="md:flex hidden flex-col items-center gap-[12px] lg:px-[50px] px-[30px] w-[58%] lg:w-[45%] ">
        <h1 className="text-[35px] font-bold leading-[52.5px] text-n800 mt-3">
          Welcome !
        </h1>
        <span className="text-center text-n500 w-full xl:w-[400px]">
          Enter your email address and password to access your account.
        </span>
        <form
          action="post"
          className="px-[30px] py-[38px] flex flex-col gap-[30px] items-start justify-center w-full"
        >
          <div className="flex flex-col items-start justify-center gap-[30px] w-full ">
            <div className="flex flex-col items-start justify-center gap-[11px] w-full">
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
              {emailErr && (
                <span className="ml-[12px] text-[14px] text-[#DB2C2C] leading-[22px]">
                  {emailErrMsg}
                </span>
              )}
            </div>

            <div className="flex flex-col items-start justify-center gap-[11px] w-full">
              <label
                htmlFor="password"
                className="text-[18px] leading-[20px] text-n700 ml-[4px] font-medium"
              >
                Password
              </label>
              <div className="relative w-full">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  placeholder="Password"
                  className="w-full h-[60px] rounded-[46px] shadow-md px-[21px] text-n600 pr-[45px]"
                  onChange={(eo) => {
                    setPassword(eo.target.value);
                  }}
                />
                <div
                  className="absolute inset-y-0 right-2 pr-3 flex items-center cursor-pointer"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
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
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M1 12C1 12 5 20 12 20C19 20 23 12 23 12"
                        stroke="#A0A3BD"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="3"
                        stroke="#A0A3BD"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
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
                        stroke-width="1.3"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  )}
                </div>
              </div>
              {passwordErr && (
                <span className="ml-[12px] text-[14px] text-[#DB2C2C] leading-[22px]">
                  {passwordErrMsg}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-[6px]">
              <input
                type="checkbox"
                name="remember"
                id="Remember"
                className="w-[15.75px] h-[15.75px] rounded-[4.5px] border-[1.13px] border-n500"
                checked={rememberMe} 
                onChange={() => setRememberMe(!rememberMe)} 
              />
              <span className="text-[14px] leading-[20px] text-n700 ">
                Remember me
              </span>
            </div>
            <Link to="/reset-pass">
              <span className="text-primary text-[14px] leading-[20px] cursor-pointer font-medium">
                Forgot password ?
              </span>
            </Link>
          </div>
          <button
            type="submit"
            className={`${
              isLoading ? "py-[12px]" : "py-[15px]"
            } w-full text-white rounded-[86px] font-semibold bg-primary flex items-center justify-center`}
            onClick={(eo) => {
              check_email_and_password(email, password, eo);
            }}
          >
            {isLoading ? (
              <ThreeDots color="#fff" width="50" height="30" />
            ) : (
              "Log in"
            )}
          </button>
        </form>
      </div>

      <div
        className={`fixed ${
          mobilePopUpPosition ? "bottom-0" : "-bottom-[90vh]"
        }  bg-white rounded-[33px] flex md:hidden flex-col items-center gap-[12px] sm:px-[30px] px-[18px] w-[100%] transition-all duration-[1700ms]`}
      >
        <h1 className="text-[28px] font-bold leading-[52.5px] text-n800 mt-3">
          Welcome !
        </h1>
        <span className="text-center text-[14px] text-n500 w-[95%]">
          Enter your email address and password to access your account.
        </span>
        <form
          action="post"
          className="sm:px-[30px] px-[18px] py-[38px] flex flex-col gap-[30px] items-start justify-center w-full"
        >
          <div className="flex flex-col items-start justify-center gap-[35px] w-full ">
            <div className="flex flex-col items-start justify-center gap-[15px] w-full">
              <label
                htmlFor="email"
                className="text-[15px] leading-[20px] text-n700 ml-[4px] font-medium"
              >
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                placeholder="Email address"
                className="w-full h-[46px] rounded-[46px] shadow-md px-[21px] text-n600"
              />
            </div>

            <div className="flex flex-col items-start justify-center gap-[15px] w-full">
              <label
                htmlFor="password"
                className="text-[15px] leading-[20px] text-n700 ml-[4px] font-medium"
              >
                Password
              </label>
              <div className="relative w-full">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  placeholder="Password"
                  className="w-full h-[46px] rounded-[46px] shadow-md px-[21px] text-n600 pr-[45px]"
                />
                <div
                  className="absolute inset-y-0 right-2 pr-3 flex items-center cursor-pointer"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
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
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M1 12C1 12 5 20 12 20C19 20 23 12 23 12"
                        stroke="#A0A3BD"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="3"
                        stroke="#A0A3BD"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
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
                        stroke-width="1.3"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-[6px] ">
              <input
                type="checkbox"
                name="remember"
                id="Remember"
                className="w-[15.75px] h-[15.75px] rounded-[4.5px] border-[1.13px] border-n500"
                checked={rememberMe} 
                onChange={() => setRememberMe(!rememberMe)} 
              />
              <span className=" text-[14px] leading-[20px] text-n700 ">
                Remember me
              </span>
            </div>
            <span className="text-primary text-[14px] leading-[20px] cursor-pointer font-medium">
              Forgot password ?
            </span>
          </div>
          <button
            type="submit"
            className="py-[13px] w-full text-white rounded-[86px] font-semibold bg-primary flex items-center justify-center"
            onClick={(eo) => {
              check_email_and_password(email, password, eo);
            }}
          >
            {isLoading ? (
              <ThreeDots color="#fff" width="30" height="20" />
            ) : (
              "Log in"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Auth;
