import { useState, forwardRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/CustomDatePicker.css";

const UserPopUp = forwardRef<HTMLDialogElement>((_, ref) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  return (
    <dialog
      ref={ref}
      id="User-popup"
      className={`hidden fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] px-[40px] pb-[35px] pt-[40px]  flex-col items-start gap-[20px] rounded-[34px] w-[70vw]`}
    >

      <div className="flex flex-col items-start gap-[10px]">
        <label
          htmlFor="profilePic"
          className="text-n700 text-[17px] leading-[20px] font-medium ml-[5px]"
        >
          Profile picture
        </label>
        <div className="relative w-[90px] h-[90px] rounded-[50%] bg-[#E7E6FF]">
          <input
            type="file"
            name="profilePic"
            id="profilePic"
            className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
          />
          <svg
            className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] pointer-events-none z-0"
            xmlns="http://www.w3.org/2000/svg"
            width="25"
            height="25"
            viewBox="0 0 25 25"
            fill="none"
          >
            <path
              d="M4.16669 17.7084V19.7917C4.16669 20.3443 4.38618 20.8742 4.77688 21.2649C5.16758 21.6556 5.69749 21.8751 6.25002 21.8751H18.75C19.3026 21.8751 19.8325 21.6556 20.2232 21.2649C20.6139 20.8742 20.8334 20.3443 20.8334 19.7917V17.7084M7.29169 9.37508L12.5 4.16675M12.5 4.16675L17.7084 9.37508M12.5 4.16675V16.6667"
              stroke="#6F6C8F"
              stroke-width="2.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
      </div>
      <form
        action=""
        method="post"
        className="flex flex-col items-end gap-[30px] w-full"
      >
        <div className="flex flex-col gap-[28px] w-full">
          <div className="flex items-center gap-[22px] w-full">
            <div className="flex flex-col items-start gap-[8px] w-[50%]">
              <label
                htmlFor="firstName"
                className="text-n700 text-[17px] leading-[20px] font-medium pl-[9px]"
              >
                First name
              </label>
              <input
                placeholder="Enter first name"
                type="text"
                name="firstName"
                id="firstName"
                className="px-[18px] w-full h-[48px] rounded-[46px] shadow-lg"
              />
            </div>
            <div className="flex flex-col items-start gap-[8px] w-[50%]">
              <label
                htmlFor="lastName"
                className="text-n700 text-[17px] leading-[20px] font-medium pl-[9px]"
              >
                Last name
              </label>
              <input
                placeholder="Enter last name"
                type="text"
                name="lastName"
                id="lastName"
                className="px-[18px] w-full h-[48px] rounded-[46px] shadow-lg"
              />
            </div>
          </div>
          <div className="flex items-center gap-[22px] w-full">
            <div className="flex flex-col items-start gap-[8px] w-[50%]">
              <label
                htmlFor="email"
                className="text-n700 text-[17px] leading-[20px] font-medium pl-[9px]"
              >
                Email
              </label>
              <input
                placeholder="Enter email"
                type="email"
                name="email"
                id="email"
                className="px-[18px] w-full h-[48px] rounded-[46px] shadow-lg"
              />
            </div>
            <div className="flex flex-col items-start gap-[8px] w-[50%]">
              <label
                htmlFor="birthdate"
                className="text-n700 text-[17px] leading-[20px] font-medium pl-[9px]"
              >
                Birthdate
              </label>
              <DatePicker
                selected={selectedDate}
                onChange={(date: Date | null) => setSelectedDate(date)}
                placeholderText="Select a birthdate"
                className="px-[18px] w-full h-[48px] rounded-[46px] shadow-lg text-n500"
                id="birthdate"
                calendarClassName="custom-datepicker"
              />
            </div>
          </div>
          <div className="flex items-center gap-[22px] w-full">
            <div className="flex flex-col items-start gap-[8px] w-[50%]">
              <label
                htmlFor="role"
                className="text-n700 text-[17px] leading-[20px] font-medium pl-[9px]"
              >
                Role
              </label>
              <input
                placeholder="Select a role"
                type="text"
                name="role"
                id="role"
                className="px-[18px] w-full h-[48px] rounded-[46px] shadow-lg"
              />
            </div>
            <div className="flex flex-col items-start gap-[8px] w-[50%]">
              <label
                htmlFor="password"
                className="text-n700 text-[17px] leading-[20px] font-medium pl-[9px]"
              >
                Password
              </label>
              <div className="relative w-full">
                <input
                  placeholder="Click to generate a password"
                  type="text"
                  name="password"
                  id="password"
                  className="px-[18px] w-full h-[48px] rounded-[46px] shadow-lg"
                />
                <svg
                  className="absolute right-[15px] top-[50%] translate-y-[-50%] cursor-pointer hover:scale-105"
                  xmlns="http://www.w3.org/2000/svg"
                  width="25"
                  height="25"
                  viewBox="0 0 25 25"
                  fill="none"
                >
                  <path
                    d="M13.1562 2.08325C18.9167 2.08325 23.5833 6.77075 23.5833 12.4999C23.5833 18.2291 18.9167 22.9166 13.1562 22.9166C9.5 22.9166 6.30208 21.0208 4.4375 18.1562L6.08333 16.8541C7.55208 19.2395 10.1667 20.8333 13.1667 20.8333C15.3768 20.8333 17.4964 19.9553 19.0592 18.3925C20.622 16.8297 21.5 14.7101 21.5 12.4999C21.5 10.2898 20.622 8.17017 19.0592 6.60736C17.4964 5.04456 15.3768 4.16659 13.1667 4.16659C8.91667 4.16659 5.41667 7.35409 4.90625 11.4583H7.78125L3.88542 15.3437L0 11.4583H2.80208C3.32292 6.19784 7.76042 2.08325 13.1562 2.08325ZM16.2396 10.6666C16.7604 10.677 17.1875 11.0937 17.1875 11.6249V16.427C17.1875 16.9478 16.7604 17.3853 16.2292 17.3853H10.4687C9.9375 17.3853 9.51042 16.9478 9.51042 16.427V11.6249C9.51042 11.0937 9.9375 10.677 10.4583 10.6666V9.6145C10.4583 8.02075 11.7604 6.72909 13.3437 6.72909C14.9375 6.72909 16.2396 8.02075 16.2396 9.6145V10.6666ZM13.3437 8.18742C12.5625 8.18742 11.9167 8.82284 11.9167 9.6145V10.6666H14.7812V9.6145C14.7812 8.82284 14.1354 8.18742 13.3437 8.18742Z"
                    fill="#A0A3BD"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-[5px]">
          <button className="bg-primary rounded-[86px] px-[26.5px] py-[8.5px] font-semibold text-[14px] leading-[20px] text-white">
            Add user
          </button>
          <button className="bg-n300 rounded-[86px] px-[26.5px] py-[8.5px] font-semibold text-[14px] leading-[20px] text-n600 border-[1px] border-n400"
                  onClick={(eo) => {
                    eo.preventDefault()
                    if (ref && typeof ref !== "function" && ref.current) {
                      ref.current.close();
                    }
                  }}
          >
            Cancel
          </button>
        </div>
      </form>
    </dialog>
  );
});

export default UserPopUp;
