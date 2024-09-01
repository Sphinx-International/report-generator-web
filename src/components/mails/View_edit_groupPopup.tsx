import { forwardRef, useRef } from "react";
import { handleCloseDialog } from "../../func/openDialog";
import { useState, useEffect, useCallback } from "react";
import { Resgroup, Resmail } from "../../assets/types/Mails";
import useWebSocketSearch from "../../hooks/useWebSocketSearch";
import { RotatingLines } from "react-loader-spinner";

const baseUrl = import.meta.env.VITE_BASE_URL;

interface ViewEditGroupPopup {
  groupInfo?: Resgroup;
  fetchFunc: () => void;
  setOpenedGroup: React.Dispatch<React.SetStateAction<Resgroup | undefined>>;
}

interface EditingGroupMembers {
  group_id: number | undefined;
  add: Resmail[];
  delete: number[];
}

const view_edit_groupPopup = forwardRef<HTMLDialogElement, ViewEditGroupPopup>(
  (props, ref) => {
    const [isEditing, setisEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [groupMember, setGroupMember] = useState<Resmail[]>();
    const [groupName, setGroupName] = useState<string | undefined>(
      props.groupInfo?.name
    );
    const [visibleErr, setVisibleErr] = useState<boolean>(false);
    const [err, setErr] = useState<string>("");

    const [editMembers, setEditMembers] = useState<EditingGroupMembers>({
      group_id: props.groupInfo?.id,
      add: [],
      delete: [],
    });
    const [searchQueryMail, setSearchQueryMail] = useState<string>("");
    const [loaderMailsSearch, setLoaderMailsSearch] = useState<boolean>(false);
    const [searchMails, setSearchMails] = useState<Resmail[]>([]);

    const inputRef = useRef<HTMLInputElement>(null);

    useWebSocketSearch({
      searchQuery: searchQueryMail,
      endpointPath: "search-mail",
      setResults: setSearchMails,
      setLoader: setLoaderMailsSearch,
    });

    const handleClose = () => {
      handleCloseDialog(ref);
      setisEditing(false);
    };

    const handleDivClick = () => {
      inputRef.current?.focus();
    };

    const fetchGroup = useCallback(async () => {
      if (!props.groupInfo) return;

      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }
      setIsLoading(true);
      console.log(props.groupInfo.id)
      const url = `${baseUrl}/mail/get-group-members/${props.groupInfo.id}`;
      try {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
        });
         console.log(response.status)
        if (!response.ok) {
          const errorText = await response.text(); // Read the response body as text
          console.error("Error response text: ", errorText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setGroupMember(data);
      } catch (err) {
        console.error("Error: ", err);
      } finally {
        setIsLoading(false);
      }
    }, [props.groupInfo]);

    const handleEditName = async () => {
      setIsLoading(true);
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        setIsLoading(false);
        return;
      }
      try {
        const response = await fetch(
          `${baseUrl}/mail/update-group`,

          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${token}`,
            },
            body: JSON.stringify({
              group_id: props.groupInfo?.id,
              name: groupName,
            }),
          }
        );

        if (response) {
          console.log(response.status);
          switch (response.status) {
            case 200:
              props.setOpenedGroup((prev) => ({
                ...prev!,
                name: groupName!,
              }));
              setErr("");
              setVisibleErr(false);
              props.fetchFunc();
              break;
            case 400:
              setErr("Verify your email.");
              break;
            case 409:
              setErr("Group name already exists.");
              setVisibleErr(true);
              break;
            default:
              console.log("Error: check the response status code");
              break;
          }
        }
      } catch (err) {
        console.error("Error submitting form", err);
      }

      setIsLoading(false);
    };

    const handleEditMembers = async () => {
      setIsLoading(true);
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        setIsLoading(false);
        return;
      }

      // Extract IDs from the `add` array
      const transformedMembers = {
        group_id: editMembers.group_id,
        add: editMembers.add.map((member) => member.id), // Extract only the IDs
        delete: editMembers.delete, // Keep the delete array as it is
      };

      try {
        const response = await fetch(
          `${baseUrl}/mail/update-group-members`,

          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${token}`,
            },
            body: JSON.stringify(transformedMembers),
          }
        );

        if (response) {
          console.log(response.status);
          switch (response.status) {
            case 200:
              handleClose();
              setEditMembers({
                group_id: props.groupInfo?.id,
                add: [],
                delete: [],
              });
              props.fetchFunc();
              break;
            case 400:
              setErr("Verify your email.");
              break;
            case 409:
              setErr("Group name already exists.");
              setVisibleErr(true);
              break;
            default:
              console.log("Error: check the response status code");
              break;
          }
        }
      } catch (err) {
        console.error("Error submitting form", err);
      }

      setIsLoading(false);
    };

    useEffect(() => {
      fetchGroup();
      setGroupName(props.groupInfo?.name);
      setEditMembers((prevState) => ({
        ...prevState,
        group_id: props.groupInfo?.id,
      }));
    }, [fetchGroup, props.groupInfo]);

    return (
      <dialog
        ref={ref}
        className="bg-white rounded-[40px] p-[32px] hidden flex-col items-center gap-[20px] sm:w-[48%] absolute left-[50%] top-[50%] -translate-x-[50%] -translate-y-[50%]"
      >
        <div className="flex flex-col gap-[25px] w-full">
          <div className="flex items-center justify-between w-full">
            <div className="flex flex-col items-start gap-[8px]">
              <div className="flex items-end gap-[20px]">
                <input
                  type="text"
                  value={groupName}
                  className={`text-[20px] leading-[20px] font-semibold text-n800 px-[20px] rounded-[28px] bg-white ${
                    isEditing && "shadow-md shadow-slate-300 py-[8px]"
                  }`}
                  onChange={(eo) => {
                    setGroupName(eo.target.value);
                  }}
                  disabled={isEditing ? false : true}
                />
                {isEditing && props.groupInfo?.name !== groupName && (
                  <div className="flex items-center gap-[8px]">
                    <span
                      className="rounded-[50%] px-[12px] py-[13px] bg-[#48C1B54D] cursor-pointer"
                      onClick={handleEditName}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="11"
                        viewBox="0 0 14 11"
                        fill="none"
                      >
                        <path
                          d="M1.42188 4.9917L4.97656 8.54639L12.0859 1.43701"
                          stroke="#48C1B5"
                          stroke-width="3"
                        />
                      </svg>
                    </span>
                    <span
                      className="rounded-[50%] p-[10.5px] bg-[#DB2C2C4D] cursor-pointer"
                      onClick={() => {
                        setGroupName(props.groupInfo?.name);
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                      >
                        <path
                          d="M12 2L2 12M2 2L12 12"
                          stroke="#DB2C2C"
                          stroke-width="4"
                        />
                      </svg>
                    </span>
                  </div>
                )}
              </div>

              {visibleErr && (
                <span className="text-[11px] text-[#DB2C2C] font-medium leading-[20px] ml-[15px]">
                  {err}
                </span>
              )}
            </div>

            <span
              className="text-[#111111] absolute top-6 right-6 cursor-pointer"
              onClick={handleClose}
            >
              🗙
            </span>
          </div>
          <div
            className={`flex items-start gap-[7px] w-full flex-wrap px-[10px] py-[16px] ${
              isEditing ? "border-[1px] border-n300 rounded-[30px]" : ""
            }`}
            onClick={handleDivClick}
          >
            {groupMember
              ?.filter((mail) => !editMembers.delete.includes(mail.id))
              .map((mail, index) => {
                return (
                  <div
                    key={index}
                    className="flex items-center gap-[8px] rounded-[22px] py-[7px] px-[11px] border-[1px] border-n300"
                  >
                    <span className="p-[4px] rounded-[50%] bg-[#EDEBFF]">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M9.99972 0.990234C8.9499 0.990234 7.94309 1.38714 7.20076 2.09363C6.45842 2.80013 6.04139 3.75834 6.04139 4.75748C6.04139 5.75661 6.45842 6.71482 7.20076 7.42132C7.94309 8.12781 8.9499 8.52472 9.99972 8.52472C11.0495 8.52472 12.0564 8.12781 12.7987 7.42132C13.541 6.71482 13.9581 5.75661 13.9581 4.75748C13.9581 3.75834 13.541 2.80013 12.7987 2.09363C12.0564 1.38714 11.0495 0.990234 9.99972 0.990234ZM7.29139 4.75748C7.29139 4.07386 7.57673 3.41824 8.08464 2.93485C8.59255 2.45146 9.28142 2.17989 9.99972 2.17989C10.718 2.17989 11.4069 2.45146 11.9148 2.93485C12.4227 3.41824 12.7081 4.07386 12.7081 4.75748C12.7081 5.44109 12.4227 6.09671 11.9148 6.5801C11.4069 7.0635 10.718 7.33506 9.99972 7.33506C9.28142 7.33506 8.59255 7.0635 8.08464 6.5801C7.57673 6.09671 7.29139 5.44109 7.29139 4.75748ZM9.99972 9.71437C8.07222 9.71437 6.29555 10.1315 4.97972 10.8358C3.68305 11.5306 2.70805 12.5822 2.70805 13.8782V13.9591C2.70722 14.8806 2.70639 16.037 3.77222 16.8634C4.29639 17.2695 5.03055 17.559 6.02222 17.7493C7.01555 17.9412 8.31139 18.042 9.99972 18.042C11.6881 18.042 12.9831 17.9412 13.9781 17.7493C14.9697 17.559 15.703 17.2695 16.228 16.8634C17.2939 16.037 17.2922 14.8806 17.2914 13.9591V13.8782C17.2914 12.5822 16.3164 11.5306 15.0205 10.8358C13.7039 10.1315 11.9281 9.71437 9.99972 9.71437ZM3.95805 13.8782C3.95805 13.2032 4.47639 12.4704 5.59222 11.8732C6.68889 11.2863 8.24555 10.904 10.0006 10.904C11.7539 10.904 13.3106 11.2863 14.4072 11.8732C15.5239 12.4704 16.0414 13.2032 16.0414 13.8782C16.0414 14.9155 16.008 15.4993 15.438 15.9402C15.1297 16.1798 14.613 16.4137 13.7297 16.5834C12.8489 16.7532 11.6447 16.8523 9.99972 16.8523C8.35472 16.8523 7.14972 16.7532 6.26972 16.5834C5.38639 16.4137 4.86972 16.1798 4.56139 15.941C3.99139 15.4993 3.95805 14.9155 3.95805 13.8782Z"
                          fill="#4A3AFF"
                        />
                      </svg>
                    </span>
                    <span className="text-[15px] text-n700 font-medium leading-[20px]">
                      {mail.email}
                    </span>
                    {isEditing && (
                      <span
                        className="text-n600 text-[13px] cursor-pointer font-light"
                        onClick={() => {
                          setEditMembers((prevState) => {
                            if (!prevState.delete.includes(mail.id)) {
                              return {
                                ...prevState,
                                delete: [...prevState.delete, mail.id],
                              };
                            }
                            return prevState;
                          });
                        }}
                      >
                        🗙
                      </span>
                    )}
                  </div>
                );
              })}

            {isEditing && (
              <>
                {editMembers.add?.map((mail, index) => {
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-[8px] rounded-[22px] py-[7px] px-[11px] border-[1px] border-n300"
                    >
                      <span className="p-[4px] rounded-[50%] bg-[#EDEBFF]">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                        >
                          <path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M9.99972 0.990234C8.9499 0.990234 7.94309 1.38714 7.20076 2.09363C6.45842 2.80013 6.04139 3.75834 6.04139 4.75748C6.04139 5.75661 6.45842 6.71482 7.20076 7.42132C7.94309 8.12781 8.9499 8.52472 9.99972 8.52472C11.0495 8.52472 12.0564 8.12781 12.7987 7.42132C13.541 6.71482 13.9581 5.75661 13.9581 4.75748C13.9581 3.75834 13.541 2.80013 12.7987 2.09363C12.0564 1.38714 11.0495 0.990234 9.99972 0.990234ZM7.29139 4.75748C7.29139 4.07386 7.57673 3.41824 8.08464 2.93485C8.59255 2.45146 9.28142 2.17989 9.99972 2.17989C10.718 2.17989 11.4069 2.45146 11.9148 2.93485C12.4227 3.41824 12.7081 4.07386 12.7081 4.75748C12.7081 5.44109 12.4227 6.09671 11.9148 6.5801C11.4069 7.0635 10.718 7.33506 9.99972 7.33506C9.28142 7.33506 8.59255 7.0635 8.08464 6.5801C7.57673 6.09671 7.29139 5.44109 7.29139 4.75748ZM9.99972 9.71437C8.07222 9.71437 6.29555 10.1315 4.97972 10.8358C3.68305 11.5306 2.70805 12.5822 2.70805 13.8782V13.9591C2.70722 14.8806 2.70639 16.037 3.77222 16.8634C4.29639 17.2695 5.03055 17.559 6.02222 17.7493C7.01555 17.9412 8.31139 18.042 9.99972 18.042C11.6881 18.042 12.9831 17.9412 13.9781 17.7493C14.9697 17.559 15.703 17.2695 16.228 16.8634C17.2939 16.037 17.2922 14.8806 17.2914 13.9591V13.8782C17.2914 12.5822 16.3164 11.5306 15.0205 10.8358C13.7039 10.1315 11.9281 9.71437 9.99972 9.71437ZM3.95805 13.8782C3.95805 13.2032 4.47639 12.4704 5.59222 11.8732C6.68889 11.2863 8.24555 10.904 10.0006 10.904C11.7539 10.904 13.3106 11.2863 14.4072 11.8732C15.5239 12.4704 16.0414 13.2032 16.0414 13.8782C16.0414 14.9155 16.008 15.4993 15.438 15.9402C15.1297 16.1798 14.613 16.4137 13.7297 16.5834C12.8489 16.7532 11.6447 16.8523 9.99972 16.8523C8.35472 16.8523 7.14972 16.7532 6.26972 16.5834C5.38639 16.4137 4.86972 16.1798 4.56139 15.941C3.99139 15.4993 3.95805 14.9155 3.95805 13.8782Z"
                            fill="#4A3AFF"
                          />
                        </svg>
                      </span>
                      <span className="text-[15px] text-n700 font-medium leading-[20px]">
                        {mail.email}
                      </span>
                      <span
                        className="text-n600 text-[13px] cursor-pointer font-light"
                        onClick={() => {
                          setEditMembers((prevState) => {
                            if (!prevState.delete.includes(mail.id)) {
                              return {
                                ...prevState,
                                add: prevState.add.filter(
                                  (addedMail) => addedMail.id !== mail.id
                                ),
                              };
                            }
                            return prevState;
                          });
                        }}
                      >
                        🗙
                      </span>
                    </div>
                  );
                })}

                <div className="relative w-[45%] h-fit">
                  <input
                    type="text"
                    className="h-[44px] w-full text-[15px] text-n700 focus:outline-none"
                    ref={inputRef}
                    value={searchQueryMail}
                    onChange={(eo) => {
                      setSearchQueryMail(eo.target.value);
                    }}
                  />
                  {searchMails.length > 0 && searchQueryMail !== "" && (
                    <div className="bg-white shadow-xl py-[13px] flex flex-col items-start gap-[8px] rounded-[15px] w-fit">
                      {loaderMailsSearch ? (
                        <RotatingLines
                          strokeWidth="3"
                          strokeColor="#4A3AFF"
                          width="25"
                        />
                      ) : (
                        searchMails
                          .filter(
                            (mail) =>
                              !groupMember?.some(
                                (member) => member.id === mail.id
                              )
                          ) // Filter out mails already in groupMember
                          .map((mail) => {
                            return (
                              <div
                                key={mail.id}
                                className="flex items-center gap-[6px] cursor-pointer w-full px-[15px] hover:bg-gray-200"
                                onClick={() => {
                                  setEditMembers((prevState) => {
                                    if (
                                      !prevState.add.some(
                                        (existingMail) =>
                                          existingMail.id === mail.id
                                      )
                                    ) {
                                      return {
                                        ...prevState,
                                        add: [...prevState.add, mail], // Add the whole mail object
                                      };
                                    }
                                    return prevState;
                                  });
                                  setSearchQueryMail(""); // Reset search query
                                }}
                              >
                                <img src="/avatar.png" alt="avatar" />
                                <span className="text-[14px] text-n600">
                                  {mail.email}
                                </span>
                              </div>
                            );
                          })
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          <div className="flex justify-end pr-2">
            {!isEditing ? (
              <button
                className="text-[14px] leading-[20px] text-white bg-primary font-semibold rounded-[25px] px-[34px] py-[7px] border-[1px] border-primary"
                onClick={() => {
                  setisEditing(true);
                }}
              >
                Edit
              </button>
            ) : (
              <div className="fle flex justify-end pr-2 items-center gap-[5px]">
                <button
                  className="text-[14px] leading-[20px] text-n700 bg-n300 font-semibold rounded-[25px] px-[34px] py-[7px] border-[1px] border-n500"
                  onClick={() => {
                    setGroupName(props.groupInfo?.name);
                    setEditMembers({
                      group_id: props.groupInfo?.id,
                      add: [],
                      delete: [],
                    });
                    setSearchQueryMail("");
                    setisEditing(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  className={`text-[14px] leading-[20px] font-semibold rounded-[25px] px-[34px] py-[7px] border-[1px]  ${
                    editMembers.delete.length > 0 || editMembers.add.length > 0
                      ? "border-primary text-white bg-primary"
                      : "border-n600 text-n600 bg-n400 cursor-not-allowed"
                  } `}
                  disabled={
                    editMembers.delete.length > 0 || editMembers.add.length > 0
                      ? false
                      : true
                  }
                  onClick={() => {
                    handleEditMembers();
                  }}
                >
                  {isLoading ? (
                    <RotatingLines strokeColor="white" width="20" />
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </dialog>
    );
  }
);

export default view_edit_groupPopup;
