import Header from "../components/Header";
import SideBar from "../components/SideBar";
import AddEmailPopup from "../components/mails/AddEmailPopup";
import { handleOpenDialog } from "../func/openDialog";
import { useRef, useState, useEffect } from "react";
import { Resmail } from "../assets/types/Mails";
import { RotatingLines } from "react-loader-spinner";
import EmptyData from "../components/EmptyData";

const baseUrl = import.meta.env.VITE_BASE_URL;

const Individuals = () => {
  const addEmailDialogRef = useRef<HTMLDialogElement>(null);
  const editEmailDialogRef = useRef<HTMLDialogElement>(null);

  const [mails, setMails] = useState<Resmail[]>([]);
  const [selectedIndividual, setSelectedIndividual] = useState<number | null>(
    null
  );
  const [editMail, setEditMail] = useState<Resmail>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  console.log(mails)

  const fetchMails = async () => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return;
    }
    setIsLoading(true);

    const url = `http://${baseUrl}/mail/get-mails`;
    // setIsPageLoading(true);
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
      setMails(data);
    } catch (err) {
      console.error("Error: ", err);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMails = async () => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return;
    }

    const url = `http://${baseUrl}/mail/delete-mail`;
    try {
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          mail_id: selectedIndividual,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text(); // Read the response body as text
        console.error("Error response text: ", errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setSelectedIndividual(null);
      fetchMails();
    } catch (err) {
      console.error("Error: ", err);
    }
  };

  useEffect(() => {
    fetchMails();
  }, []);

  return (
    <div className="w-full flex md:h-[100vh]">
      <SideBar />
      <div className="lg:pl-[26px] md:pt-[32px] pt-[20px] lg:pr-[30px] sm:px-[30px] px-[15px] pb-[20px] flex flex-col gap-[26px] w-full md:h-[100vh] overflow-y-auto">
        <Header
          pageSentence="Here are information about mails groupes"
          searchBar={false}
        />
        <div className="w-full flex items-center gap-[8px]">
          <div className="relative flex-grow">
            <input
              type="search"
              name=""
              id=""
              className="w-full h-[44px] rounded-[40px] border-[1px] border-n300 shadow-md md:px-[54px] pl-[54px] pr-[15px] md:text-[14px] text-[12px]"
              placeholder="Search"
            />
            <svg
              className="absolute left-[20px] top-[50%] translate-y-[-50%]"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
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
          <button
            className="rounded-[30px] py-[12px] px-[25px] bg-primary text-white text-[14px] font-medium"
            onClick={() => {
              handleOpenDialog(addEmailDialogRef);
            }}
          >
            Add email{" "}
          </button>
        </div>

        <main className="w-full flex flex-col gap-[20px] rounded-[20px] border-n300 border-[1px] p-[25px]">
          <div className="w-full flex items-center justify-between py-[6px]">
            <h4 className="text-[20px] font-semibold text-n800 leading-[30px]">
              Mails
            </h4>
            <span
              onClick={deleteMails}
              aria-disabled={selectedIndividual === null ? true : false}
              className={`p-[8px] bg-n200 border-[1px] border-n400 rounded-[6px] ${
                selectedIndividual === null
                  ? " cursor-not-allowed"
                  : " cursor-pointer"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M18.412 6.5L17.611 20.117C17.5812 20.6264 17.3577 21.1051 16.9865 21.4551C16.6153 21.8052 16.1243 22.0001 15.614 22H8.386C7.87575 22.0001 7.38475 21.8052 7.0135 21.4551C6.64226 21.1051 6.41885 20.6264 6.389 20.117L5.59 6.5H3.5V5.5C3.5 5.36739 3.55268 5.24021 3.64645 5.14645C3.74021 5.05268 3.86739 5 4 5H20C20.1326 5 20.2598 5.05268 20.3536 5.14645C20.4473 5.24021 20.5 5.36739 20.5 5.5V6.5H18.412ZM10 2.5H14C14.1326 2.5 14.2598 2.55268 14.3536 2.64645C14.4473 2.74021 14.5 2.86739 14.5 3V4H9.5V3C9.5 2.86739 9.55268 2.74021 9.64645 2.64645C9.74021 2.55268 9.86739 2.5 10 2.5ZM9 9L9.5 18H11L10.6 9H9ZM13.5 9L13 18H14.5L15 9H13.5Z"
                  fill={`${
                    selectedIndividual === null ? "#6F6C8F" : "#df0505"
                  }`}
                />
              </svg>
            </span>
          </div>

          {isLoading ? (
            <div className="flex w-full items-center justify-center">
              <RotatingLines strokeWidth="4" strokeColor="#4A3AFF" width="60" />
            </div>
          ) : mails.length > 0 ? (
            <div
              className={`flex items-center gap-x-[13px] gap-y-[18px] w-full flex-wrap py-[16px] }`}
            >
              {mails.map((mail, index) => {
                return (
                  <div
                    key={index}
                    className={`cursor-pointer flex items-center gap-[12px] rounded-[22px] py-[7px] px-[11px]  ${
                      selectedIndividual === mail.id
                        ? "border-primary border-[2px]"
                        : "border-n300 border-[1px]"
                    } `}
                    onClick={() => {
                      if (selectedIndividual === mail.id) {
                        setSelectedIndividual(null);
                      } else {
                        setSelectedIndividual(mail.id);
                      }
                    }}
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

                    <svg
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditMail(mail);
                        handleOpenDialog(editEmailDialogRef);
                      }}
                      className="cursor-pointer ml-[2px] hover:scale-110"
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                    >
                      <path
                        d="M13.1238 2.45673C13.4363 2.14428 13.8602 1.96875 14.3021 1.96875C14.744 1.96875 15.1679 2.14428 15.4804 2.45673L17.5429 4.51923C17.6978 4.674 17.8206 4.85776 17.9044 5.06002C17.9882 5.26227 18.0313 5.47905 18.0313 5.69798C18.0313 5.9169 17.9882 6.13369 17.9044 6.33594C17.8206 6.53819 17.6978 6.72195 17.5429 6.87673L7.6321 16.7876L2.31543 17.6842L3.21293 12.3676L13.1238 2.45673ZM12.9329 5.00423L14.9954 7.06673L16.3646 5.69756L14.3021 3.63589L12.9329 5.00423ZM13.8163 8.24589L11.7546 6.18339L4.76793 13.1701L4.34876 15.6509L6.8296 15.2326L13.8163 8.24589Z"
                        fill="#514F6E"
                      />
                    </svg>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyData data="emails"/>
          )}
        </main>
      </div>
      <AddEmailPopup
        method="POST"
        fetchFunc={fetchMails}
        ref={addEmailDialogRef}
      />
      <AddEmailPopup
        method="PUT"
        fetchFunc={fetchMails}
        editMail={editMail}
        ref={editEmailDialogRef}
      />
    </div>
  );
};

export default Individuals;
