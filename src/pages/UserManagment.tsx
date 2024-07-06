import { useState, useRef, useEffect } from "react";
import SideBar from "../components/SideBar";
import UserPopUp from "../components/UserPopUp";
import DeletePopup from "./DeletePopup";
const roles: string[] = ["All", "Engineers", "Coordinators", "Clients"];
const titlesRow = [
  {
    title: "Picture",
    width: "w-[13%]",
  },
  {
    title: "Name",
    width: "w-[25%]",
  },
  {
    title: "Email",
    width: "w-[30%]",
  },
  {
    title: "Birthdate",
    width: "w-[16%]",
  },
  {
    title: "Role",
    width: "w-[13%]",
  },
  {
    title: "Edit",
    width: "w-[13%]",
  },
];
const UserManagment = () => {
  const [selectedRole, setSelectedRole] = useState<string>("All");
  const userDialogRef = useRef<HTMLDialogElement>(null);
  const deleteDialogRef = useRef<HTMLDialogElement>(null);

  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  console.log(selectedUsers);

  const handleUserSelection = (userId: string) => {
    setSelectedUsers((prevSelectedUsers) => {
      if (prevSelectedUsers.includes(userId)) {
        // Remove user from the list if already selected
        return prevSelectedUsers.filter((user) => user !== userId);
      } else {
        // Add user to the list if not already selected
        return [...prevSelectedUsers, userId];
      }
    });
  };

  const handleCheckboxChange = (userId: string) => {
    handleUserSelection(userId);
  };
  const handleAddUserButtonClick = () => {
    const dialog = userDialogRef.current;
    if (dialog) {
      dialog.style.display = "flex";
      userDialogRef.current?.showModal();
    }
  };
  const handledeleteUserButtonClick = () => {
    const dialog = deleteDialogRef.current;
    if (dialog) {
      dialog.style.display = "flex";
      deleteDialogRef.current?.showModal();
    }
  };

  const handleDialogClose = () => {
    const userDialog = userDialogRef.current;
    const deleteDialog = deleteDialogRef.current;
    if (userDialog) {
      userDialog.style.display = "none";
    }
    if (deleteDialog) {
      deleteDialog.style.display = "none";
    }
  };

  useEffect(() => {
    const userDialog = userDialogRef.current;

    if (userDialog) {
      userDialog.addEventListener("close", handleDialogClose);
    }

    return () => {
      if (userDialog) {
        userDialog.removeEventListener("close", handleDialogClose);
      }
    };
  }, []);

  const handleSpanClick = () => {
    if (selectedUsers.length === 0) {
      return;
    }
    // Perform the action when users are selected
    handledeleteUserButtonClick();
  };

  return (
    <div className="w-full flex h-[100vh]">
      <SideBar />
      <main className="pl-[33px] pt-[60px] pr-[56px] pb-[38px] flex flex-col gap-[32px] w-full h-full overflow-auto">
        <div className="flex flex-col gap-[18px]">
          <div className="pl-[7px] flex items-start justify-between w-full">
            <div className="flex flex-col gap-[4px] items-start">
              <h1 className="text-n800 text-[28px] leading-[42px] font-semibold">
                Welcome Back, Meriem
              </h1>
              <span className="text-n500">
                Here are information about all users
              </span>
            </div>
            <div className="flex items-center gap-[32px]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M6.8499 8.9999C6.8499 7.68101 7.29049 6.38991 8.1352 5.43961C8.96601 4.50496 10.2306 3.8499 11.9999 3.8499C13.7693 3.8499 15.0338 4.50496 15.8646 5.43961C16.7093 6.38991 17.1499 7.68101 17.1499 8.9999C17.1499 10.2595 17.7765 11.1981 18.2541 11.9136L18.2927 11.9714C18.8109 12.7488 19.1499 13.2937 19.1499 13.9999C19.1499 14.9742 18.4562 15.7577 17.0163 16.3362C15.5989 16.9057 13.7184 17.1499 11.9999 17.1499C10.2814 17.1499 8.4009 16.9057 6.98347 16.3362C5.54363 15.7577 4.8499 14.9742 4.8499 13.9999C4.8499 13.3064 5.17412 12.8296 5.69801 12.0753C6.20164 11.3503 6.8499 10.4078 6.8499 8.9999ZM11.9999 2.1499C9.76925 2.1499 8.0338 2.99485 6.86461 4.31019C5.70932 5.60989 5.1499 7.31879 5.1499 8.9999C5.1499 9.83343 4.79817 10.3909 4.30179 11.1055L4.23206 11.2056C3.76246 11.8784 3.1499 12.756 3.1499 13.9999C3.1499 16.0257 4.6784 17.2421 6.34968 17.9136C8.04336 18.5941 10.1628 18.8499 11.9999 18.8499C13.837 18.8499 15.9564 18.5941 17.6501 17.9136C19.3214 17.2421 20.8499 16.0257 20.8499 13.9999C20.8499 12.7403 20.2233 11.8017 19.7457 11.0862L19.7071 11.0284C19.1889 10.251 18.8499 9.70612 18.8499 8.9999C18.8499 7.31879 18.2905 5.60989 17.1352 4.31019C15.966 2.99485 14.2306 2.1499 11.9999 2.1499ZM9.52841 19.2927C9.91593 19.0343 10.4384 19.1362 10.7009 19.5192L10.7073 19.5277C10.7163 19.5396 10.734 19.562 10.7602 19.5914C10.8131 19.651 10.8969 19.7351 11.0099 19.8199C11.2334 19.9876 11.5589 20.1499 11.9999 20.1499C12.4409 20.1499 12.7664 19.9876 12.9899 19.8199C13.1029 19.7351 13.1867 19.651 13.2396 19.5914C13.2658 19.562 13.2835 19.5396 13.2925 19.5277L13.2989 19.5192C13.5614 19.1362 14.0839 19.0343 14.4714 19.2927C14.862 19.5531 14.9675 20.0808 14.7071 20.4714L13.9999 19.9999C14.7071 20.4714 14.7069 20.4717 14.7067 20.472L14.7063 20.4727L14.7053 20.4741L14.7032 20.4773L14.6982 20.4846L14.6848 20.5037C14.6744 20.5183 14.6611 20.5366 14.6448 20.558C14.6122 20.6008 14.5674 20.6565 14.5102 20.7209C14.3964 20.8488 14.2302 21.0147 14.0099 21.1799C13.5668 21.5122 12.8922 21.8499 11.9999 21.8499C11.1076 21.8499 10.433 21.5122 9.9899 21.1799C9.76961 21.0147 9.60336 20.8488 9.4896 20.7209C9.43243 20.6565 9.38763 20.6008 9.35504 20.558C9.33871 20.5366 9.32537 20.5183 9.315 20.5037L9.30164 20.4846L9.2966 20.4773L9.2945 20.4741L9.29354 20.4727L9.29309 20.472C9.29287 20.4717 9.29266 20.4714 9.9999 19.9999L9.29266 20.4714C9.03226 20.0808 9.13781 19.5531 9.52841 19.2927Z"
                  fill="#170F49"
                />
                <path
                  d="M24 2C24 3.10457 23.1046 4 22 4C20.8954 4 20 3.10457 20 2C20 0.895431 20.8954 0 22 0C23.1046 0 24 0.895431 24 2Z"
                  fill="#FF3B30"
                />
              </svg>
              <div className="flex items-center gap-[12px]">
                <img src="/avatar.png" alt="avatar" className="w-[40px]" />
                <div className="flex items-center gap-[8px] text-n800">
                  Mariem Boukennouche
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M6.39886 9.39886C6.73081 9.06692 7.269 9.06692 7.60094 9.39886L11.9999 13.7978L16.3989 9.39886C16.7308 9.06692 17.269 9.06692 17.6009 9.39886C17.9329 9.73081 17.9329 10.269 17.6009 10.6009L12.6009 15.6009C12.269 15.9329 11.7308 15.9329 11.3989 15.6009L6.39886 10.6009C6.06692 10.269 6.06692 9.73081 6.39886 9.39886Z"
                      fill="#170F49"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <div className="pr-[16px] relative">
            <input
              type="search"
              name=""
              id=""
              className="w-full h-[52px] rounded-[40px] border-[1px] border-n300 shadow-md px-[54px]"
              placeholder="Search"
            />
            <svg
              className="absolute left-[20px] top-[13px]"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M11 2C15.97 2 20 6.03 20 11C20 15.97 15.97 20 11 20C6.03 20 2 15.97 2 11C2 7.5 4 4.46 6.93 2.97"
                stroke="#6F6C8F"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M19.07 20.97C19.6 22.57 20.81 22.73 21.74 21.33C22.6 20.05 22.04 19 20.5 19C19.35 19 18.71 19.89 19.07 20.97Z"
                stroke="#6F6C8F"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>

          <div className=""></div>
        </div>
        <div className="flex flex-col gap-[18px] pr-[16px] w-full">
          <div className="pl-[24px] flex items-center justify-between w-full">
            <div className="flex items-center gap-[40px]">
              {roles.map((role, index) => {
                return (
                  <span
                    key={index}
                    className={`${
                      selectedRole === role
                        ? "text-primary border-b-[2px] border-primary"
                        : "text-n600"
                    } leading-[46px] cursor-pointer`}
                    onClick={() => {
                      setSelectedRole(role);
                    }}
                  >
                    {role}
                  </span>
                );
              })}
            </div>
            <div className="flex items-center gap-[7px]">
              <button className="flex items-center gap-[3px] font-semibold leading-[21px] px-[20px] py-[9.5px] text-n600 border-[1.3px] border-n400 rounded-[21px]">
                CSV
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M2.66675 11.3334V12.6667C2.66675 13.0204 2.80722 13.3595 3.05727 13.6096C3.30732 13.8596 3.64646 14.0001 4.00008 14.0001H12.0001C12.3537 14.0001 12.6928 13.8596 12.9429 13.6096C13.1929 13.3595 13.3334 13.0204 13.3334 12.6667V11.3334M4.66675 7.33341L8.00008 10.6667M8.00008 10.6667L11.3334 7.33341M8.00008 10.6667V2.66675"
                    stroke="#6F6C8F"
                    stroke-width="1.66667"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
              <button className="flex items-center gap-[3px] font-semibold leading-[21px] px-[20px] py-[9.5px] text-n600 border-[1.3px] border-n400 rounded-[21px]">
                Upload
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M2.66675 11.3334V12.6667C2.66675 13.0204 2.80722 13.3595 3.05727 13.6096C3.30732 13.8596 3.64646 14.0001 4.00008 14.0001H12.0001C12.3537 14.0001 12.6928 13.8596 12.9429 13.6096C13.1929 13.3595 13.3334 13.0204 13.3334 12.6667V11.3334M4.66675 6.00008L8.00008 2.66675M8.00008 2.66675L11.3334 6.00008M8.00008 2.66675V10.6667"
                    stroke="#6F6C8F"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
              <button
                className="flex items-center gap-[3px] leading-[21px] font-semibold px-[20px] py-[9.5px] text-white rounded-[21px] bg-primary"
                onClick={handleAddUserButtonClick}
              >
                Add user +
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-[9px] items-center w-full">
            <div className=" w-full p-[20px] flex flex-col gap-[12px] rounded-[20px] border-[1px] border-n300">
              <div className="flex items-center justify-between pr-[16px] w-full">
                <h3 className="text-[20px] font-semibold leading-[30px] text-n800">
                  Employees
                </h3>
                <span
                  onClick={handleSpanClick}
                  aria-disabled={selectedUsers.length === 0 ? true : false}
                  className={`p-[10px] bg-n200 border-[1px] border-n400 rounded-[6px] ${
                    selectedUsers.length === 0
                      ? " cursor-not-allowed"
                      : " cursor-pointer"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M18.412 6.5L17.611 20.117C17.5812 20.6264 17.3577 21.1051 16.9865 21.4551C16.6153 21.8052 16.1243 22.0001 15.614 22H8.386C7.87575 22.0001 7.38475 21.8052 7.0135 21.4551C6.64226 21.1051 6.41885 20.6264 6.389 20.117L5.59 6.5H3.5V5.5C3.5 5.36739 3.55268 5.24021 3.64645 5.14645C3.74021 5.05268 3.86739 5 4 5H20C20.1326 5 20.2598 5.05268 20.3536 5.14645C20.4473 5.24021 20.5 5.36739 20.5 5.5V6.5H18.412ZM10 2.5H14C14.1326 2.5 14.2598 2.55268 14.3536 2.64645C14.4473 2.74021 14.5 2.86739 14.5 3V4H9.5V3C9.5 2.86739 9.55268 2.74021 9.64645 2.64645C9.74021 2.55268 9.86739 2.5 10 2.5ZM9 9L9.5 18H11L10.6 9H9ZM13.5 9L13 18H14.5L15 9H13.5Z"
                      fill={`${
                        selectedUsers.length === 0 ? "#6F6C8F" : "#df0505"
                      }`}
                    />
                  </svg>
                </span>
              </div>
              <div className="flex flex-col w-full">
                <div className="flex w-full h-[54px] border-b-[1px]">
                  {titlesRow.map((item, index) => {
                    return (
                      <span
                        key={index}
                        className={`${item.width} flex items-center justify-center gap-[4px] text-[13px] leading-[19.5px] font-medium text-n800`}
                      >
                        {" "}
                        {item.title}
                      </span>
                    );
                  })}
                </div>
                {Array.from({ length: 10 }).map((_, index) => {
                  const userId = `user-${index}`;
                  const isSelected = selectedUsers.includes(userId);

                  return (
                    <label
                      key={index}
                      htmlFor={userId}
                      className="relative flex items-center w-full h-[54px] border-b-[1px] hover:bg-n200 cursor-pointer group"
                      onClick={(e) => {
                        e.preventDefault();
                        handleUserSelection(userId);
                      }}
                    >
                      <div className="w-[13%] flex items-center justify-center">
                        <img
                          src="/avatar1.png"
                          alt="avatar"
                          className="w-[40px]"
                        />
                      </div>
                      <span className="w-[25%] text-center leading-[18px] text-[12px] text-n800 font-medium">
                        Boukennouche Mariem
                      </span>
                      <span className="w-[30%] text-center leading-[18px] text-[12px] text-n800 font-medium">
                        mboukennouche@gmail.com
                      </span>
                      <span className="w-[16%] text-center leading-[18px] text-[12px] text-n800 font-medium">
                        10-09-2002
                      </span>

                      <span className="w-[13%] text-center leading-[18px] text-[12px] text-n800 font-medium">
                        Engineer
                      </span>
                      <span className="w-[13%] flex justify-center text-center leading-[18px] text-[12px] text-n800 font-medium">
                        <svg
                          className="cursor-pointer"
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                        >
                          <path
                            d="M10 2.5H4.16667C3.72464 2.5 3.30072 2.67559 2.98816 2.98816C2.67559 3.30072 2.5 3.72464 2.5 4.16667V15.8333C2.5 16.2754 2.67559 16.6993 2.98816 17.0118C3.30072 17.3244 3.72464 17.5 4.16667 17.5H15.8333C16.2754 17.5 16.6993 17.3244 17.0118 17.0118C17.3244 16.6993 17.5 16.2754 17.5 15.8333V10"
                            stroke="#7C8DB5"
                            strokeWidth="1.66667"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M15.3125 2.18744C15.644 1.85592 16.0937 1.66968 16.5625 1.66968C17.0313 1.66968 17.481 1.85592 17.8125 2.18744C18.144 2.51897 18.3303 2.9686 18.3303 3.43744C18.3303 3.90629 18.144 4.35592 17.8125 4.68744L10.3017 12.1991C10.1038 12.3968 9.85933 12.5415 9.59083 12.6199L7.19666 13.3199C7.12496 13.3409 7.04895 13.3421 6.97659 13.3236C6.90423 13.305 6.83819 13.2674 6.78537 13.2146C6.73255 13.1618 6.6949 13.0957 6.67637 13.0234C6.65783 12.951 6.65908 12.875 6.68 12.8033L7.38 10.4091C7.45877 10.1408 7.60378 9.89666 7.80166 9.69911L15.3125 2.18744Z"
                            stroke="#7C8DB5"
                            strokeWidth="1.66667"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                      <input
                        type="checkbox"
                        name="user"
                        id={userId}
                        checked={isSelected}
                        readOnly
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 checked:opacity-100 opacity-0 group-hover:opacity-100 peer cursor-pointer w-[15px] h-[15px] transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCheckboxChange(userId);
                        }}
                      />
                    </label>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center gap-[40px]">
              <span className="cursor-pointer font-medium text-primary">
                {"<< First"}
              </span>
              <div className="flex items-center gap-[26px]">
                <span className="cursor-pointer font-medium text-primary">
                  {"< Previous"}
                </span>
                <span className="rounded-[9px] px-[60px] py-[8px] bg-[#F3F4F8]">
                  13
                </span>
                <span className="cursor-pointer font-medium text-primary">
                  {"Next >"}
                </span>
              </div>
              <span className="cursor-pointer font-medium text-primary">
                {"Last >>"}
              </span>
            </div>
          </div>
        </div>
      </main>

      <UserPopUp ref={userDialogRef} />
      <DeletePopup ref={deleteDialogRef} />
    </div>
  );
};

export default UserManagment;
