import SideBar from "../components/SideBar";
import Header from "../components/Header";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/CustomDatePicker.css";
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { ThreeDots, RotatingLines } from "react-loader-spinner";
import { User } from "../assets/types/User";
import {
  handle_active_or_deactivate_user,
  handleSaveGeneralEdit,
  handleSaveRoleEdit,
  handleSaveAccessibilityEdit,
} from "../func/editUseraApis";
import CustomDeletePopup from "../components/CustomDeletePopup";
import { handleOpenDialog } from "../func/openDialog";
const baseUrl = import.meta.env.VITE_BASE_URL;
import { useSnackbar } from "notistack";

const EditUsers = () => {
  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();

  const deletePopupRef = useRef<HTMLDialogElement>(null);
  const deactivatePopupRef = useRef<HTMLDialogElement>(null);

  const [isEditingGeneral, setIsEditingGeneral] = useState<boolean>(false);
  const [isEditingRole, setIsEditingRole] = useState<boolean>(false);
  const [isEditingAccessibility, setIsEditingAccessibility] =
    useState<boolean>(false);

  const [isPageLoading, setIsPageLoading] = useState<boolean>(true);

  const [isLoadingGeneral, setIsLoadingGeneral] = useState<boolean>(false);
  const [isLoadingRole, setIsLoadingRole] = useState<boolean>(false);
  const [isLoadingAccessibility, setIsLoadingAccessibility] =
    useState<boolean>(false);
  const [User, setUser] = useState<User>();

  const [errGeneral, setErrGeneral] = useState<string>("");

  const [firstName, setFirstName] = useState<string | undefined>("");
  const [lastName, setLastName] = useState<string | undefined>("");
  const [email, setEmail] = useState<string | undefined>("");
  const [hasAccessTo, setHasAccessTo] = useState<number[]>([]);

  const [selectedOption, setSelectedOption] = useState<
    "Coordinator" | "Engineer" | "Client" | undefined
  >();

  const options = ["Engineer", "Coordinator", "Client"] as const;

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const toggleDropdown = () => setIsOpen(!isOpen);
  const handleOptionClick = (option: "Coordinator" | "Engineer" | "Client") => {
    setSelectedOption(option);
    setIsOpen(false);
  };

  const fetchUser = async () => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return;
    }

    const url = `${baseUrl}/account/get-account/${id}`;

    setIsPageLoading(true);
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text(); // Read the response body as text
        console.error("Error response text: ", errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // console.log("Response data: ", data); // Log the data for debugging
      setUser(data);
      setHasAccessTo(data.has_access_to);
      setFirstName(data.first_name);
      setLastName(data.last_name);
      setEmail(data.email);
      setSelectedOption(
        data.role === 1
          ? "Coordinator"
          : data.role === 2
          ? "Engineer"
          : "Client"
      );
    } catch (err) {
      console.error("Error: ", err);
    } finally {
      setIsPageLoading(false);
    }
  };

  const handleCancelGeneral = () => {
    setIsEditingGeneral(false);
    setFirstName(User?.first_name);
    setLastName(User?.last_name);
    setEmail(User?.email);
  };
  const handleCancelRole = () => {
    setIsEditingRole(false);
    setSelectedOption(
      User?.role === 1
        ? "Coordinator"
        : User?.role === 2
        ? "Engineer"
        : "Client"
    );
  };
  const handleCancelAccessibility = () => {
    setIsEditingAccessibility(false);
    setHasAccessTo(User ? User.has_access_to : []);
  };

  const handleChangeCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setHasAccessTo((prev) => [...prev, Number(e.target.name)]);
    } else {
      setHasAccessTo((prev) =>
        prev.filter((item) => item !== Number(e.target.name))
      );
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <div className="w-full flex h-[100vh]">
      <SideBar />
      <div className="lg:pl-[26px] md:pt-[32px] pt-[20px] lg:pr-[30px] sm:px-[30px] px-[15px] pb-[20px] flex flex-col gap-[26px] w-full md:h-[100vh] overflow-y-auto">
        <Header pageSentence="User profile" searchBar={false} />
        {isPageLoading ? (
          <div className="flex w-full items-center justify-center py-[60px]">
            {" "}
            <RotatingLines strokeWidth="4" strokeColor="#4A3AFF" width="60" />
          </div>
        ) : (
          <div className="w-full flex flex-col gap-[12px]">
            <div className="rounded-[20px] border-n400 border-[1px] py-[20px] px-[21px]">
              <div className="flex items-center md:gap-[34px] gap-[15px] ">
                <img
                  src="/avatar2.jpg"
                  alt="avatar"
                  className="md:w-[100px] rounded-[50%] w-[70px]"
                />
                <div className="flex items-start flex-col gap-[6px]">
                  <h2 className="md:text-[18px] text-[15px] leading-[28.08px] text-n800 font-medium">
                    {firstName} {lastName}
                  </h2>
                  <span className="ms:text-[14px] text-[12px]  text-550">
                    {email}
                  </span>
                </div>
              </div>
            </div>
            <div className="rounded-[20px] border-n400 border-[1px] p-[21px] w-full flex items-start flex-col gap-[23px]">
              <div className="w-full flex items-center justify-between">
                <h3 className="text-n800 md:text-[17px] text-[15px]  leading-[25.5px] font-medium">
                  Personal information
                </h3>

                {!isEditingGeneral && (
                  <button
                    className="rounded-[20px] text-primary border-[1px] border-primary flex items-center gap-[3px] md:px-[17px] md:py-[6px] px-[13px] py-[3px] leading text-[13px] font-medium"
                    onClick={() => {
                      setIsEditingGeneral(true);
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="17"
                      height="17"
                      viewBox="0 0 17 17"
                      fill="none"
                    >
                      <path
                        d="M10.5003 4.49996L12.5003 6.49996M9.16699 13.8333H14.5003M3.83366 11.1666L3.16699 13.8333L5.83366 13.1666L13.5577 5.44263C13.8076 5.19259 13.948 4.85351 13.948 4.49996C13.948 4.14641 13.8076 3.80733 13.5577 3.55729L13.443 3.44263C13.193 3.19267 12.8539 3.05225 12.5003 3.05225C12.1468 3.05225 11.8077 3.19267 11.5577 3.44263L3.83366 11.1666Z"
                        stroke="#4A3AFF"
                        strokeWidth="1.66667"
                        fillOpacity="round"
                        strokeLinejoin="round"
                      />
                    </svg>{" "}
                    Edit
                  </button>
                )}
              </div>
              <form className="flex flex-col gap-[40px] w-full">
                <div className="flex flex-wrap lg:gap-x-[70px] gap-x-[20px] gap-y-[20px] w-full">
                  <div className="flex flex-col items-start gap-[9px] w-[45%]">
                    <label
                      htmlFor="firstName"
                      className="text-600 text-[15px] leading-[20px] font-medium text-n600"
                    >
                      First name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={firstName}
                      onChange={(eo) => {
                        setFirstName(eo.target.value);
                      }}
                      className={`rounded-[46px] h-[50px] px-[19px] w-full ${
                        isEditingGeneral ? "shadow-lg" : ""
                      }`}
                      disabled={isEditingGeneral ? false : true}
                    />
                  </div>
                  <div className="flex flex-col items-start gap-[9px] w-[45%]">
                    <label
                      htmlFor="lastName"
                      className="text-600 text-[15px] leading-[20px] font-medium text-n600"
                    >
                      Last name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={lastName}
                      onChange={(eo) => {
                        setLastName(eo.target.value);
                      }}
                      className={`rounded-[46px] h-[50px] px-[19px] w-full ${
                        isEditingGeneral ? "shadow-lg" : ""
                      }`}
                      disabled={isEditingGeneral ? false : true}
                    />
                  </div>
                  {/* 
                  <div className="flex flex-col items-start gap-[9px] w-[45%]">
                    <label
                      htmlFor="lastName"
                      className="text-600 text-[15px] leading-[20px] font-medium text-n600"
                    >
                      Birthdate
                    </label>
                    <DatePicker
                      selected={selectedDate}
                      onChange={(date: Date | null) => setSelectedDate(date)}
                      disabled={isEditingGeneral ? false : true}
                      value="07/03/2024"
                      className={`px-[18px] w-full sm:h-[48px] h-[44px] rounded-[46px] text-n500 sm:text-[16px] text-[14px] ${
                        isEditingGeneral ? "shadow-lg" : "shadow-none"
                      }`}
                      id="birthdate"
                      calendarClassName="custom-datepicker"
                    />{" "}
                  </div>
                  <div className="flex flex-col items-start gap-[9px] w-[45%]">
                    <label
                      htmlFor="email"
                      className="text-600 text-[15px] leading-[20px] font-medium text-n600"
                    >
                      Email
                    </label>
                    <input
                      type="text"
                      name="email"
                      value={email}
                      onChange={(eo) => {
                        setEmail(eo.target.value);
                      }}
                      className={`rounded-[46px] h-[50px] px-[19px] w-full ${
                        isEditingGeneral ? "shadow-lg" : ""
                      }`}
                      disabled={isEditingGeneral ? false : true}
                    />
                  </div>  */}
                </div>
                {isEditingGeneral && (
                  <div className="w-full flex items-center justify-between">
                    <span className="ml-[12px] text-[14px] text-[#DB2C2C] leading-[22px]">
                      {errGeneral}
                    </span>

                    <div className="flex items-center gap-[6px]">
                      {" "}
                      <button
                        type="submit"
                        className="md:py-[8px] md:px-[30px] py-[6px] px-[21px] text-n600 rounded-[86px] font-semibold bg-n300 leading-[20px]"
                        onClick={handleCancelGeneral}
                      >
                        cancel
                      </button>
                      <button
                        type="submit"
                        className="md:py-[8px] md:px-[30px] py-[6px] px-[21px] text-white rounded-[86px] font-semibold bg-primary leading-[20px]"
                        onClick={(eo) => {
                          handleSaveGeneralEdit(
                            eo,
                            setIsLoadingGeneral,
                            setIsEditingGeneral,
                            setErrGeneral,
                            User!.email,
                            firstName!,
                            lastName!,
                            fetchUser
                          );
                        }}
                      >
                        {isLoadingGeneral ? (
                          <ThreeDots color="#fff" width="50" height="20" />
                        ) : (
                          "confirme"
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
            <div className="rounded-[20px] border-n400 border-[1px] p-[21px] w-full flex items-start flex-col gap-[23px]">
              <h3 className="text-n800 md:text-[17px] text-[15px] leading-[25.5px] font-medium">
                Account Information
              </h3>

              <div className="flex flex-col items-start gap-[9px] w-full">
                <div className="w-full flex items-center justify-between">
                  <label
                    htmlFor="role"
                    className="text-600 text-[15px] leading-[20px] font-medium text-n600"
                  >
                    Role
                  </label>

                  {!isEditingRole && (
                    <button
                      className="rounded-[20px] text-primary border-[1px] border-primary flex items-center gap-[3px] md:px-[17px] md:py-[6px] px-[13px] py-[3px] leading text-[13px] font-medium"
                      onClick={() => {
                        setIsEditingRole(true);
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="17"
                        height="17"
                        viewBox="0 0 17 17"
                        fill="none"
                      >
                        <path
                          d="M10.5003 4.49996L12.5003 6.49996M9.16699 13.8333H14.5003M3.83366 11.1666L3.16699 13.8333L5.83366 13.1666L13.5577 5.44263C13.8076 5.19259 13.948 4.85351 13.948 4.49996C13.948 4.14641 13.8076 3.80733 13.5577 3.55729L13.443 3.44263C13.193 3.19267 12.8539 3.05225 12.5003 3.05225C12.1468 3.05225 11.8077 3.19267 11.5577 3.44263L3.83366 11.1666Z"
                          stroke="#4A3AFF"
                          strokeWidth="1.66667"
                          fillOpacity="round"
                          strokeLinejoin="round"
                        />
                      </svg>{" "}
                      Edit
                    </button>
                  )}
                </div>

                <div className="relative sm:w-[45%] w-[70%]">
                  <button
                    className={`rounded-[46px] h-[50px] px-[19px] w-full flex items-center justify-between ${
                      isEditingRole ? "shadow-lg" : "cursor-default"
                    }`}
                    onClick={() => {
                      isEditingRole ? toggleDropdown() : null;
                    }}
                  >
                    {selectedOption}
                    {isEditingRole && (
                      <svg
                        className={`w-[16px] h-[16px] transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillOpacity="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        ></path>
                      </svg>
                    )}
                  </button>
                  {isOpen && (
                    <ul className="absolute w-full bg-white rounded-[30px] shadow-lg mt-2 z-10">
                      {options.map((option) => (
                        <li
                          key={option}
                          className={`px-[18px] py-[10px] text-n600 sm:text-[16px] text-[14px] cursor-pointer hover:bg-gray-100 ${
                            option === selectedOption ? "bg-gray-100" : ""
                          }`}
                          onClick={() => {
                            handleOptionClick(option);
                          }}
                        >
                          {option}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="flex justify-end w-full ">
                {isEditingRole && (
                  <div className="flex items-center gap-[6px]">
                    {" "}
                    <button
                      type="submit"
                      className="md:py-[8px] md:px-[30px] py-[6px] px-[21px] text-n600 rounded-[86px] font-semibold bg-n300 leading-[20px]"
                      onClick={handleCancelRole}
                    >
                      cancel
                    </button>
                    <button
                      type="submit"
                      className=" md:py-[8px] md:px-[30px] py-[6px] px-[21px] text-white rounded-[86px] font-semibold bg-primary leading-[20px]"
                      onClick={(eo) => {
                        handleSaveRoleEdit(
                          eo,
                          setIsLoadingRole,
                          setIsEditingRole,
                          User!.email,
                          selectedOption!,
                          fetchUser
                        );
                      }}
                    >
                      {isLoadingRole ? (
                        <ThreeDots color="#fff" width="50" height="20" />
                      ) : (
                        "confirme"
                      )}
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-start gap-[9px] w-full">
                <div className="w-full flex items-center justify-between">
                  <label
                    htmlFor="role"
                    className="text-600 text-[15px] leading-[20px] font-medium text-n600"
                  >
                    Accessibility
                  </label>
                  {!isEditingAccessibility && (
                    <button
                      className="rounded-[20px] text-primary border-[1px] border-primary flex items-center gap-[3px] md:px-[17px] md:py-[6px] px-[13px] py-[3px] leading text-[13px] font-medium"
                      onClick={() => {
                        setIsEditingAccessibility(true);
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="17"
                        height="17"
                        viewBox="0 0 17 17"
                        fill="none"
                      >
                        <path
                          d="M10.5003 4.49996L12.5003 6.49996M9.16699 13.8333H14.5003M3.83366 11.1666L3.16699 13.8333L5.83366 13.1666L13.5577 5.44263C13.8076 5.19259 13.948 4.85351 13.948 4.49996C13.948 4.14641 13.8076 3.80733 13.5577 3.55729L13.443 3.44263C13.193 3.19267 12.8539 3.05225 12.5003 3.05225C12.1468 3.05225 11.8077 3.19267 11.5577 3.44263L3.83366 11.1666Z"
                          stroke="#4A3AFF"
                          strokeWidth="1.66667"
                          fillOpacity="round"
                          strokeLinejoin="round"
                        />
                      </svg>{" "}
                      Edit
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-center lg:justify-between lg:gap-0 gap-[20px] flex-wrap w-full sm:px-4">
                  <div
                    className={`flex items-center gap-2 flex-grow ${
                      !isEditingAccessibility && " opacity-65"
                    }`}
                  >
                    <input
                      type="checkbox"
                      name="0"
                      id="los"
                      className={`custom-checkbox ${
                        !isEditingAccessibility && " border-neutral-300"
                      }`}
                      onChange={handleChangeCheckbox}
                      checked={hasAccessTo.some((item) => item === 0)}
                      disabled={!isEditingAccessibility}
                    />
                    <label
                      htmlFor="los"
                      className={`text-n700 sm:text-[17px] text-[14px] ${
                        isEditingAccessibility
                          ? "cursor-pointer"
                          : "cursor-default"
                      }`}
                    >
                      Line Of Sight{" "}
                    </label>
                  </div>
                  <div
                    className={`flex items-center gap-2 flex-grow ${
                      !isEditingAccessibility && " opacity-65"
                    }`}
                  >
                    <input
                      type="checkbox"
                      name="1"
                      id="mod"
                      className={`custom-checkbox ${
                        !isEditingAccessibility && " border-neutral-300"
                      }`}
                      onChange={handleChangeCheckbox}
                      checked={hasAccessTo.some((item) => item === 1)}
                      disabled={!isEditingAccessibility}
                    />
                    <label
                      htmlFor="mod"
                      className={`text-n700 sm:text-[17px] text-[14px] ${
                        isEditingAccessibility
                          ? "cursor-pointer"
                          : "cursor-default"
                      }`}
                    >
                      Modernisation{" "}
                    </label>
                  </div>
                  <div
                    className={`flex items-center gap-2 flex-grow ${
                      !isEditingAccessibility && " opacity-65"
                    }`}
                  >
                    <input
                      type="checkbox"
                      name="2"
                      id="new-site"
                      className={`custom-checkbox ${
                        !isEditingAccessibility && " border-neutral-300"
                      }`}
                      onChange={handleChangeCheckbox}
                      checked={hasAccessTo.some((item) => item === 2)}
                      disabled={!isEditingAccessibility}
                    />
                    <label
                      htmlFor="new-site"
                      className={`text-n700 sm:text-[17px] text-[14px] ${
                        isEditingAccessibility
                          ? "cursor-pointer"
                          : "cursor-default"
                      }`}
                    >
                      New Site{" "}
                    </label>
                  </div>
                  <div
                    className={`flex items-center gap-2 flex-grow ${
                      !isEditingAccessibility && " opacity-65"
                    }`}
                  >
                    <input
                      type="checkbox"
                      name="3"
                      id="workorder"
                      className={`custom-checkbox ${
                        !isEditingAccessibility && " border-neutral-300"
                      }`}
                      onChange={handleChangeCheckbox}
                      checked={hasAccessTo.some((item) => item === 3)}
                      disabled={!isEditingAccessibility}
                    />
                    <label
                      htmlFor="workorder"
                      className={`text-n700 sm:text-[17px] text-[14px] ${
                        isEditingAccessibility
                          ? "cursor-pointer"
                          : "cursor-default"
                      }`}
                    >
                      Workorder{" "}
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end w-full ">
                {isEditingAccessibility && (
                  <div className="flex items-center gap-[6px]">
                    {" "}
                    <button
                      type="submit"
                      className="md:py-[8px] md:px-[30px] py-[6px] px-[21px] text-n600 rounded-[86px] font-semibold bg-n300 leading-[20px]"
                      onClick={handleCancelAccessibility}
                    >
                      cancel
                    </button>
                    <button
                      type="submit"
                      className=" md:py-[8px] md:px-[30px] py-[6px] px-[21px] text-white rounded-[86px] font-semibold bg-primary leading-[20px]"
                      onClick={(eo) => {
                        handleSaveAccessibilityEdit(
                          eo,
                          setIsLoadingAccessibility,
                          setIsEditingAccessibility,
                          User!.id,
                          hasAccessTo.filter(
                            (id) => !User?.has_access_to.includes(id)
                          ),
                          User!.has_access_to.filter(
                            (id) => !hasAccessTo.includes(id)
                          ),
                          fetchUser
                        );
                      }}
                    >
                      {isLoadingAccessibility ? (
                        <ThreeDots color="#fff" width="50" height="20" />
                      ) : (
                        "confirme"
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[20px] border-n400 border-[1px] p-[21px] w-full flex items-start flex-col gap-[23px]">
              <h3 className="text-n800 md:text-[17px] text-[15px] leading-[25.5px] font-medium">
                Account control
              </h3>
              <div className="flex flex-col w-full gap-[10px]">
                <div
                  className={`w-full rounded-[15px] border-[2px] border-n300 px-5 py-3 flex flex-col items-start gap-[10px] cursor-pointer hover:shadow-lg ${
                    User?.is_active
                      ? "hover:shadow-gray-400"
                      : "hover:shadow-green-200"
                  }  transition-all duration-300`}
                  onClick={() => {
                    User?.is_active
                      ? handleOpenDialog(deactivatePopupRef)
                      : handle_active_or_deactivate_user(
                          "active",
                          `${User?.id}`,
                          fetchUser,
                          (message, options) =>
                            enqueueSnackbar(message, { ...options })
                        );
                  }}
                >
                  <h6 className="text-n800 md:text-[16px] text-[14px] leading-[25px] font-medium">
                    {User?.is_active
                      ? "Deactivate Account"
                      : "Activate Account"}
                  </h6>
                  <p className="text-n600 text-[14px] leading-[21px]">
                    {User?.is_active
                      ? `Deactivating a user account is temporary, meaning the user's
                    profile will be hidden from the platform until it's
                    reactivated by the admin through the Account Management
                    section`
                      : `This account is already deactivated, click to activate it again`}
                  </p>
                </div>
                <div
                  className="w-full rounded-[15px] border-[2px] border-n300 px-5 py-3 flex flex-col items-start gap-[10px] cursor-pointer hover:shadow-lg hover:shadow-red-200 transition-all duration-300"
                  onClick={() => {
                    handleOpenDialog(deletePopupRef);
                  }}
                >
                  <h6 className="text-n800 md:text-[16px] text-[14px] leading-[25px] font-medium">
                    Delete Account
                  </h6>
                  <p className="text-n600 text-[14px] leading-[21px]">
                    Deleting a user account is permanent. If you delete the
                    account, all related data will be permanently removed. If
                    you simply want to pause the user's activity, you can
                    temporarily deactivate the account instead
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <CustomDeletePopup
        page="delete-user"
        ref={deletePopupRef}
        sentence="delete this user"
        itemId={User?.id}
      />
      <CustomDeletePopup
        page="deactivate-user"
        ref={deactivatePopupRef}
        sentence="deactivate this user"
        itemId={User?.id}
        fecthFunc={fetchUser}
      />
    </div>
  );
};

export default EditUsers;
