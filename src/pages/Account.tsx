import Header from "../components/Header";
import SideBar from "../components/SideBar";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/CustomDatePicker.css";
import { useState } from "react";

const accountNavigation: string[] = [
  "My profile",
  "Email settings",
  "Password",
];

const Account = () => {
  const [slectedNav, setSlectedNav] = useState<string>("My profile");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  return (
    <div className="w-full flex h-[100vh]">
      <SideBar />
      <div className="lg:pl-[26px] md:pt-[32px] pt-[20px] lg:pr-[30px] sm:px-[30px] px-[15px] pb-[20px] flex flex-col gap-[26px] w-full md:h-[100vh] overflow-y-auto">
        <Header pageSentence="" searchBar={false} />
        <div className="flex flex-col items-start gap-[20px] w-full">
          <h2 className="text-[21px] leading-[32px] text-n700 font-semibold">
            Account Settings
          </h2>
          <div className="flex w-full border-[1px] border-n400 rounded-[30px]">
            <div className="flex flex-col items-start gap-[16px] px-[22px] py-[46px] border-r-n400 border-r-[1px]">
              {accountNavigation.map((nav, index) => {
                return (
                  <span
                    className={`flex items-center justify-start gap-[12px] text-[15px] leading-[22.5px] text-nowrap font-medium cursor-pointer ${
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
                        stroke-width="1.66667"
                        stroke-linecap="round"
                      />
                      <path
                        d="M10.0003 9.66667C8.15938 9.66667 6.66699 8.17428 6.66699 6.33333C6.66699 4.49238 8.15938 3 10.0003 3C11.8412 3 13.3337 4.49238 13.3337 6.33333C13.3337 8.17428 11.8412 9.66667 10.0003 9.66667Z"
                        stroke={slectedNav === nav ? "#4A3AFF" : "#6F6C8F"}
                        stroke-width="1.66667"
                        stroke-linecap="round"
                      />
                    </svg>{" "}
                    {nav}
                  </span>
                );
              })}
            </div>
            <div className="py-[28px] px-[30px] flex flex-col gap-[28px] w-full">
              {slectedNav === "My profile" ? (
                <>
                  <h3 className="text-[20px] text-n800 font-semibold leading-[30px]">
                    My profile
                  </h3>
                  <form className="flex flex-col items-start gap-[33px] w-full">
                    <div className="flex items-center gap-[18px]">
                      <img
                        src="/avatar1.png"
                        alt="avatar"
                        className="w-[85px]"
                      />
                      <div className="flex flex-col items-start gap-[6px]">
                        <h3 className="leading-[28px] text-[18px] font-medium text-n800">
                          Mariem Boukennouche
                        </h3>
                        <span className="leading-[21px] text-550 text-[14px]">
                          Engineer
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center flex-wrap gap-[37px] w-full">
                      <div className="flex flex-col items-start gap-[8px] w-[45%]">
                        <label
                          htmlFor="firstName"
                          className="pl-[7px] leading-[20px] font-medium text-n700"
                        >
                          First name
                        </label>
                        <div className="relative w-full">
                          <input
                            type="text"
                            name="firstName"
                            className="w-full rounded-[46px] h-[50px] shadow-md"
                          />
                          <svg
                            className="absolute right-[15px] top-[50%] translate-y-[-50%]"
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                          >
                            <path
                              d="M12.4997 5.00007L14.9997 7.50007M10.833 16.6667H17.4997M4.16634 13.3334L3.33301 16.6667L6.66634 15.8334L16.3213 6.17841C16.6338 5.86586 16.8093 5.44201 16.8093 5.00007C16.8093 4.55813 16.6338 4.13429 16.3213 3.82174L16.178 3.67841C15.8655 3.36596 15.4416 3.19043 14.9997 3.19043C14.5577 3.19043 14.1339 3.36596 13.8213 3.67841L4.16634 13.3334Z"
                              stroke="#6F6C8F"
                              stroke-width="1.66667"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="flex flex-col items-start gap-[8px] w-[45%]">
                        <label
                          htmlFor="lastName"
                          className="pl-[7px] leading-[20px] font-medium text-n700"
                        >
                          Last name
                        </label>
                        <div className="relative w-full">
                          <input
                            type="text"
                            name="lastName"
                            className="w-full rounded-[46px] h-[50px] shadow-md"
                          />
                          <svg
                            className="absolute right-[15px] top-[50%] translate-y-[-50%]"
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                          >
                            <path
                              d="M12.4997 5.00007L14.9997 7.50007M10.833 16.6667H17.4997M4.16634 13.3334L3.33301 16.6667L6.66634 15.8334L16.3213 6.17841C16.6338 5.86586 16.8093 5.44201 16.8093 5.00007C16.8093 4.55813 16.6338 4.13429 16.3213 3.82174L16.178 3.67841C15.8655 3.36596 15.4416 3.19043 14.9997 3.19043C14.5577 3.19043 14.1339 3.36596 13.8213 3.67841L4.16634 13.3334Z"
                              stroke="#6F6C8F"
                              stroke-width="1.66667"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="flex flex-col items-start gap-[8px] w-[45%]">
                        <label
                          htmlFor="birthdate"
                          className="pl-[7px] leading-[20px] font-medium text-n700"
                        >
                          Birthdate
                        </label>
                        <DatePicker
                          selected={selectedDate}
                          onChange={(date: Date | null) =>
                            setSelectedDate(date)
                          }
                          placeholderText="Select a birthdate"
                          className="px-[18px] w-full sm:h-[48px] h-[44px] rounded-[46px] shadow-lg text-n500 sm:text-[16px] text-[14px]"
                          id="birthdate"
                          calendarClassName="custom-datepicker"
                        />
                      </div>
                    </div>
                  </form>
                </>
              ) : slectedNav === "Email settings" ? (
                <>
                  <h3 className="text-[20px] text-n800 font-semibold leading-[30px]">
                    My email address
                  </h3>
                  <div className="flex items-center gap-[14px]">
                    <span className="rounded-[50%] bg-n300 p-[11px]">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="23"
                        height="23"
                        viewBox="0 0 23 23"
                        fill="none"
                      >
                        <path
                          d="M16.1471 3.50879H6.78602C3.97769 3.50879 2.10547 4.91296 2.10547 8.18934V14.7421C2.10547 18.0185 3.97769 19.4227 6.78602 19.4227H16.1471C18.9555 19.4227 20.8277 18.0185 20.8277 14.7421V8.18934C20.8277 4.91296 18.9555 3.50879 16.1471 3.50879ZM16.5871 9.20971L13.6571 11.55C13.0392 12.0461 12.2529 12.2895 11.4666 12.2895C10.6802 12.2895 9.88455 12.0461 9.27608 11.55L6.34605 9.20971C6.0465 8.96632 5.99969 8.51698 6.23372 8.21743C6.47711 7.91787 6.91708 7.86171 7.21664 8.10509L10.1467 10.4454C10.8581 11.0164 12.0657 11.0164 12.7771 10.4454L15.7072 8.10509C16.0067 7.86171 16.4561 7.90851 16.6901 8.21743C16.9335 8.51698 16.8867 8.96632 16.5871 9.20971Z"
                          fill="#4A3AFF"
                        />
                      </svg>
                    </span>
                    <span className="text-[18px] text-n700 leading-[27px]">
                      mboukennouche@gmail.com
                    </span>
                  </div>
                </>
              ) : slectedNav === "Password" ? (
                <>
                  <h3 className="text-[20px] text-n800 font-semibold leading-[30px]">
                    Change password
                  </h3>
                  <span className="cursor-pointer text-[15px] leading-[22.5px] text-primary">
                    {" "}
                    Change your password
                  </span>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
