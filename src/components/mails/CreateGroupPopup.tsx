import { forwardRef, useState, useRef } from "react";
import { handleCloseDialog } from "../../func/openDialog";
import { RotatingLines } from "react-loader-spinner";
import useWebSocketSearch from "../../hooks/useWebSocketSearch";
import { Resmail } from "../../assets/types/Mails&Notifications";
import { fetchGroupMembersForResmailArray } from "../../func/groupsApi";

const baseUrl = import.meta.env.VITE_BASE_URL;

interface CreateGroupPopup {
  fetchFunc: () => void;
}

const CreateGroupPopup = forwardRef<HTMLDialogElement, CreateGroupPopup>(
  (props, ref) => {
    const [name, setName] = useState<string>("");
    const [searchQueryMail, setSearchQueryMail] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [visibleErr, setVisibleErr] = useState<boolean>(false);
    const [err, setErr] = useState<string>("");
    const [loaderMailsSearch, setLoaderMailsSearch] = useState<boolean>(false);
    const [searchMails, setSearchMails] = useState<
      { id: number; email: string; name: string }[]
    >([]);
    const [selectedMails, setSelectedMails] = useState<Resmail[]>([]);

    const [typeOfSearch, setTypeOfSearch] = useState<"Emails" | "Groupes">(
      "Emails"
    );
    const [typeOfSearchPopupVisible, setTypeOfSearchPopupVisible] =
      useState<boolean>(false);

    const inputRef = useRef<HTMLInputElement>(null);

    const handleDivClick = () => {
      inputRef.current?.focus();
    };

    const handleSubmit = async () => {
      setIsLoading(true);
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        setIsLoading(false);
        return;
      }
      const mailIds = selectedMails.map((mail) => mail.id);
      const requestData = {
        name,
        mails: mailIds,
      };

      try {
        const response = await fetch(
          `${baseUrl}/mail/create-group`,

          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${token}`,
            },
            body: JSON.stringify(requestData),
          }
        );

        if (response) {
          console.log(response.status);
          switch (response.status) {
            case 200:
              handleCloseDialog(ref);
              setName("");
              setSelectedMails([]);
              setErr("");
              setVisibleErr(false);
              props.fetchFunc();
              break;
            case 400:
              setErr("Verify your email.");
              break;
            case 409:
              setErr("Group name already exists, or its too long.");
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

    useWebSocketSearch({
      searchQuery: searchQueryMail,
      endpointPath: typeOfSearch === "Emails" ? "search-mail" : "search-group",
      setResults: setSearchMails,
      setLoader: setLoaderMailsSearch,
    });
    return (
      <dialog
        ref={ref}
        className="bg-white rounded-[40px] p-[32px] hidden flex-col items-center gap-[20px] sm:w-[55%] absolute left-[50%] top-[50%] -translate-x-[50%] -translate-y-[50%] overflow-visible"
      >
        <h6 className="text-[20px] leading-[20px] font-semibold text-n800">
          Create group
        </h6>
        <div className="flex flex-col w-full gap-[27px]">
          <div className="flex flex-col items-start gap-[7px] w-full">
            <label
              htmlFor="name"
              className="text-[15px] text-550 leading-[20px] font-medium"
            >
              Group name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              className="w-full rounded-[46px] h-[52px] shadow-md px-[24px]"
              placeholder="Enter group name"
              onChange={(eo) => {
                setName(eo.target.value);
              }}
            />

            {visibleErr && (
              <span className="text-[11px] text-[#DB2C2C] font-medium leading-[20px] ml-[15px]">
                {err}
              </span>
            )}
          </div>
          <div className="flex flex-col items-start gap-[7px] w-full">
            <div className="flex items-center justify-between w-full">
            <label
              htmlFor="members"
              className="text-[15px] text-550 leading-[20px] font-medium"
            >
              Group members
            </label>
            <div className="relative mr-4 z-50 p-1 rounded-[50%] border-[1px] border-n500">
                <svg
                  className="cursor-pointer"
                  onClick={() => {
                    setTypeOfSearchPopupVisible(!typeOfSearchPopupVisible);
                  }}
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="16"
                  viewBox="0 0 18 16"
                  fill="none"
                >
                  <path
                    d="M16.7077 8.00023H6.41185M2.77768 8.00023H1.29102M2.77768 8.00023C2.77768 7.51842 2.96908 7.05635 3.30977 6.71566C3.65046 6.37497 4.11254 6.18357 4.59435 6.18357C5.07616 6.18357 5.53824 6.37497 5.87893 6.71566C6.21962 7.05635 6.41102 7.51842 6.41102 8.00023C6.41102 8.48204 6.21962 8.94412 5.87893 9.28481C5.53824 9.6255 5.07616 9.8169 4.59435 9.8169C4.11254 9.8169 3.65046 9.6255 3.30977 9.28481C2.96908 8.94412 2.77768 8.48204 2.77768 8.00023ZM16.7077 13.5061H11.9177M11.9177 13.5061C11.9177 13.988 11.7258 14.4506 11.3851 14.7914C11.0443 15.1321 10.5821 15.3236 10.1002 15.3236C9.61837 15.3236 9.1563 15.1313 8.81561 14.7906C8.47491 14.45 8.28352 13.9879 8.28352 13.5061M11.9177 13.5061C11.9177 13.0241 11.7258 12.5624 11.3851 12.2216C11.0443 11.8808 10.5821 11.6894 10.1002 11.6894C9.61837 11.6894 9.1563 11.8808 8.81561 12.2215C8.47491 12.5622 8.28352 13.0243 8.28352 13.5061M8.28352 13.5061H1.29102M16.7077 2.4944H14.1202M10.486 2.4944H1.29102M10.486 2.4944C10.486 2.01259 10.6774 1.55051 11.0181 1.20982C11.3588 0.869133 11.8209 0.677734 12.3027 0.677734C12.5412 0.677734 12.7775 0.724724 12.9979 0.81602C13.2183 0.907316 13.4186 1.04113 13.5873 1.20982C13.756 1.37852 13.8898 1.57878 13.9811 1.79919C14.0724 2.0196 14.1193 2.25583 14.1193 2.4944C14.1193 2.73297 14.0724 2.9692 13.9811 3.18961C13.8898 3.41002 13.756 3.61028 13.5873 3.77898C13.4186 3.94767 13.2183 4.08149 12.9979 4.17278C12.7775 4.26408 12.5412 4.31107 12.3027 4.31107C11.8209 4.31107 11.3588 4.11967 11.0181 3.77898C10.6774 3.43829 10.486 2.97621 10.486 2.4944Z"
                    stroke="#A0A3BD"
                    stroke-width="1.25"
                    stroke-miterlimit="10"
                    strokeLinecap="round"
                  />
                </svg>
                {typeOfSearchPopupVisible && (
                  <div className="bg-white shadow-xl shadow-slate-400 p-[17px] rounded-[10px] flex flex-col items-start gap-[14px] absolute right-1 top-6">
                    <span className="text-[13px] text-n700 font-medium">
                      Search by :{" "}
                    </span>
                    <div className="flex items-center gap-[4px]">
                      <button
                        className={`px-[20px] py-[5px] rounded-[26px] border-[1px]  text-[12px] leading-[18px]  font-medium ${
                          typeOfSearch === "Emails"
                            ? "text-primary border-primary"
                            : "text-n600 border-n400"
                        }`}
                        onClick={() => {
                          setTypeOfSearch("Emails");
                        }}
                      >
                        Emails
                      </button>
                      <button
                        className={`px-[20px] py-[5px] rounded-[26px] border-[1px] text-[12px] leading-[18px] font-medium ${
                          typeOfSearch === "Groupes"
                            ? "text-primary border-primary"
                            : "text-n600 border-n400"
                        }`}
                        onClick={() => {
                          setTypeOfSearch("Groupes");
                        }}
                      >
                        Groupes
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div
              id="members"
              className="w-full h-[200px] flex gap-x-[13px] gap-y-[6px] rounded-[46px] shadow-md shadow-slate-300 px-[24px] py-[16px] flex-wrap overflow-auto relative"
              onClick={handleDivClick}
            >
              {selectedMails.length > 0 &&
                selectedMails.map((mail, index) => {
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-[6px] h-fit rounded-[22px] py-[5px] px-[8px] border-[1px] border-n300"
                    >
                      <span className="p-[4px] rounded-[50%] bg-[#EDEBFF]">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
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
                      <span className="text-[13px] text-n700 font-medium leading-[20px]">
                        {mail.email}
                      </span>
                      <span
                        className="text-n600 text-[12px] cursor-pointer font-light"
                        onClick={() => {
                          setSelectedMails(
                            selectedMails.filter(
                              (selectedMail) => selectedMail.id !== mail.id
                            )
                          );
                        }}
                      >
                        🗙
                      </span>
                    </div>
                  );
                })}
              <div className="relative w-[48%] h-fit">
                <input
                  type="text"
                  className="h-fit w-full text-[15px] text-n700 focus:outline-none"
                  ref={inputRef}
                  value={searchQueryMail}
                  onChange={(eo) => {
                    setSearchQueryMail(eo.target.value);
                  }}
                />

                {searchMails.length > 0 && searchQueryMail !== "" && (
                  <div
                    className={`bg-white shadow-xl py-[13px] flex flex-col items-start gap-[8px] rounded-[15px] w-fit ${
                      loaderMailsSearch && "px-[20px]"
                    }`}
                  >
                    {loaderMailsSearch ? (
                      <RotatingLines
                        strokeWidth="3"
                        strokeColor="#4A3AFF"
                        width="25"
                      />
                    ) : typeOfSearch === "Emails" ? (
                      searchMails.map((mail, index) => {
                        return (
                          <div
                            key={index}
                            className="flex items-center gap-[6px] cursor-pointer w-full px-[15px] hover:bg-gray-200"
                            onClick={() => {
                              const isMailAlreadySelected = selectedMails.some(
                                (selectedMail) => selectedMail.id === mail.id
                              );

                              if (!isMailAlreadySelected) {
                                setSelectedMails([...selectedMails, mail]);
                              }
                              setSearchQueryMail("");
                            }}
                          >
                            <img src="/avatar.png" alt="avatar" />
                            <span className="text-[14px] text-n600">
                              {mail.email}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      searchMails.map((group, index) => {
                        return (
                          <div
                            key={index}
                            className="flex items-center gap-[6px] cursor-pointer w-full px-[15px] hover:bg-gray-200"
                            onClick={async () => {
                            await  fetchGroupMembersForResmailArray(group.id,setSelectedMails,setIsLoading)
                              setSearchQueryMail("")
                            }} 
                          >
                            <img src="/avatar.png" alt="avatar" />
                            <span className="text-[14px] text-n600">
                              {group.name}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-[5px] w-full">
            <button
              className="py-[9px] px-[28px] rounded-[30px] bg-n300 border-[1px] border-n500 text-[12px] font-semibold leading-[20px] text-n700"
              onClick={() => {
                setName("");
                setSelectedMails([]);
                handleCloseDialog(ref);
              }}
            >
              Cancel
            </button>
            <button
              className="py-[9px] px-[28px] rounded-[30px] bg-primary border-[1px] border-n500 text-[12px] font-semibold leading-[20px] text-white"
              onClick={handleSubmit}
            >
              {isLoading ? (
                <RotatingLines strokeColor="white" width="20" />
              ) : (
                " Create group"
              )}
            </button>
          </div>
        </div>
      </dialog>
    );
  }
);

export default CreateGroupPopup;
