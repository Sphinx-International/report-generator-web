import { useState, useRef, useEffect } from "react";
import SideBar from "../components/SideBar";
import Header from "../components/Header";
import UserPopUp from "../components/UserPopUp";
import DeletePopup from "../components/DeletePopup";
import Main from "../components/Main";
import Pagination from "../components/Pagination";
import { User } from "../assets/types/User";
import { useDispatch } from "react-redux";
import { toggleUserInTab } from "../Redux/slices/selectedUsersSlice";
import { AppDispatch } from "../Redux/store";
import { useSelector } from "react-redux";
import { RootState } from "../Redux/store";
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
  const dispatch = useDispatch<AppDispatch>();
  const selectedUsers = useSelector(
    (state: RootState) => state.selectedUsers.UsersTab
  );

  const [Users, setUsers] = useState<User[] | null>(null);

  const addUserDialogRef = useRef<HTMLDialogElement>(null);
  const editUserDialogRef = useRef<HTMLDialogElement>(null);
  const deleteDialogRef = useRef<HTMLDialogElement>(null);

  const [editUser, setEditUser] = useState<User>();

  const handleCheckboxChange = (userId: string) => {
    dispatch(toggleUserInTab(userId));
  };
  const handleAddUserButtonClick = () => {
    const dialog = addUserDialogRef.current;
    if (dialog) {
      dialog.style.display = "flex";
      addUserDialogRef.current?.showModal();
    }
  };
  const handleEditUserButtonClick = (user: User) => {
    setEditUser(user);
    const dialog = editUserDialogRef.current;
    if (dialog) {
      dialog.style.display = "flex";
      editUserDialogRef.current?.showModal();
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
    const addUserDialog = addUserDialogRef.current;
    const editUserDialog = editUserDialogRef.current;

    const deleteDialog = deleteDialogRef.current;
    if (addUserDialog) {
      addUserDialog.style.display = "none";
    }
    if (editUserDialog) {
      editUserDialog.style.display = "none";
    }
    if (deleteDialog) {
      deleteDialog.style.display = "none";
    }
  };

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return;
    }

    const offset = 0;
    const limit = 5;
    const url = `/account/get-accounts?offset=${offset}&limit=${limit}`;

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
      setUsers(data.data);
    } catch (err) {
      console.error("Error: ", err);
    }
  };


  useEffect(() => {
    fetchUsers();

    const userDialog = addUserDialogRef.current;
    return () => {
      if (userDialog) {
        userDialog.removeEventListener("close", handleDialogClose);
      }
    };
  }, [Users]);

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
      <div className="lg:pl-[33px] md:pt-[60px] pt-[20px] lg:pr-[56px] sm:px-[30px] px-[15px] md:pb-[38px] flex flex-col gap-[32px] w-full h-full overflow-auto">
        <Header
          pageSentence="Here are information about all users"
          searchBar={true}
        />
        <Main
          flitration={["All", "Engineers", "Coordinators", "Clients"]}
          functionalties={{
            primaryFunc: {name:"Add User +"},
            secondaryFuncs:[{name:"CSV",iconPath:"/icons/downloadIcon.png"},{name:"Upload",iconPath:"/icons/uploadIcon.png"}],
          }}
          handleAddPrimaryButtonClick={handleAddUserButtonClick}
        >
          <div className="flex flex-col gap-[9px] items-center w-full">
            <div className=" w-full sm:p-[20px] p-[14px] flex flex-col gap-[12px] rounded-[20px] border-[1px] border-n300">
              <div className="flex items-center lg:justify-between justify-end sm:pr-[16px] w-full">
                <h3 className="text-[20px] font-semibold leading-[30px] text-n800 lg:inline-block hidden">
                  Users
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
              <div className="lg:flex lg:flex-col hidden w-full">
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
                {Users !== null
                  ? Users.map((user: User, index) => {
                      const isSelected = selectedUsers.includes(user.email);
                      return (
                        <div
                          key={index}
                          className="relative flex  items-center w-full h-[54px] border-b-[1px] hover:bg-n200 cursor-pointer group"
                        >
                          <div className="w-[13%] flex items-center justify-center">
                            <img
                              src="/avatar1.png"
                              alt="avatar"
                              className="w-[40px]"
                            />
                          </div>
                          <span className="w-[25%] text-center leading-[18px] text-[12px] text-n800 font-medium">
                            {user.last_name} {user.first_name}
                          </span>
                          <span className="w-[30%] text-center leading-[18px] text-[12px] text-n800 font-medium">
                            {user.email}
                          </span>
                          <span className="w-[16%] text-center leading-[18px] text-[12px] text-n800 font-medium">
                            10-09-2002
                          </span>
                          <span className="w-[13%] text-center leading-[18px] text-[12px] text-n800 font-medium">
                            Engineer
                          </span>
                          <span className="w-[13%] flex justify-center text-center leading-[18px] text-[12px] text-n800 font-medium">
                            <svg
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditUserButtonClick(user);
                              }}
                              className="cursor-pointer hover:scale-105"
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
                            id={`${index}`}
                            checked={isSelected}
                            readOnly
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 checked:opacity-100 opacity-0 group-hover:opacity-100 peer cursor-pointer w-[15px] h-[15px] transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCheckboxChange(user.email);
                            }}
                          />
                        </div>
                      );
                    })
                  : null}{" "}
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
              </div>

              <div className="lg:hidden flex flex-wrap w-full gap-[11px] ">
                {Users !== null
                  ? Users.map((user: User, index) => {
                      const isSelected = selectedUsers.includes(user.email);
                      return (
                        <div
                          key={index}
                          className={`relative p-[9px] flex items-center gap-[9px] border-[1px] border-[#E9F1FF] rounded-[11px] w-[49%] flex-grow ${
                            isSelected ? "bg-primary" : ""
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCheckboxChange(user.email);
                          }}
                        >
                          <img
                            src="/avatar.png"
                            alt="avatar"
                            className="w-[52.5px] rounded-[11px]"
                          />
                          <span
                            className={` text-[12px] leading-[18px] ${
                              isSelected ? "text-white" : "text-n600"
                            }`}
                          >
                            {user.last_name} {user.first_name} <br />{" "}
                            {user.email} <br /> 10-09-2002 <br /> Engineer
                          </span>

                          <svg
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditUserButtonClick(user);
                            }}
                            className="absolute top-[12px] right-[12px] sm:w-[16px] sm:h-[16px]"
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                          >
                            <path
                              d="M8.16876 1.42914C8.44354 1.15437 8.81621 1 9.20481 1C9.5934 1 9.96608 1.15437 10.2409 1.42914C10.5156 1.70392 10.67 2.0766 10.67 2.46519C10.67 2.85379 10.5156 3.22646 10.2409 3.50124L4.01559 9.7272C3.85158 9.89106 3.64897 10.011 3.42642 10.076L1.44205 10.6562C1.38261 10.6735 1.31961 10.6746 1.25964 10.6592C1.19967 10.6438 1.14493 10.6126 1.10115 10.5689C1.05737 10.5251 1.02617 10.4703 1.0108 10.4104C0.99544 10.3504 0.996479 10.2874 1.01381 10.228L1.594 8.24358C1.65929 8.02121 1.77948 7.81884 1.94349 7.6551L8.16876 1.42914Z"
                              stroke="#A0A3BD"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            />
                          </svg>
                        </div>
                      );
                    })
                  : null}
              </div>
            </div>

            <Pagination
              buttonTitle="add user +"
              buttonFunc={handleAddUserButtonClick}
            />
          </div>
        </Main>
      </div>

      <UserPopUp userInfo={editUser} ref={editUserDialogRef} req="Put" />
      <UserPopUp ref={addUserDialogRef} req="Post" />
      <DeletePopup ref={deleteDialogRef} deleteItems={selectedUsers} deleteUrl="/account/delete-accounts" jsonTitle="accounts"/>
    </div>
  );
};

export default UserManagment;
