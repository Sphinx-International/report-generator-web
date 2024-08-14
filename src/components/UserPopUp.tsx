import { useState, forwardRef, MouseEvent } from "react";
// import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/CustomDatePicker.css";
import generatePassword from "../func/generatePassword";
import { ThreeDots } from "react-loader-spinner";
import handleChange from "../func/handleChangeFormsInput";
const baseUrl = import.meta.env.VITE_BASE_URL;

interface Userprops {
  fetchUsers?: () => void;
}
const UserPopUp = forwardRef<HTMLDialogElement, Userprops>((props, ref) => {
  // const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  // const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>("Select a role");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [visibleEmailErr, setVisibleEmailErr] = useState<boolean>(false);
  const [EmailErr, setEmailErr] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(true);

  type User = {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    role: null | 0 | 1 | 2;
  };

  const [formData, setFormData] = useState<User>({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role: null,
  });

  const closeDialog = (eo: MouseEvent<HTMLButtonElement> | React.FormEvent) => {
    eo.preventDefault();
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      role: null,
    });
    setEmailErr("");
    setSelectedOption("Select a role");
    if (ref && typeof ref !== "function" && ref.current) {
      ref.current.close();
      ref.current.style.display = "none";
    }
  };

  /* const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };  */
  const toggleDropdown = () => setIsOpen(!isOpen);
  const handleOptionClick = (option: string) => {
    setSelectedOption(option);
    setIsOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`http://${baseUrl}/account/create-account`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response) {
        const data = await response.json();
        console.log("Form submitted successfully", data);
        switch (response.status) {
          case 201:
            props.fetchUsers!();
            closeDialog(e);
            break;
          case 409:
            setVisibleEmailErr(true);
            setEmailErr("account with this email already exists.");
            break;
          case 400:
            setVisibleEmailErr(true);
            setEmailErr("Your are missing information, verify your inputs");
            break;
          case 403:
            setVisibleEmailErr(true);
            setEmailErr("only admin can create accounts");
            break;

          default:
            console.log("error");
            break;
        }
        /* setEmail("");
        setPassword(""); */
      }
    } catch (err) {
      console.error("Error submitting form", err);
    } finally {
      if (props.fetchUsers) {
        setIsLoading(false);
      }
    }
  };

  return (
    <dialog
      ref={ref}
      id="User-popup"
      className={`hidden fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] sm:px-[40px] px-[20px] sm:pb-[35px] pt-[40px]  flex-col items-start gap-[20px] rounded-[34px] sm:w-[70vw] sm:h-fit w-[88vw] h-[80vh]`}
    >
      {/*   <div className="flex flex-col items-start gap-[10px]">
        <label
          htmlFor="profilePic"
          className="text-n700 sm:text-[17px] text-[13px] leading-[20px] font-medium ml-[5px]"
        >
          Profile picture
        </label>
        <div className="relative w-[53px] h-[53px] sm:w-[90px] sm:h-[90px] rounded-[50%] bg-[#E7E6FF]">
          <input
            name="profilePic"
            id="profilePic"
            accept="image/*"
            className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
            onChange={handleImageChange}
          />
          {selectedImage ? (
            <img
              src={selectedImage}
              alt="Selected"
              className="absolute inset-0 w-full h-full object-cover rounded-[50%] z-0"
            />
          ) : (
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
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
      </div>  */}

      <form
        action=""
        method="post"
        className="flex flex-col items-end gap-[30px] w-full"
      >
        <div className="flex flex-col gap-[28px] w-full">
          <div className="flex items-center flew-wrap gap-[22px] w-full sm:flex-row flex-col">
            <div className="flex flex-col items-start gap-[8px] sm:w-[50%] w-[100%]">
              <label
                htmlFor="first_name"
                className="text-n700 sm:text-[17px] text-[13px] leading-[20px] font-medium pl-[9px]"
              >
                First name
              </label>
              <input
                value={formData.first_name}
                placeholder="Enter first name"
                type="text"
                name="first_name"
                id="first_name"
                className="px-[18px] w-full sm:h-[48px] sm:text-[16px] text-[14px] h-[44px] rounded-[46px] shadow-lg"
                onChange={(e) => {
                  handleChange(e, setFormData);
                }}
              />
            </div>
            <div className="flex flex-col items-start gap-[8px] sm:w-[50%] w-[100%]">
              <label
                htmlFor="last_name"
                className="text-n700 sm:text-[17px] text-[13px] leading-[20px] font-medium pl-[9px]"
              >
                Last name
              </label>
              <input
                value={formData.last_name}
                placeholder="Enter last name"
                type="text"
                name="last_name"
                id="last_name"
                className="px-[18px] w-full sm:h-[48px] h-[44px] rounded-[46px] shadow-lg sm:text-[16px] text-[14px]"
                onChange={(e) => {
                  handleChange(e, setFormData);
                }}
              />
            </div>
          </div>
          <div className="flex items-start lg:flex-row flex-col-reverse gap-[22px] w-full">
            <div className="flex flex-col items-start gap-[8px] lg:w-[50%] w-[100%]">
              <label
                htmlFor="email"
                className="text-n700 sm:text-[17px] text-[13px] leading-[20px] font-medium pl-[9px]"
              >
                Email
              </label>
              <input
                value={formData.email}
                placeholder="Enter email"
                type="email"
                name="email"
                id="email"
                className="px-[18px] w-full sm:h-[48px] h-[44px] rounded-[46px] shadow-lg sm:text-[16px] text-[14px]"
                onChange={(e) => {
                  handleChange(e, setFormData);
                }}
              />
            </div>
            <div className="flex flex-col items-start gap-[8px] lg:w-[50%] w-[100%]">
              <label
                htmlFor="password"
                className="text-n700 sm:text-[17px] text-[13px] leading-[20px] font-medium pl-[9px]"
              >
                Password
              </label>
              <div className="relative w-full">
                <input
                  placeholder="Generate a password"
                  value={formData.password}
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  className="px-[18px] w-full sm:h-[48px] h-[44px] rounded-[46px] shadow-lg sm:text-[16px] text-[14px]"
                  onChange={(e) => {
                    handleChange(e, setFormData);
                  }}
                />
                {formData.password === "" ? (
                  <svg
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        password: generatePassword(),
                      }));
                    }}
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
                ) : showPassword ? (
                  <svg
                    className="absolute right-[15px] top-[50%] translate-y-[-50%] cursor-pointer hover:scale-105"
                    xmlns="http://www.w3.org/2000/svg"
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    onClick={() => {
                      setShowPassword(false);
                    }}
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
                    className="absolute right-[15px] top-[50%] translate-y-[-50%] cursor-pointer hover:scale-105"
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    onClick={() => {
                      setShowPassword(true);
                    }}
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
          <div className="flex items-center gap-[22px] w-full lg:flex-row flex-col-reverse">
            <div className="flex flex-col items-start gap-[8px] lg:w-[50%] w-[100%]">
              <label
                htmlFor="role"
                className="text-n700 sm:text-[17px] text-[13px] leading-[20px] font-medium pl-[9px]"
              >
                Role
              </label>
              <div className="relative w-full">
                <button
                  type="button"
                  className="px-[18px] w-full text-n600 sm:h-[48px] h-[44px] rounded-[46px] shadow-lg sm:text-[16px] text-[14px] bg-white flex items-center justify-between"
                  onClick={toggleDropdown}
                >
                  {selectedOption}
                  <svg
                    className={`w-[16px] h-[16px] text-gray-400 transition-transform ${
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
                          setFormData((prev) => ({
                            ...prev,
                            role:
                              option === "Engineer"
                                ? 2
                                : option === "Coordinator"
                                ? 1
                                : null,
                          }));
                        }}
                      >
                        {option}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            {/* 
            <div className="flex flex-col items-start gap-[8px] lg:w-[50%] w-[100%]">
              <label
                htmlFor="birthdate"
                className="text-n700 sm:text-[17px] text-[13px] leading-[20px] font-medium pl-[9px]"
              >
                Birthdate
              </label>
              <DatePicker
                selected={selectedDate}
                onChange={(date: Date | null) => setSelectedDate(date)}
                placeholderText="Select a birthdate"
                className="px-[18px] w-full sm:h-[48px] h-[44px] rounded-[46px] shadow-lg text-n500 sm:text-[16px] text-[14px]"
                id="birthdate"
                calendarClassName="custom-datepicker"
              />
            </div> */}
          </div>
        </div>
        <div className="w-full flex sm:flex-row-reverse flex-col-reverse sm:gap-0 gap-[14px] items-center justify-between sm:relative sticky bottom-0 bg-white py-[13px] sm:py-0">
          <div className="flex items-center gap-[5px] flex-row-reverse">
            <button
              className="bg-primary rounded-[86px] px-[26.5px] py-[8.5px] font-semibold text-[14px] leading-[20px] text-white"
              onClick={(eo) => {
                handleSubmit(eo);
              }}
            >
              {isLoading ? (
                <ThreeDots color="#fff" width="30" height="20" />
              ) : (
                "Add user"
              )}
            </button>
            <button
              className="bg-n300 rounded-[86px] px-[26.5px] py-[8.5px] font-semibold text-[14px] leading-[20px] text-n600 border-[1px] border-n400"
              onClick={(eo) => {
                closeDialog(eo);
              }}
            >
              Cancel
            </button>
          </div>

          {visibleEmailErr && (
            <span className="ml-[12px] text-[14px] text-[#DB2C2C] leading-[22px]">
              {EmailErr}
            </span>
          )}
        </div>
      </form>
    </dialog>
  );
});

export default UserPopUp;
