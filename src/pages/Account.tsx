import Header from "../components/Header";
import SideBar from "../components/SideBar";
// import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/CustomDatePicker.css";
import { useState } from "react";
import { User } from "../assets/types/User";
import { ThreeDots } from "react-loader-spinner";


const accountNavigation: string[] = [
  "My profile",
  "Email settings",
  "Password",
];

const Account = () => {
  const [slectedNav, setSlectedNav] = useState<string>("My profile");
  // const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const user: User = JSON.parse(localStorage.getItem("user")!);

  const [err, setErr] = useState<string>("");

  const [firstName, setFirstName] = useState<string>(user.first_name);
  const [lastName, setLastName] = useState<string>(user.last_name);
  const handleCancel = () => {
    setIsEditing(false);
    setFirstName(user.first_name);
    setLastName(user.last_name);
  };


 const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      console.error("No token found");
      return;
    }
    setIsLoading(true);
    setErr("")
    try {
      const response = await fetch(`https://auto-reporting-server.sphinx-international.online//account/update-account/generals`, {
        // Added a leading slash
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization:`Token ${token}`,
        },
        body: JSON.stringify({
          account_id: user.email,
          new_data: { first_name: firstName, last_name: lastName },
        }),
      });

      if (response) {
        switch (response.status) {
          case 200:
            setIsEditing(false);
            localStorage.setItem(
              "user",
              JSON.stringify({
                ...user,
                first_name: firstName,
                last_name: lastName,
              })
            );
            break;

          case 400:
            setErr("data can not be empty");
            break;

            default:
              console.error("Unexpected error: ");
              break;
        }
      } 
    } catch (err) {
      console.error("Error submitting form", err);
    } finally {
      setIsLoading(false);
      /* if (props.fetchUsers) {
        props.fetchUsers()
      }*/
    }
  };
  

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
                  <div className="flex items-center justify-between w-full">
                    <h3 className="sm:text-[20px] text-[17px] text-n800 font-semibold leading-[30px]">
                      My profile
                    </h3>
                    {!isEditing && (
                      <button
                        className="rounded-[20px] text-primary border-[1px] border-primary flex items-center gap-[3px] sm:px-[17px] sm:py-[6px] px-[14px] py-[3px] leading text-[13px] font-medium"
                        onClick={() => {
                          setIsEditing(true);
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

                  <form className="relative flex flex-col items-start gap-[33px] w-full">
                    <div className="flex items-center gap-[18px]">
                      <img
                        src="/avatar1.png"
                        alt="avatar"
                        className="sm:w-[85px] w-[60px]"
                      />
                      <div className="flex flex-col items-start gap-[6px]">
                        <h3 className="leading-[28px] text-[18px] font-medium text-n800">
                          {user?.first_name}
                          {user?.last_name}
                        </h3>
                        <span className="leading-[21px] text-550 text-[14px]">
                          {user?.role === 0
                            ? "Admin"
                            : user?.role === 1
                            ? "Coordinator"
                            : "Engineer"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center flex-wrap lg:gap-[37px] gap-[20px] w-full">
                      <div className="flex flex-col items-start gap-[8px] sm:w-[45%] w-full">
                        <label
                          htmlFor="firstName"
                          className="pl-[7px] leading-[20px] font-medium "
                        >
                          First name
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          disabled={isEditing ? false : true}
                          value={firstName}
                          className={`w-full rounded-[46px] h-[50px] px-[20px] text-n600 ${
                            isEditing ? "shadow-md" : ""
                          }`}
                          onChange={(eo) => {
                            setFirstName(eo.target.value);
                          }}
                        />
                      </div>
                      <div className="flex flex-col items-start gap-[8px] sm:w-[45%] w-full">
                        <label
                          htmlFor="lastName"
                          className="pl-[7px] leading-[20px] font-medium text-n700"
                        >
                          Last name
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          disabled={isEditing ? false : true}
                          value={lastName}
                          className={`w-full rounded-[46px] h-[50px] px-[20px] text-n600 ${
                            isEditing ? "shadow-md" : ""
                          }`}
                          onChange={(eo) => {
                            setLastName(eo.target.value);
                          }}
                        />
                      </div>
                      {/*
                      
                      
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
                          disabled={isEditing ? false : true}
                          placeholderText="Select a birthdate"
                          className={`px-[18px] w-full sm:h-[48px] h-[44px] rounded-[46px] text-n500 sm:text-[16px] text-[14px] ${
                            isEditing ? "shadow-md" : "shadow-none"
                          }`}
                          id="birthdate"
                          calendarClassName="custom-datepicker"
                        />
                      </div>  */}
                    </div>
                    {isEditing && (
                      <div className="w-full flex items-center justify-between">
  
                <span className="ml-[12px] text-[14px] text-[#DB2C2C] leading-[22px]">
                  {err}
                </span>

                        <div className="flex items-center gap-[6px]">
                          {" "}
                          <button
                            type="submit"
                            className="py-[8px] px-[30px] text-n600 rounded-[86px] font-semibold bg-n300 leading-[20px]"
                            onClick={handleCancel}
                          >
                            cancel
                          </button>
                          <button
                            type="submit"
                            className=" py-[8px] px-[30px] text-white rounded-[86px] font-semibold bg-primary leading-[20px]"
                            onClick={(eo) => {
                              handleSaveEdit(eo);
                            }}
                          >
                            {isLoading ? (
                              <ThreeDots color="#fff" width="50" height="20" />
                            ) : (
                              "confirme"
                            )}
                          </button>
                        </div>

                      </div>
                    )}
                  </form>
                </>
              ) : slectedNav === "Email settings" ? (
                <>
                  <h3 className="sm:text-[20px] text-[17px] text-n800 font-semibold leading-[30px]">
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
                    <span className="sm:text-[18px] text-[15px] text-n700 leading-[27px]">
                      {user?.email}
                    </span>
                  </div>
                </>
              ) : slectedNav === "Password" ? (
                <>
                  <h3 className="sm:text-[20px] text-[17px] text-n800 font-semibold leading-[30px]">
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
