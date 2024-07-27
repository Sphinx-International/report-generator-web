import SideBar from "./SideBar";
import Header from "./Header";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/CustomDatePicker.css";
import { useState } from "react";
import { ThreeDots } from "react-loader-spinner";

const EditUsers = () => {
  const handleCancelGeneral = () => {
    setIsEditingGeneral(false);
    // setFirstName(user.first_name);
    // setLastName(user.last_name);
  };
  const handleCancelRole = () => {
    setIsEditingRole(false);
    // setFirstName(user.first_name);
    // setLastName(user.last_name);
  };

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isEditingGeneral, setIsEditingGeneral] = useState<boolean>(false);
  const [isEditingRole, setIsEditingRole] = useState<boolean>(false);
  const [isLoadingGeneral, setIsLoadingGeneral] = useState<boolean>(false);
  const [isLoadingRole, setIsLoadingRole] = useState<boolean>(false);

  return (
    <div className="w-full flex h-[100vh]">
      <SideBar />
      <div className="lg:pl-[26px] md:pt-[32px] pt-[20px] lg:pr-[30px] sm:px-[30px] px-[15px] pb-[20px] flex flex-col gap-[26px] w-full md:h-[100vh] overflow-y-auto">
        <Header pageSentence="User profile" searchBar={false} />

        <div className="w-full flex flex-col gap-[12px]">
          <div className="rounded-[20px] border-n400 border-[1px] py-[20px] px-[21px]">
            <div className="flex items-center gap-[34px]">
              <img src="/avatar1.png" alt="avatar" className="w-[100px]" />
              <div className="flex items-start flex-col gap-[6px]">
                <h2 className="text-[18px] leading-[28.08px] text-n800 font-medium">
                  Mariem Boukennouche
                </h2>
                <span className="text-[14px] text-550">
                  mboukennouche@gmail.com
                </span>
              </div>
            </div>
          </div>
          <div className="rounded-[20px] border-n400 border-[1px] p-[21px] w-full flex items-start flex-col gap-[23px]">
            <div className="w-full flex items-center justify-between">
              <h3 className="text-n800 text-[17px] leading-[25.5px] font-medium">
                Personal information
              </h3>

              {!isEditingGeneral && (
                <button
                  className="rounded-[20px] text-primary border-[1px] border-primary flex items-center gap-[3px] px-[17px] py-[6px] leading text-[13px] font-medium"
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
            <form className="flex flex-col gap-[40px]">
              <div className="flex flex-wrap gap-x-[70px] gap-y-[20px] w-full">
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
                    value={"Mariem"}
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
                    value={"Boukennouche"}
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
                    value={"mbooukennouche@gmail.com"}
                    className={`rounded-[46px] h-[50px] px-[19px] w-full ${
                      isEditingGeneral ? "shadow-lg" : ""
                    }`}
                    disabled={isEditingGeneral ? false : true}
                  />
                </div>
              </div>
              {isEditingGeneral && (
                <div className="w-full flex items-center justify-between">
                  <span className="ml-[12px] text-[14px] text-[#DB2C2C] leading-[22px]">
                    {"err"}
                  </span>

                  <div className="flex items-center gap-[6px]">
                    {" "}
                    <button
                      type="submit"
                      className="py-[8px] px-[30px] text-n600 rounded-[86px] font-semibold bg-n300 leading-[20px]"
                      onClick={handleCancelGeneral}
                    >
                      cancel
                    </button>
                    <button
                      type="submit"
                      className=" py-[8px] px-[30px] text-white rounded-[86px] font-semibold bg-primary leading-[20px]"
                      onClick={(eo) => {
                        // handleSaveEdit(eo);
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
              <h3 className="text-n800 text-[17px] leading-[25.5px] font-medium">
                Personal information
              </h3>

              {!isEditingRole && (
                <button
                  className="rounded-[20px] text-primary border-[1px] border-primary flex items-center gap-[3px] px-[17px] py-[6px] leading text-[13px] font-medium"
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
            <div className="flex flex-col items-start gap-[9px] w-[45%]">
              <label
                htmlFor="role"
                className="text-600 text-[15px] leading-[20px] font-medium text-n600"
              >
                Role
              </label>
              <input
                type="text"
                name="role"
                value={"Engineer"}
                className={`rounded-[46px] h-[50px] px-[19px] w-full ${
                  isEditingRole ? "shadow-lg" : ""
                }`}
                disabled={isEditingRole ? false : true}
              />
            </div>
            <div className="flex justify-end w-full ">
              {isEditingRole && (
                <div className="flex items-center gap-[6px]">
                  {" "}
                  <button
                    type="submit"
                    className="py-[8px] px-[30px] text-n600 rounded-[86px] font-semibold bg-n300 leading-[20px]"
                    onClick={handleCancelRole}
                  >
                    cancel
                  </button>
                  <button
                    type="submit"
                    className=" py-[8px] px-[30px] text-white rounded-[86px] font-semibold bg-primary leading-[20px]"
                    onClick={(eo) => {
                      //handleSaveEdit(eo);
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditUsers;
