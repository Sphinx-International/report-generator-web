import Header from "../components/Header";
import SideBar from "../components/SideBar";
// import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/CustomDatePicker.css";
import { useState } from "react";
import Profile from "../components/account/Profile";
import EmailSettings from "../components/account/EmailSettings";
import PasswordSettings from "../components/account/PasswordSettings";

const accountNavigation: string[] = [
  "My profile",
  "Email settings",
  "Password",
];

const Account = () => {
  const [slectedNav, setSlectedNav] = useState<string>("My profile");
  // const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  return (
    <div className="w-full flex h-[100vh]">
      <SideBar />
      <div className="lg:pl-[26px] md:pt-[32px] pt-[20px] lg:pr-[30px] sm:px-[30px] px-[15px] pb-[20px] flex flex-col gap-[26px] w-full md:h-[100vh] overflow-y-auto">
        <Header pageSentence="" searchBar={false} />
        <div className="flex flex-col items-start gap-[20px] w-full">
          <h2 className="text-[21px] leading-[32px] text-n700 font-semibold">
            Account Settings
          </h2>
          <div className="flex flex-col sm:flex-row w-full border-[1px] border-n400 rounded-[30px]">
            <div className="flex flex-row flex-wrap sm:flex-col items-start gap-[16px] sm:px-[22px] px-[13px] py-[46px] border-b-n400 border-b-[1px] sm:border-r-n400 sm:border-r-[1px]">
              {accountNavigation.map((nav, index) => {
                return (
                  <span
                    className={`flex items-center justify-start gap-[12px] text-[13px] sm:text-[15px] leading-[22.5px] text-nowrap font-medium cursor-pointer ${
                      slectedNav === nav
                        ? "text-primary bg-sec"
                        : "text-n600 hover:bg-slate-50"
                    }  rounded-[20px] px-[17px] py-[9px] `}
                    key={index}
                    onClick={() => {
                      setSlectedNav(nav);
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="21"
                      viewBox="0 0 20 21"
                      fill="none"
                    >
                      <path
                        d="M3.3335 18.0001V17.1667C3.3335 14.4053 5.57207 12.1667 8.3335 12.1667H11.6668C14.4282 12.1667 16.6668 14.4053 16.6668 17.1667V18.0001"
                        stroke={slectedNav === nav ? "#4A3AFF" : "#6F6C8F"}
                        strokeWidth="1.66667"
                        fillOpacity="round"
                      />
                      <path
                        d="M10.0003 9.66667C8.15938 9.66667 6.66699 8.17428 6.66699 6.33333C6.66699 4.49238 8.15938 3 10.0003 3C11.8412 3 13.3337 4.49238 13.3337 6.33333C13.3337 8.17428 11.8412 9.66667 10.0003 9.66667Z"
                        stroke={slectedNav === nav ? "#4A3AFF" : "#6F6C8F"}
                        strokeWidth="1.66667"
                        fillOpacity="round"
                      />
                    </svg>{" "}
                    {nav}
                  </span>
                );
              })}
            </div>

            <div className="py-[28px] px-[30px] flex flex-col gap-[28px] w-full">
              {slectedNav === "My profile" ? (
                <Profile />
              ) : slectedNav === "Email settings" ? (
                <EmailSettings />
              ) : slectedNav === "Password" ? (
                <PasswordSettings />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
