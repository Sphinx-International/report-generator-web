import { useState } from "react";
import { User } from "../../assets/types/User";
import { ThreeDots } from "react-loader-spinner";

const baseUrl = import.meta.env.VITE_BASE_URL;


const Profile = () => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [err, setErr] = useState<string>("");

  const user: User = JSON.parse(localStorage.getItem("user")!);

  
  const [firstName, setFirstName] = useState<string>(user.first_name);
  const [lastName, setLastName] = useState<string>(user.last_name);

  const handleCancel = () => {
    setIsEditing(false);
    setFirstName(user.first_name);
    setLastName(user.last_name);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return;
    }
    setIsLoading(true);
    setErr("");
    try {
      const response = await fetch(
        `${baseUrl}/account/update-account/generals`,
        {
          // Added a leading slash
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({
            account_id: user.email,
            new_data: { first_name: firstName, last_name: lastName },
          }),
        }
      );

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
                strokeWidth="1.66667"
                fillOpacity="round"
                strokeLinejoin="round"
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
  );
};

export default Profile;
