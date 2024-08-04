import SideBar from "../components/SideBar";
import Header from "../components/Header";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/CustomDatePicker.css";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ThreeDots, RotatingLines } from "react-loader-spinner";
import { User } from "../assets/types/User";

const EditUsers = () => {
  const { id } = useParams();

  const handleCancelGeneral = () => {
    setIsEditingGeneral(false);
    setFirstName(User?.first_name);
    setLastName(User?.last_name);
    setEmail(User?.email);
  };
  const handleCancelRole = () => {
    setIsEditingRole(false);
    setSelectedOption(User?.role === 1 ? "Coordinator" : "Engineer");
  };

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isEditingGeneral, setIsEditingGeneral] = useState<boolean>(false);
  const [isEditingRole, setIsEditingRole] = useState<boolean>(false);
  const [isPgaeLoading, setIsPageLoading] = useState<boolean>(true);

  const [isLoadingGeneral, setIsLoadingGeneral] = useState<boolean>(false);
  const [isLoadingRole, setIsLoadingRole] = useState<boolean>(false);
  const [User, setUser] = useState<User>();

  const [firstName, setFirstName] = useState<string | undefined>("");
  const [lastName, setLastName] = useState<string | undefined>("");
  const [email, setEmail] = useState<string | undefined>("");

  const [selectedOption, setSelectedOption] = useState<string | undefined>("");

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [errGeneral, setErrGeneral] = useState<string>("");
  const [errRole, setErrRole] = useState<string>("");

  const toggleDropdown = () => setIsOpen(!isOpen);
  const handleOptionClick = (option: string) => {
    setSelectedOption(option);
    setIsOpen(false);
  };

  const fetchUser = async () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      console.error("No token found");
      return;
    }

    const url = `/account/get-account/${id}`;
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
      setFirstName(data.first_name);
      setLastName(data.last_name);
      setEmail(data.email);
      setSelectedOption(data.role === 1 ? "Coordinator" : "Engineer");
      console.log(data);
    } catch (err) {
      console.error("Error: ", err);
    } finally {
      setIsPageLoading(false);
    }
  };

  const handleSaveGeneralEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      console.error("No token found");
      return;
    }
    setIsLoadingGeneral(true);
    setErrGeneral("");
    try {
      const response = await fetch("/account/update-account/generals", {
        // Added a leading slash
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          account_id: User!.email,
          new_data: { first_name: firstName, last_name: lastName },
        }),
      });

      if (response) {
        switch (response.status) {
          case 200:
            setIsEditingGeneral(false);
            fetchUser();
            break;

          case 400:
            setErrGeneral("data can not be empty");
            break;

          default:
            console.error("Unexpected error: ");
            break;
        }
      }
    } catch (err) {
      console.error("Error submitting form", err);
    } finally {
      setIsLoadingGeneral(false);
      /* if (props.fetchUsers) {
        props.fetchUsers()
      }*/
    }
  };

  const handleSaveRolelEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      console.error("No token found");
      return;
    }
    setIsLoadingRole(true);
    setErrRole("");
    try {
      const response = await fetch("/account/update-account/role", {
        // Added a leading slash
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          account_id: User!.email,
          role_id: selectedOption === "Coordinator" ? 1 : 2,
        }),
      });

      if (response) {
        switch (response.status) {
          case 200:
            setIsEditingRole(false);
            fetchUser();
            break;

          case 400:
            setErrRole("data can not be empty");
            break;

          default:
            console.error("Unexpected error: ");
            break;
        }
      }
    } catch (err) {
      console.error("Error submitting form", err);
    } finally {
      setIsLoadingRole(false);
      /* if (props.fetchUsers) {
        props.fetchUsers()
      }*/
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
        {isPgaeLoading ? (
          <div className="flex w-full items-center justify-center py-[60px]">
            {" "}
            <RotatingLines strokeWidth="4" strokeColor="#4A3AFF" width="60" />
          </div>
        ) : (
          <div className="w-full flex flex-col gap-[12px]">
            <div className="rounded-[20px] border-n400 border-[1px] py-[20px] px-[21px]">
              <div className="flex items-center md:gap-[34px] gap-[15px] ">
                <img src="/avatar2.jpg" alt="avatar" className="md:w-[100px] rounded-[50%] w-[70px]" />
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
                        stroke-width="1.66667"
                        stroke-linecap="round"
                        stroke-linejoin="round"
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
                          handleSaveGeneralEdit(eo);
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
              <div className="w-full flex items-center justify-between">
                <h3 className="text-n800 md:text-[17px] text-[15px] leading-[25.5px] font-medium">
                  Personal information
                </h3>

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
                        stroke-width="1.66667"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>{" "}
                    Edit
                  </button>
                )}
              </div>
              <div className="flex flex-col items-start gap-[9px] md:w-[45%] w-[90%]">
                <label
                  htmlFor="role"
                  className="text-600 text-[15px] leading-[20px] font-medium text-n600"
                >
                  Role
                </label>
                <div className="relative w-full">
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
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        ></path>
                      </svg>
                    )}
                  </button>
                  {isOpen && (
                    <ul className="absolute w-full bg-white rounded-[30px] shadow-lg mt-2 z-10">
                      {["Engineer", "Coordinator"].map((option) => (
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
                  <div className="flex items-center w-full justify-between">
                    <span className="ml-[12px] text-[14px] text-[#DB2C2C] leading-[22px]">
                      {errRole}
                    </span>

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
                          handleSaveRolelEdit(eo);
                        }}
                      >
                        {isLoadingRole ? (
                          <ThreeDots color="#fff" width="50" height="20" />
                        ) : (
                          "confirme"
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditUsers;
